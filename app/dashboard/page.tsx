"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  // Trophy,
  // Bookmark,
  // FileText,
  // DollarSign,
  // Send,
  Sparkles,
  Plus,
  Search,
} from "lucide-react";
// import { useAuth } from "@/app/providers/authProvider";

// import React, { useState, useRef, useEffect } from "react";
import { Trophy, Bookmark, FileText, DollarSign, Send } from "lucide-react";
import { useAuth } from "@/app/providers/authProvider";
import { createClient } from "@/lib/supabase/client";

// 1. Define message types for internal state
type Message = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

export default function ScholaraDashboard() {
  // Inside ScholaraDashboard component
  const [savedCount, setSavedCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  // Fetch stats on load
  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient(); // Use your client-side supabase client here
      const { data } = await supabase
        .from("scholarships")
        .select("amount_estimated");
      if (data) {
        setSavedCount(data.length);
        const total = data.reduce(
          (sum, item) => sum + (Number(item.amount_estimated) || 0),
          0,
        );
        setTotalValue(total);
      }
    };
    fetchStats();
  }, []);

  const saveScholarship = async (scholarship: any) => {
    const res = await fetch("/api/scholarships/save", {
      method: "POST",
      body: JSON.stringify(scholarship),
    });
    if (res.ok) {
      setSavedCount((prev) => prev + 1);
      setTotalValue((prev) => prev + scholarship.amount);
      alert("Scholarship saved!");
    }
  };
  const { profile } = useAuth();

  // 2. Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm ready to find the best scholarships for you. What would you like to search for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. Integration Function
  const handleSendMessage = async (userQuery?: string) => {
    const query = userQuery || input;
    if (!query || loading) return;

    setLoading(true);
    setInput("");

    // Add user message to UI
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: query },
    ];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch");

      // Add Gemini's response to UI
      setMessages([...newMessages, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I couldn't reach the search engine. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans p-4">
      <header className="flex justify-between items-center mb-6 px-4">
        <h1 className="text-2xl font-serif text-[#eec67a] font-bold italic">
          Scholara
        </h1>
        <div className="flex gap-4 items-center">
          <div className="bg-[#1c1f26] border border-[#eec67a]/30 px-4 py-1.5 rounded-full text-xs text-[#eec67a] flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full bg-[#eec67a] ${loading ? "animate-ping" : "animate-pulse"}`}
            />
            {messages.filter((m) => m.role === "assistant").length - 1} matches
            discussed
          </div>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto h-[calc(100vh-100px)]">
        {/* LEFT SIDEBAR: Profile & Stats */}
        <section className="col-span-3 space-y-6 overflow-y-auto pr-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            Your Profile
          </p>
          <div className="bg-[#161a22] rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-xl font-bold text-[#eec67a] mb-1">
              {profile?.full_name || "Student"}
            </h2>
            <p className="text-xs text-slate-500 mb-4 capitalize">
              {profile?.education_level} • {profile?.major} •{" "}
              {profile?.location_state}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Matches found"
                value={String(
                  messages.filter((m) => m.role === "assistant").length,
                )}
                icon={<Trophy size={14} />}
              />
              <StatCard
                label="Saved"
                value={String(savedCount)}
                icon={<Bookmark size={14} />}
              />
              <StatCard
                label="Essays drafted"
                value="0"
                icon={<FileText size={14} />}
              />
              <StatCard
                label="Est. value"
                value={`$${totalValue.toLocaleString()}`}
                icon={<DollarSign size={14} />}
              />
            </div>
          </div>
        </section>

        {/* CENTER: Chat Interface */}
        <section className="col-span-6 bg-[#11141b] rounded-3xl border border-slate-800/50 flex flex-col overflow-hidden relative">
          <div className="flex gap-2 p-4 border-b border-slate-800/50">
            <TabButton active>Match me</TabButton>
            <TabButton>Essay help</TabButton>
          </div>

          {/* Chat Messages Container */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <ChatBubble
                key={idx}
                role={msg.role}
                content={msg.content}
                // isError={msg.isError}
              />
            ))}
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="h-8 w-8 rounded-full border border-[#eec67a] flex items-center justify-center text-[#eec67a] animate-spin">
                  S
                </div>
                <div className="p-4 rounded-2xl bg-[#161a22] border border-slate-800 text-slate-400 italic text-sm">
                  Searching the web for open scholarships...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="p-6 space-y-4 bg-[#11141b]">
            <div className="flex flex-wrap gap-2">
              <SuggestionChip
                onClick={() =>
                  handleSendMessage("Find open scholarships for my major")
                }
              >
                Match me
              </SuggestionChip>
              <SuggestionChip
                onClick={() => handleSendMessage("Local scholarships in Ghana")}
              >
                Ghanaian options
              </SuggestionChip>
              <SuggestionChip
                onClick={() => handleSendMessage("High GPA scholarships")}
              >
                High GPA matches
              </SuggestionChip>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), handleSendMessage())
                }
                placeholder="Ask about scholarships, essays, or application strategy..."
                className="w-full bg-[#1c212c] border border-slate-800 rounded-2xl p-4 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-[#eec67a]/50 resize-none h-16"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading}
                className="absolute right-3 bottom-3 p-2 bg-[#eec67a] rounded-xl text-black hover:bg-[#d4b06a] transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR: Saved (Placeholder) */}
        <section className="col-span-3 flex flex-col items-center justify-center text-center px-8">
          <Bookmark className="text-slate-800 mb-4" size={48} />
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            Saved Scholarships
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your saved items will appear here.
          </p>
        </section>
      </main>
    </div>
  );
}

