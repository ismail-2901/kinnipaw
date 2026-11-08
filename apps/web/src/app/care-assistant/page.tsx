'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isEmergency?: boolean;
  emergencyBanner?: string;
  disclaimer?: string;
}

export default function PetCareAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your KINNIPAW Educational Care Companion. Ask me about diet, habit training, daily wellness, and grooming routines. Please note: I cannot provide medical diagnoses or prescribe medication dosages.',
      disclaimer: 'Educational guidance only; does not replace licensed veterinary care.',
    },
  ]);
  const [input, setInput] = useState('');
  const [species, setSpecies] = useState('dog');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/care-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, species }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Care Assistant service unavailable');
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: json.data.answer,
        isEmergency: json.data.is_emergency,
        emergencyBanner: json.data.emergency_banner,
        disclaimer: json.data.disclaimer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Care assistant is operating in offline mode. Please consult an accredited veterinarian or check our Care Guidelines.',
          disclaimer: 'Safe fallback response.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-black text-[#245B45]">
              KINNIPAW
            </Link>
            <span className="rounded-full bg-emerald-100 text-[#245B45] px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Educational Care Companion
            </span>
          </div>
          <Link href="/feed" className="text-sm font-semibold text-gray-600 hover:text-[#245B45]">
            ← Return to Feed
          </Link>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col">
        {/* Guardrail Disclaimer Banner (AGENTS.md §17) */}
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
          <strong>🌿 Non-Diagnostic Guarantee:</strong> KINNIPAW AI provides educational wellness tips only. It never provides medical diagnoses or drug prescriptions. For emergencies, contact a licensed vet immediately.
        </div>

        {/* Species Selector */}
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="companionSpecies" className="text-xs font-bold text-gray-600">Companion Species:</label>
          <select
            id="companionSpecies"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="rounded-lg border border-[#D5D2CA] bg-white px-3 py-1.5 text-xs font-semibold text-[#252A27] outline-none"
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="rabbit">Rabbit</option>
          </select>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-sm min-h-[400px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {m.emergencyBanner && (
                <div className="mb-2 max-w-xl rounded-xl border border-red-300 bg-red-100 p-4 text-xs font-bold text-red-900 leading-relaxed shadow-sm">
                  {m.emergencyBanner}
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#245B45] text-white rounded-tr-none'
                    : 'bg-[#FAF9F6] text-[#252A27] border border-[#E8E6E0] rounded-tl-none'
                }`}
              >
                {m.content}
              </div>

              {m.disclaimer && (
                <span className="mt-1 text-[10px] text-gray-400 italic max-w-xl">
                  {m.disclaimer}
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full bg-[#245B45] animate-pulse" />
              Consulting animal wellness knowledge base...
            </div>
          )}
        </div>

        {/* Suggestion Quick Pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            'Best daily nutrition guidelines',
            'Safe grooming & bathing routine',
            'Potty training using positive reinforcement',
            'Indoor enrichment and exercise ideas',
          ].map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(pill)}
              className="rounded-full bg-white border border-[#E8E6E0] px-3 py-1.5 text-xs text-gray-600 hover:border-[#245B45] hover:text-[#245B45] transition"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            placeholder="Ask about diet, grooming, habits, or daily care..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border border-[#D5D2CA] bg-white px-4 py-3 text-sm outline-none focus:border-[#245B45]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-[#245B45] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1B4736] disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </main>
    </div>
  );
}
