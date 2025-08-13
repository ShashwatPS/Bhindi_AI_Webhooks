import type { FC } from 'react';

type Webhook = {
  id: string;
  title: string;
  type: string;
  prompt?: string;
  additionalContext: { label: string; content: string }[];
  createdAt: string;
};

type WebhookCardProps = {
  trigger: Webhook;
};

const WebhookCard: FC<WebhookCardProps> = ({ trigger }) => {
  const { title, type, prompt, additionalContext, createdAt } = trigger;

  const creationDate = new Date(createdAt).toLocaleDateString();
  const contextCount = additionalContext?.length || 0;

  return (
    <div className="bg-[#1e1e20] p-5 rounded-xl border border-[#2e2e32] h-64 flex flex-col justify-between hover:border-[#00d68f] transition-colors duration-200">
      
      <div className="flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-[#f8fafc] truncate pr-2">
            {title}
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-[#00d68f]/20 text-[#00d68f] flex-shrink-0">
            {type}
          </span>
        </div>

        <hr className="border-t border-[#323236] mb-3" />

        <div className="space-y-4 overflow-y-auto pr-1 overflow-auto">
          {prompt && (
            <div>
              <p className="text-xs text-[#a1a1aa] mb-1 font-medium">Prompt:</p>
              <p className="text-[#d1d5db] text-sm line-clamp-3">
                {prompt}
              </p>
            </div>
          )}

          {contextCount > 0 && (
            <div>
              <p className="text-xs text-[#a1a1aa] mb-1 font-medium">Additional Context:</p>
              <div className="space-y-1">
                {additionalContext.map((ctx, i) => (
                  <div key={i} className="text-xs truncate">
                    <span className="font-semibold text-[#00d68f]">{ctx.label}:</span>
                    <span className="text-[#d1d5db] ml-1">{ctx.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-[#a1a1aa] border-t border-[#323236] pt-3 mt-4">
        <span>{creationDate}</span>
        <span>{contextCount} Context(s)</span>
      </div>
    </div>
  );
};

export default WebhookCard;
