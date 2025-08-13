"use server"

import { pClient } from "../db";
import { typeOfTrigger } from "@prisma/client";


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

export const getWebHook = async (id: string, userId: string) => {
    try {
      const trigger = await pClient.trigger.findUnique({
        where: { id },
      });
  
      if (!trigger || trigger.userId !== userId) {
        throw new Error("Webhook not found or access denied");
      }
  
      return trigger;
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


//   const body = {
//     title,
//     input: {
//       text: [
//         { label: "Instructions", content: `${prompt}` },
//         ...additionalContext 
//       ]
//     },
//     cronExpression: "0 45 2 13 8 *",
//     recurring: false
//   };

//   const response = await fetch(
//     "https://client-api.bhindi.io/api/background-tasks/schedules",
//     {
//       method: "POST",
//       headers: {
//         accept: "application/json",
//         "content-type": "application/json",
//         authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify(body)
//     }
//   );

//   if (!response.ok) {
//     throw new Error(`Failed to create webhook: ${response.status}`);
//   }

//   const data = await response.json();
//   return data;