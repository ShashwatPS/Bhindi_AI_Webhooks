import getUserTokenFromCookies from '@/lib/cookies/getUserToken';
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
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);


const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);


const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);


const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00d68f]"></div>
);


interface RunFormData {
  prompt?: string;
  [key: string]: string | undefined;
}


const WebhookCard: FC<WebhookCardProps> = ({ trigger, onDelete }) => {
  const { id, title, type, prompt, additionalContext, createdAt } = trigger;
  const creationDate = new Date(createdAt).toLocaleDateString();
  const contextCount = additionalContext?.length || 0;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RunFormData>({
    prompt: '',
  });


  const getTemplateVariables = () => {
    if (type === 'Dynamic' || !prompt) return [];
    const matches = prompt.match(/\$\{(.*?)\}/g) || [];
    return [...new Set(matches.map(match => match.slice(2, -1).trim()))];
  };


  const templateVariables = getTemplateVariables();


  // Helper function to set nested object properties from dot notation
  const setNestedProperty = (obj: any, path: string, value: string) => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  };


  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };


  const handleRunWebhook = async () => {
    if (type === 'Dynamic' && !formData.prompt) {
      setRunError('Prompt is required for Dynamic hooks');
      return;
    }


    setIsLoading(true);
    setRunError(null);
    setRunSuccess(false);


    try {
      const authToken = await getUserTokenFromCookies();
      const payload: any = {
        authToken: authToken
      };


      if (type === 'Dynamic') {
        payload.prompt = formData.prompt;
      } else if (type === 'Textbased') {
        // Build nested object structure for template variables
        templateVariables.forEach(variable => {
          if (formData[variable]) {
            if (variable.includes('.')) {
              // Handle nested properties like "number.value"
              setNestedProperty(payload, variable, formData[variable]);
            } else {
              // Handle flat properties
              payload[variable] = formData[variable];
            }
          }
        });
      }


      const response = await fetch(`/api/webhook-lifecycle?triggerId=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });


      const result = await response.json();


      if (!response.ok) {
        throw new Error(result.error || 'Failed to run webhook');
      }


      setRunSuccess(true);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  const resetRunModal = () => {
    setFormData({
      prompt: '',
    });
    setRunSuccess(false);
    setRunError(null);
    setIsLoading(false);
  };


  const openRunModal = () => {
    resetRunModal();
    setIsRunModalOpen(true);
  };


  const closeRunModal = () => {
    setIsRunModalOpen(false);
    resetRunModal();
  };


  return (
    <>
      <div className="group relative bg-gradient-to-br from-[#1a1a1c] to-[#16161a] p-6 rounded-2xl border border-[#2a2a2e]/60 hover:border-[#00d68f]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00d68f]/10 backdrop-blur-sm h-72">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-xl text-[#f8fafc] truncate leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#00d68f]/15 text-[#00d68f] border border-[#00d68f]/20">
                {type}
              </span>
              <span className="text-xs text-[#a1a1aa] bg-[#2a2a2e]/50 px-2 py-1 rounded-md">
                {contextCount} context{contextCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
            <div className="relative">
              <button
                onClick={openRunModal}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2a2a2e]/80 border border-[#3a3a3e]/60 text-[#9ca3af] hover:text-[#00d68f] hover:bg-[#00d68f]/10 hover:border-[#00d68f]/30 transition-all duration-200 backdrop-blur-sm"
                title="Run webhook"
              >
                <PlayIcon />
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2a2a2e]/80 border border-[#3a3a3e]/60 text-[#9ca3af] hover:text-[#00d68f] hover:bg-[#00d68f]/10 hover:border-[#00d68f]/30 transition-all duration-200 backdrop-blur-sm"
                title="View details"
              >
                <ExpandIcon />
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={async() => await onDelete(id)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2a2a2e]/80 border border-[#3a3a3e]/60 text-[#9ca3af] hover:text-[#f87171] hover:bg-[#f87171]/10 hover:border-[#f87171]/30 transition-all duration-200 backdrop-blur-sm"
                title="Delete webhook"
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-[#3a3a3e] to-transparent mb-4" />
        
        <div className="space-y-4 overflow-y-auto pr-1 flex-1" style={{ maxHeight: '140px' }}>
          {prompt && (
            <div className="bg-[#1e1e20]/60 rounded-lg p-3 border border-[#2a2a2e]/40">
              <p className="text-xs text-[#9ca3af] mb-1.5 font-medium uppercase tracking-wide">Prompt</p>
              <p className="text-[#d1d5db] text-sm line-clamp-3 leading-relaxed">{prompt}</p>
            </div>
          )}
          {contextCount > 0 && (
            <div className="bg-[#1e1e20]/60 rounded-lg p-3 border border-[#2a2a2e]/40">
              <p className="text-xs text-[#9ca3af] mb-2 font-medium uppercase tracking-wide">Additional Context</p>
              <div className="space-y-2">
                {additionalContext.slice(0, 2).map((ctx, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-semibold text-[#00d68f]">{ctx.label}:</span>
                    <span className="text-[#d1d5db] ml-1 truncate block">{ctx.content}</span>
                  </div>
                ))}
                {contextCount > 2 && (
                  <p className="text-xs text-[#9ca3af] italic">+{contextCount - 2} more...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gradient-to-br from-[#1a1a1c] to-[#16161a] rounded-3xl border border-[#2a2a2e]/60 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex justify-between items-start gap-4 p-8 border-b border-[#2a2a2e]/40">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-[#f8fafc] mb-2 break-words leading-tight">
                  {title}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#00d68f]/15 text-[#00d68f] border border-[#00d68f]/20">
                    {type}
                  </span>
                  <p className="text-sm text-[#9ca3af]">Complete webhook details</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#2a2a2e]/80 border border-[#3a3a3e]/60 text-[#9ca3af] hover:text-[#f8fafc] hover:bg-[#3a3a3e] transition-all duration-200"
                  title="Close modal"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-8">
              {prompt && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00d68f] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#00d68f] rounded-full"></div>
                    Prompt
                  </h3>
                  <div className="bg-[#1e1e20]/80 rounded-xl p-6 border border-[#2a2a2e]/40">
                    <p className="text-[#d1d5db] leading-relaxed whitespace-pre-wrap break-words">
                      {prompt}
                    </p>
                  </div>
                </div>
              )}
              {contextCount > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00d68f] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#00d68f] rounded-full"></div>
                    Additional Context ({contextCount})
                  </h3>
                  <div className="space-y-3">
                    {additionalContext.map((ctx, i) => (
                      <div key={i} className="bg-[#1e1e20]/80 rounded-lg p-4 border border-[#2a2a2e]/40 overflow-hidden">
                        <h4 className="font-semibold text-[#00d68f] text-sm mb-2 flex items-center gap-2 overflow-hidden">
                          <div className="w-1.5 h-1.5 bg-[#00d68f] rounded-full flex-shrink-0"></div>
                          <span className="truncate">{ctx.label}</span>
                        </h4>
                        <p className="text-[#d1d5db] text-sm leading-relaxed break-words overflow-wrap-anywhere hyphens-auto">
                          {ctx.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-[#00d68f] mb-4 uppercase tracking-wide flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#00d68f] rounded-full"></div>
                  Metadata
                </h3>
                <div className="bg-[#1e1e20]/80 rounded-xl p-6 border border-[#2a2a2e]/40 overflow-hidden">
                  <div>
                    <p className="text-xs text-[#9ca3af] mb-2 uppercase tracking-wide">Webhook URL</p>
                    <p className="text-[#f8fafc] font-mono text-sm bg-[#0a0a0a]/50 p-3 rounded-lg border border-[#2a2a2e]/40 overflow-hidden break-all">
                      {`${window.location.origin}`+id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-[#2a2a2e]/40 p-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gradient-to-r from-[#00d68f] to-[#00c578] text-black rounded-xl hover:from-[#00c578] hover:to-[#00b569] transition-all duration-200 font-medium shadow-lg shadow-[#00d68f]/20"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {isRunModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gradient-to-br from-[#1a1a1c] to-[#16161a] rounded-3xl border border-[#2a2a2e]/60 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex justify-between items-start gap-4 p-8 border-b border-[#2a2a2e]/40">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-[#f8fafc] mb-2 break-words leading-tight">
                  Run Webhook: {title}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#00d68f]/15 text-[#00d68f] border border-[#00d68f]/20">
                    {type}
                  </span>
                  <p className="text-sm text-[#9ca3af]">Test your webhook with custom values</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={closeRunModal}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#2a2a2e]/80 border border-[#3a3a3e]/60 text-[#9ca3af] hover:text-[#f8fafc] hover:bg-[#3a3a3e] transition-all duration-200"
                  title="Close modal"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
              <div className="space-y-6">
                {type === 'Dynamic' && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#00d68f] mb-4 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#00d68f] rounded-full"></div>
                      Prompt
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-[#d1d5db] mb-2">
                        Prompt *
                      </label>
                      <textarea
                        value={formData.prompt}
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-[#1e1e20]/80 border border-[#2a2a2e]/60 rounded-lg text-[#f8fafc] placeholder-[#9ca3af] focus:outline-none focus:border-[#00d68f]/50 focus:ring-1 focus:ring-[#00d68f]/50 transition-all duration-200 resize-none"
                        placeholder="Enter your prompt for this dynamic webhook"
                      />
                    </div>
                  </div>
                )}


                {type === 'Textbased' && templateVariables.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#00d68f] mb-4 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#00d68f] rounded-full"></div>
                      Template Variables
                    </h3>
                    <div className="space-y-4">
                      {templateVariables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm font-medium text-[#d1d5db] mb-2">
                            {variable}
                            {variable.includes('.') && (
                              <span className="text-xs text-[#9ca3af] ml-2">
                                (nested: {variable.split('.').join(' → ')})
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={formData[variable] || ''}
                            onChange={(e) => handleInputChange(variable, e.target.value)}
                            className="w-full px-4 py-3 bg-[#1e1e20]/80 border border-[#2a2a2e]/60 rounded-lg text-[#f8fafc] placeholder-[#9ca3af] focus:outline-none focus:border-[#00d68f]/50 focus:ring-1 focus:ring-[#00d68f]/50 transition-all duration-200"
                            placeholder={`Enter value for ${variable}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {runSuccess && (
                  <div className="bg-[#00d68f]/10 border border-[#00d68f]/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00d68f] rounded-full"></div>
                      <p className="text-[#00d68f] text-sm font-medium">Webhook executed successfully!</p>
                    </div>
                  </div>
                )}


                {runError && (
                  <div className="bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#f87171] rounded-full"></div>
                      <p className="text-[#f87171] text-sm font-medium">Error: {runError}</p>
                    </div>
                  </div>
                )}


                <div className="flex gap-3">
                  <button
                    onClick={handleRunWebhook}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d68f] to-[#00c578] text-black rounded-xl hover:from-[#00c578] hover:to-[#00b569] transition-all duration-200 font-medium shadow-lg shadow-[#00d68f]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayIcon />
                        Run Webhook
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeRunModal}
                    className="px-6 py-3 bg-[#2a2a2e]/80 border border-[#3a3a3e]/60 text-[#d1d5db] rounded-xl hover:bg-[#3a3a3e] transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default WebhookCard;