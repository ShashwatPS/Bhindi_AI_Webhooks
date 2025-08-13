"use client";

import { useEffect, useState, useRef } from "react";
import { createWebHook, getAllTriggers } from "@/lib/api/createWeebhook";
import getUserIdFromCookies from "@/lib/cookies/getUserIdCookie";
import WebhookCard from "@/components/WebHook";

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

  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    try {
      if (!userId) throw new Error("No userId set");

      await createWebHook(title, prompt, userId, additionalContext, webhookType);

      alert("Webhook created successfully!");
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
      console.error(err);
      alert("Error creating webhook");
    }
  };

  return (
    <div className="h-screen bg-[#1c1c1e] text-white font-sans flex flex-col">
      <div className="flex items-center justify-between border-b border-[#2f2f31] px-6 py-4 bg-[#1c1c1e]/80">
        <h1 className="text-2xl font-semibold">Webhooks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#00c584] hover:bg-[#00a870] text-white font-semibold py-2 px-5 rounded-lg shadow-md"
        >
          + Create Webhook
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">All Webhooks</h2>
        {loadingTriggers ? (
          <p className="text-gray-400">Loading...</p>
        ) : triggers.length === 0 ? (
          <p className="text-gray-500">No webhooks found. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {triggers.map((trigger) => (
              <WebhookCard key={trigger.id} trigger={trigger} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur">
          <div className="bg-[#2c2c2e] p-8 rounded-xl w-full max-w-2xl shadow-xl border border-[#3a3a3c] animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b border-[#3a3a3c] pb-3">
              <h3 className="text-xl font-semibold">Create Webhook</h3>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:text-white/80"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm text-gray-300 mb-1">Webhook Type</label>
            <div className="relative mb-6" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-2 bg-[#1c1c1e] border border-[#3a3a3c] rounded-md flex justify-between items-center hover:border-[#00c584]"
              >
                <span>{webhookType === "Dynamic" ? "Dynamic Prompt" : "Dynamic Text"}</span>
                <span>▾</span>
              </button>
              {dropdownOpen && (
                <div className="absolute mt-1 w-full bg-[#1c1c1e] border border-[#3a3a3c] rounded-md shadow-lg overflow-hidden">
                  {[
                    { label: "Dynamic Prompt", value: "Dynamic" as const },
                    { label: "Dynamic Text", value: "Textbased" as const },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`w-full text-left px-4 py-2 hover:bg-[#00c584] hover:text-black ${
                        webhookType === option.value ? "bg-white/5" : ""
                      }`}
                      onClick={() => {
                        setWebhookType(option.value);
                        setDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="block text-sm text-gray-300 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Webhook title"
              className="w-full mb-6 px-3 py-2 bg-[#1c1c1e] border border-[#3a3a3c] rounded-md"
            />

            {webhookType === "Textbased" && (
              <>
                <label className="block text-sm text-gray-300 mb-1">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt..."
                  className="w-full mb-6 px-3 py-2 bg-[#1c1c1e] border border-[#3a3a3c] rounded-md min-h-[96px]"
                />
              </>
            )}

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm text-gray-300">Additional Context</label>
                <button
                  onClick={addContextField}
                  className="text-[#00c584] text-sm hover:underline"
                >
                  + Add Context
                </button>
              </div>
              <div className="space-y-3">
                {additionalContext.map((ctx, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      value={ctx.label}
                      onChange={(e) => updateContextField(index, "label", e.target.value)}
                      placeholder="Label"
                      className="w-1/3 px-3 py-2 bg-[#1c1c1e] border border-[#3a3a3c] rounded-md"
                    />
                    <textarea
                      value={ctx.content}
                      onChange={(e) => updateContextField(index, "content", e.target.value)}
                      placeholder="Content"
                      className="w-2/3 px-3 py-2 bg-[#1c1c1e] border border-[#3a3a3c] rounded-md min-h-[60px]"
                    />
                    <button
                      onClick={() => removeContextField(index)}
                      className="h-10 w-10 flex items-center justify-center rounded-md text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 bg-[#00c584] hover:bg-[#00a870] py-2 px-4 rounded-lg font-semibold shadow-md"
              >
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebHooksPage;
