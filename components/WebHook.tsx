import type { FC } from 'react';
import { useState } from 'react';

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
  onDelete: (id: string) => void;
};

const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V4a1 1 0 011-1h3m0 0l-3 3m3-3v0M21 7V4a1 1 0 00-1-1h-3m0 0l3 3m-3-3v0M3 17v3a1 1 0 001 1h3m0 0l-3-3m3 3v0M21 17v3a1 1 0 01-1 1h-3m0 0l3-3m-3 3v0" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WebhookCard: FC<WebhookCardProps> = ({ trigger, onDelete }) => {
  const { id, title, type, prompt, additionalContext, createdAt } = trigger;

  const creationDate = new Date(createdAt).toLocaleDateString();
  const contextCount = additionalContext?.length || 0;

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Card (same as before) */}
      <div className="bg-[#1e1e20] p-5 rounded-xl border border-[#2e2e32] h-64 flex flex-col justify-between hover:border-[#00d68f] transition-colors duration-200">
        <div className="flex flex-col overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg text-[#f8fafc] truncate pr-2 flex-1">
              {title}
            </h3>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-200 group"
                title="Expand details"
              >
                <ExpandIcon />
              </button>

              <button
                onClick={() => onDelete(id)}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 group"
                title="Delete webhook"
              >
                <DeleteIcon />
              </button>

              <span className="text-xs px-3 py-1 rounded-full bg-[#00d68f]/20 text-[#00d68f] flex-shrink-0 font-medium">
                {type}
              </span>
            </div>
          </div>

          <hr className="border-t border-[#323236] mb-3" />

          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {prompt && (
              <div>
                <p className="text-xs text-[#a1a1aa] mb-1 font-medium">Prompt:</p>
                <p className="text-[#d1d5db] text-sm line-clamp-3 leading-relaxed">{prompt}</p>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1e1e20] rounded-2xl border border-[#2e2e32] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-start gap-4 p-6 border-b border-[#323236] min-h-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[#f8fafc] mb-1 break-words leading-tight">
                  {title}
                </h2>
                <p className="text-sm text-[#a1a1aa]">Complete webhook information</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-[#2e2e32] text-[#a1a1aa] hover:text-white transition-all duration-200 flex-shrink-0"
                title="Close modal"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#00d68f] mb-2 uppercase tracking-wide">Title</h3>
                  <p className="text-[#f8fafc] text-base font-medium break-words leading-relaxed">
                    {title}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#00d68f] mb-2 uppercase tracking-wide">Type</h3>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#00d68f]/20 text-[#00d68f] text-sm font-medium">
                    {type}
                  </span>
                </div>
              </div>

              {prompt && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00d68f] mb-3 uppercase tracking-wide">Prompt</h3>
                  <div className="bg-[#2a2a2e] rounded-lg p-4 border border-[#323236]">
                    <p className="text-[#d1d5db] leading-relaxed whitespace-pre-wrap break-words">
                      {prompt}
                    </p>
                  </div>
                </div>
              )}

              {contextCount > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00d68f] mb-3 uppercase tracking-wide">
                    Additional Context ({contextCount})
                  </h3>
                  <div className="space-y-3">
                    {additionalContext.map((ctx, i) => (
                      <div key={i} className="bg-[#2a2a2e] rounded-lg p-4 border border-[#323236]">
                        <h4 className="font-semibold text-[#00d68f] text-sm mb-2 break-words">
                          {ctx.label}
                        </h4>
                        <p className="text-[#d1d5db] leading-relaxed break-words">{ctx.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#00d68f] mb-3 uppercase tracking-wide">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#2a2a2e] rounded-lg p-4 border border-[#323236]">
                    <p className="text-xs text-[#a1a1aa] mb-1">Created Date</p>
                    <p className="text-[#f8fafc] font-medium">{creationDate}</p>
                  </div>
                  <div className="bg-[#2a2a2e] rounded-lg p-4 border border-[#323236] min-w-0">
                    <p className="text-xs text-[#a1a1aa] mb-1">Webhook ID</p>
                    <p className="text-[#f8fafc] font-mono text-sm break-all">{id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#323236] p-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#a1a1aa]">
                  Last updated: {creationDate}
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#00d68f] text-black rounded-lg hover:bg-[#00d68f]/90 transition-colors duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WebhookCard;
