"use client";

import { useEffect, useState, useRef } from "react";
import { createWebHook, getAllTriggers, deleteWebHook, updateWebHook } from "@/lib/api/createWeebhook";
import getUserIdFromCookies from "@/lib/cookies/getUserIdCookie";
import WebhookCard from "@/components/WebHook";
import { toast } from "sonner";
import deleteUserTokenFromCookies from "@/lib/cookies/deleteUserToken"

type AdditionalContextItem = { label: string; content: string };
type Webhook = {
  id: string;
  title: string;
  type: string;
  prompt?: string;
  additionalContext: AdditionalContextItem[];
  createdAt: string;
};

const WebHooksPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [webhookType, setWebhookType] = useState<"Dynamic" | "Textbased">("Dynamic");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [additionalContext, setAdditionalContext] = useState<AdditionalContextItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [triggers, setTriggers] = useState<Webhook[]>([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const onDelete = async (triggerId: string) => {
    try {
      await deleteWebHook(triggerId);
      setTriggers(triggers.filter(({ id }) => (id !== triggerId)));
      toast.message("Webhook Deleted Successfully");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await deleteUserTokenFromCookies();
      toast.message("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const id = await getUserIdFromCookies();
        if (!id) throw new Error("No userId found");
        setUserId(id);

        setLoadingTriggers(true);
        const data = await getAllTriggers(id);
        //@ts-expect-error idk
        setTriggers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTriggers(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const addContextField = () =>
    setAdditionalContext([...additionalContext, { label: "", content: "" }]);

  const updateContextField = (index: number, field: keyof AdditionalContextItem, value: string) => {
    const updated = [...additionalContext];
    updated[index][field] = value;
    setAdditionalContext(updated);
  };

  const removeContextField = (index: number) =>
    setAdditionalContext(additionalContext.filter((_, i) => i !== index));

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.message("Please enter a webhook title");
      return;
    }

    if (webhookType === "Textbased" && !prompt.trim()) {
      toast.message("Please enter a prompt for text-based webhook");
      return;
    }

    try {
      if (!userId) throw new Error("No userId set");

      setIsCreating(true);
      await createWebHook(title, prompt, userId, additionalContext, webhookType);

      toast.message("Webhook created successfully!");
      setShowModal(false);
      setTitle("");
      setPrompt("");
      setAdditionalContext([]);

      setLoadingTriggers(true);
      const data = await getAllTriggers(userId);
      //@ts-expect-error idk
      setTriggers(data);
      setLoadingTriggers(false);
    } catch (err) {
      toast.error("Error creating webhook");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPrompt("");
    setAdditionalContext([]);
    setWebhookType("Dynamic");
    setDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="h-screen bg-[#1c1c1e] text-white font-sans flex flex-col">
      <div className="flex items-center justify-between border-b border-[#2f2f31] px-4 sm:px-6 py-3 sm:py-4 bg-[#1c1c1e]/80">
        <h1 className="text-xl sm:text-2xl font-semibold">Webhooks</h1>
        
        <div className="flex items-center gap-2">
          {/* Create Webhook Button - More Subtle */}
          <button
            onClick={() => setShowModal(true)}
            className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00c584]/30 text-gray-300 hover:text-white font-medium py-1.5 px-3 sm:px-4 rounded-md transition-all duration-300 text-sm flex items-center gap-1.5 sm:gap-2"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Create</span>
            <span className="sm:hidden sr-only">Create Webhook</span>
            
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00c584] group-hover:w-full transition-all duration-300" />
          </button>
          
          <button
            onClick={async() => await handleLogout()}
            className="group relative overflow-hidden bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-400/30 text-gray-400 hover:text-red-300 font-medium py-1.5 px-2 sm:px-3 rounded-md transition-all duration-300 text-sm flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">Logout</span>
            
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-400 group-hover:w-full transition-all duration-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {loadingTriggers ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Loading webhooks...</span>
            </div>
          </div>
        ) : triggers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-medium mb-2">No webhooks yet</p>
            <p className="text-gray-500 text-sm mb-6 max-w-md">Create your first webhook to start automating your workflows and integrations.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#00c584]/10 hover:bg-[#00c584]/20 border border-[#00c584]/30 hover:border-[#00c584]/50 text-[#00c584] font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create your first webhook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {triggers.map((trigger) => (
              <WebhookCard key={trigger.id} trigger={trigger} onDelete={onDelete}/>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-gradient-to-br from-[#2c2c2e] to-[#1e1e20] rounded-xl sm:rounded-2xl w-full max-w-2xl sm:max-w-3xl shadow-2xl border border-[#3a3a3c]/50 animate-in fade-in zoom-in duration-300 max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-[#00c584]/10 to-transparent p-4 sm:p-6 border-b border-[#3a3a3c]/30 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white">Create Webhook</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Set up your webhook configuration</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isCreating}
                  className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 group disabled:opacity-50"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-sm font-medium text-gray-200">
                    Webhook Type <span className="text-gray-400">*</span>
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      disabled={isCreating}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1c1c1e] border border-[#3a3a3c] rounded-lg sm:rounded-xl flex justify-between items-center hover:border-[#00c584]/50 transition-all duration-200 focus:border-[#00c584] focus:ring-2 focus:ring-[#00c584]/20 disabled:opacity-50 text-sm sm:text-base"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${webhookType === "Dynamic" ? "bg-blue-500" : "bg-purple-500"}`} />
                        <span className="text-white">{webhookType === "Dynamic" ? "Dynamic" : "Text-based"}</span>
                      </div>
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute mt-2 w-full bg-[#1c1c1e] border border-[#3a3a3c] rounded-lg sm:rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                        {[
                          { label: "Dynamic Prompt", value: "Dynamic" as const, description: "Flexible prompt-based webhook" },
                          { label: "Text-based Webhook", value: "Textbased" as const, description: "Dynamic text content webhook" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#00c584]/10 transition-all duration-200 border-b border-[#3a3a3c]/30 last:border-b-0 ${
                              webhookType === option.value ? "bg-[#00c584]/5 border-r-2 border-r-[#00c584]" : ""
                            }`}
                            onClick={() => {
                              setWebhookType(option.value);
                              setDropdownOpen(false);
                            }}
                          >
                            <div>
                              <div className="text-white font-medium text-sm sm:text-base">{option.label}</div>
                              <div className="text-gray-400 text-xs mt-0.5 hidden sm:block">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-sm font-medium text-gray-200">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter webhook title"
                    disabled={isCreating}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1c1c1e] border border-[#3a3a3c] rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:border-[#00c584] focus:ring-2 focus:ring-[#00c584]/20 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                  />
                </div>

                {webhookType === "Textbased" && (
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-sm font-medium text-gray-200">
                      Prompt <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your webhook prompt..."
                      disabled={isCreating}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1c1c1e] border border-[#3a3a3c] rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:border-[#00c584] focus:ring-2 focus:ring-[#00c584]/20 transition-all duration-200 min-h-[80px] sm:min-h-[100px] resize-y disabled:opacity-50 text-sm sm:text-base"
                    />
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-200">Additional Context</label>
                      <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Add extra context or variables</p>
                    </div>
                    <button
                      onClick={addContextField}
                      disabled={isCreating}
                      className="bg-[#00c584]/10 hover:bg-[#00c584]/20 text-[#00c584] px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border border-[#00c584]/30 hover:border-[#00c584]/50 disabled:opacity-50"
                    >
                      + Add
                    </button>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {additionalContext.map((ctx, index) => (
                      <div key={index} className="bg-[#1a1a1c] p-2.5 sm:p-3 rounded-lg border border-[#2f2f31] animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-300">Context #{index + 1}</span>
                          <button
                            onClick={() => removeContextField(index)}
                            disabled={isCreating}
                            className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 disabled:opacity-50"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2 sm:grid sm:grid-cols-3 sm:gap-2 sm:space-y-0">
                          <input
                            value={ctx.label}
                            onChange={(e) => updateContextField(index, "label", e.target.value)}
                            placeholder="Label"
                            disabled={isCreating}
                            className="w-full px-2.5 py-2 bg-[#0f0f10] border border-[#3a3a3c] rounded text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#00c584] focus:ring-1 focus:ring-[#00c584]/20 transition-all duration-200 disabled:opacity-50"
                          />
                          <textarea
                            value={ctx.content}
                            onChange={(e) => updateContextField(index, "content", e.target.value)}
                            placeholder="Content..."
                            disabled={isCreating}
                            className="w-full sm:col-span-2 px-2.5 py-2 bg-[#0f0f10] border border-[#3a3a3c] rounded text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#00c584] focus:ring-1 focus:ring-[#00c584]/20 transition-all duration-200 min-h-[50px] sm:min-h-[60px] resize-y disabled:opacity-50"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {additionalContext.length === 0 && (
                      <div className="text-center py-4 sm:py-6 text-gray-500">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16l5-3 5 3V4H7z" />
                        </svg>
                        <p className="text-xs sm:text-sm">No additional context added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1a1a1c] to-[#1c1c1e] border-t border-[#3a3a3c]/30 flex-shrink-0">
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleCloseModal}
                  disabled={isCreating}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium transition-all duration-200 border border-white/10 hover:border-white/20 disabled:opacity-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !title.trim() || (webhookType === "Textbased" && !prompt.trim())}
                  className="flex-1 bg-gradient-to-r from-[#00c584] to-[#00a870] hover:from-[#00a870] hover:to-[#009660] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Creating...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="hidden sm:inline">Create Webhook</span>
                      <span className="sm:hidden">Create</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebHooksPage;