// --- Helper UI Components ---
function SuggestionChip({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#1c212c] border border-slate-800 hover:border-[#eec67a]/50 px-3 py-1 rounded-full text-[10px] transition text-slate-400"
    >
      {children}
    </button>
  );
}

// (StatCard, TabButton, and ChatBubble remain the same as your previous code)
// --- Helper Sub-components ---

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#161a22] p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
      <div className="text-2xl font-bold text-[#eec67a] mb-1">{value}</div>
      <div className="text-[9px] text-slate-500 uppercase tracking-tighter flex items-center gap-1">
        {label}
      </div>
    </div>
  );
}

function TabButton({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`px-4 py-1.5 rounded-lg text-xs transition ${active ? "bg-[#eec67a] text-black font-bold" : "text-slate-500 hover:text-slate-300"}`}
    >
      {children}
    </button>
  );
}

// function SuggestionChip({ children }: { children: React.ReactNode }) {
//   return (
//     <button className="bg-[#1c212c] border border-slate-800 hover:border-slate-600 px-3 py-1 rounded-full text-[10px] transition text-slate-400">
//       {children}
//     </button>
//   );
// }

function ChatBubble({
  role,
  content,
  onSave,
}: {
  role: "user" | "assistant";
  content: string;
  onSave?: (data: any) => void;
}) {
  // 1. Extract JSON data if it exists in the message
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  const scholarshipData = jsonMatch
    ? JSON.parse(jsonMatch[1]).scholarship_data
    : null;

  // 2. Clean the display text (remove the raw JSON from the bubble)
  const displayText = content.replace(/```json[\s\S]*?```/, "").trim();

  return (
    <div
      className={`flex gap-4 ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      {role === "assistant" && (
        <div className="h-8 w-8 rounded-full border border-[#eec67a] flex items-center justify-center text-[#eec67a] text-xs font-serif shrink-0">
          S
        </div>
      )}

      <div className="relative group max-w-[80%]">
        <div
          className={`p-4 rounded-2xl text-sm ${
            role === "user"
              ? "bg-[#1c212c] border border-slate-800"
              : "bg-[#161a22] border border-slate-800"
          } text-slate-200`}
        >
          <p className="whitespace-pre-wrap">{displayText}</p>

          {/* 3. Show Save Button ONLY if scholarship data was found */}
          {scholarshipData && onSave && (
            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-[#eec67a] font-bold uppercase">
                  Est. Value: ${scholarshipData.amount.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => onSave(scholarshipData)}
                className="w-full flex items-center justify-center gap-2 text-[10px] bg-[#eec67a] text-black py-2 rounded-lg font-bold hover:bg-[#d4b06a] transition"
              >
                <Bookmark size={12} /> Save to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {role === "user" && (
        <div className="h-8 w-8 rounded-full border border-blue-500 flex items-center justify-center text-blue-500 text-xs shrink-0">
          U
        </div>
      )}
    </div>
  );
}
