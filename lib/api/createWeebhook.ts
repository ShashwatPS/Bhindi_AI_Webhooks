"use server"

import { pClient } from "../db";
import { typeOfTrigger } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

const BASE_URL = 'https://client-api.bhindi.io/api/background-tasks/schedules';

export const createWebHook = async (
    title: string,
    prompt: string,
    userId: string,
    additionalContext: { label: string; content: string }[],
    type: typeOfTrigger
  ) => {
    try {
      const createdTrigger = await pClient.trigger.create({
        data: {
          type,  
          title,
          prompt,
          userId,
          additionalContext,
        },
      });
      return createdTrigger;
    } catch (error) {
      console.error(error);
      throw new Error("Having trouble creating a webhook");
    }
};

export const getWebHook = async (id: string) => {
    try {
      const trigger = await pClient.trigger.findUnique({
        where: { id },
      });
  
      if (!trigger) {
        throw new Error("Webhook not found or access denied");
      }
  
      return trigger;
    } catch (error) {
      console.error(error);
      throw new Error("Having trouble fetching the webhook");
    }
};

export const getWebHookData = async (id: string) => {
  try {
    const trigger = await pClient.trigger.findUnique({
      where: { id },
    });

    if (!trigger) {
      throw new Error("Webhook not found or access denied");
    }

    return {"storedPrompt": trigger.prompt, "hookType": trigger.type};
  } catch (error) {
    console.error(error);
    throw new Error("Having trouble fetching the webhook");
  }
};


export const getAllTriggers = async (userId: string) => {
    try {
      const triggers = await pClient.trigger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      
      return triggers;
    } catch (error) {
      console.error(error);
      throw new Error("Having trouble fetching triggers");
    }
};

export const createTriggerRun = async (triggerId: string, metadata: JsonValue) => {
  try {
    const triggerRun = await pClient.triggerRun.create({
      data: {
        triggerId,
        metadata: metadata as Prisma.InputJsonValue ,
      },
    });
    return triggerRun;
  } catch (error) {
    console.error(error);
    throw new Error("Having trouble creating trigger run record");
  }
};

function createHeaders(includeContentType = false, authToken: string) {
  const headers = new Headers();
  headers.append("accept", "application/json");
  headers.append("authorization", `Bearer ${authToken}`);
  headers.append("x-timezone", "Asia/Calcutta");
  
  if (includeContentType) {
    headers.append("content-type", "application/json");
  }
  
  return headers;
}


function generateCronExpression(): string {
  const now = new Date();
  
  const targetTime = new Date(now.getTime() + 60 * 60 * 1000);
  
  const minutes = targetTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 5) * 5;
  
  if (roundedMinutes >= 60) {
    targetTime.setHours(targetTime.getHours() + 1);
    targetTime.setMinutes(0);
  } else {
    targetTime.setMinutes(roundedMinutes);
  }
  
  const minute = targetTime.getMinutes();
  const hour = targetTime.getHours();
  const day = targetTime.getDate();
  const month = targetTime.getMonth() + 1;
  
  return `${minute} ${hour} ${day} ${month} *`;
}

async function createWebhookExternal(title: string, instructions: string, additionalContexts: string[] = [], cronExpression: string | null = null, recurring = false, authToken: string) {
  try {
    const payload: {
      title: string;
      input: { text: { label: string; content: string }[] };
      recurring: boolean;
      cronExpression?: string;
    } = {
      title,
      input: {
        text: [
          {
            label: "Instructions",
            content: instructions
          },
          ...additionalContexts.map(context => ({
            label: "Additional Context",
            content: context
          }))
        ]
      },
      recurring
    };

    if (cronExpression) {
      payload.cronExpression = cronExpression;
    }

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: createHeaders(true, authToken),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to create webhook: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('External webhook created:', result);
    return result;
  } catch (error) {
    console.error('Error creating external webhook:', error);
    throw error;
  }
}

async function triggerWebhookExternal(webhookId: string, authToken : string) {
  try {
    const response = await fetch(`${BASE_URL}/${webhookId}/trigger`, {
      method: "POST",
      headers: createHeaders(false, authToken)
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger webhook: ${response.status} ${response.statusText}`);
    }

    const result = await response.text();
    console.log('Webhook triggered:', result);
    return result;
  } catch (error) {
    console.error('Error triggering webhook:', error);
    throw error;
  }
}

async function deleteWebhookExternal(webhookId: string, authToken: string) {
  try {
    const response = await fetch(`${BASE_URL}/${webhookId}`, {
      method: "DELETE",
      headers: createHeaders(false, authToken)
    });

    if (!response.ok) {
      throw new Error(`Failed to delete webhook: ${response.status} ${response.statusText}`);
    }

    const result = await response.text();
    console.log('Webhook deleted:', result);
    return result;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
}

export const webhookLifecycle = async(triggerId: string, authToken: string, prompt: string) => {
  try {
    console.log('Starting webhook lifecycle...');

    const cronExpression = generateCronExpression();
    const recurring = false; 

    console.log(`Generated cron expression: ${cronExpression}`);

    const triggerData = await getWebHook(triggerId);
    console.log('Fetched trigger data:', triggerData);

    const additionalContexts = (triggerData.additionalContext as { label:string, content: string }[])?.map((ctx) => ctx?.content) || [];

    const externalWebhook = await createWebhookExternal(
      triggerData.title,
      triggerData.prompt,
      additionalContexts,
      cronExpression,
      recurring,
      authToken
    );

    const externalWebhookId = externalWebhook.id || externalWebhook._id;

    if (!externalWebhookId) {
      throw new Error('External webhook ID not found in response');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const triggerResult = await triggerWebhookExternal(externalWebhookId, authToken);
    
    const triggerRunMetadata = {
      externalWebhookId,
      triggerResult,
      triggerData: {
        title: triggerData.title,
        type: triggerData.type,
        prompt
      },
    };

    const triggerRun = await createTriggerRun(triggerId, triggerRunMetadata);
    console.log('Created trigger run record:', triggerRun);

    await new Promise(resolve => setTimeout(resolve, 1000));
    await deleteWebhookExternal(externalWebhookId, authToken);

    console.log('Webhook lifecycle completed successfully!');
    
    return {
      triggerData,
      externalWebhook,
      triggerRun,
      cronExpression,
      success: true
    };
  } catch (error) {
    console.error('Webhook lifecycle failed:', error);
    
    try {
      const failedMetadata = {
        status: 'failed'
      };
      await createTriggerRun(triggerId, failedMetadata);
    } catch (dbError) {
      console.error('Failed to create error trigger run record:', dbError);
    }
    
    throw error;
  }
}
