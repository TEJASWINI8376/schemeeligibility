import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage, Scheme, UserProfile } from '../types';

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSelectScheme: (scheme: Scheme) => void;
  onApplyScheme: (scheme: Scheme) => void;
  initialPrompt?: string | null;
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onSelectScheme,
  onApplyScheme,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Namaste! I am your **GovScheme AI Advisor**.\n\nI can help you explore Central & State schemes, verify eligibility criteria, prepare document checklists, and answer application questions in plain language.\n\nHow may I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        'Schemes for Farmers (PM-KISAN)',
        'How to get Ayushman Bharat Health Card?',
        'State welfare schemes for women',
        'Collateral-free business loans (MUDRA)',
        'Post-Matric Student Scholarships',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not get response from AI advisor');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is what I found regarding your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedSchemes: data.suggestedSchemes || [],
        quickReplies: ['Check eligibility for these', 'What documents are required?', 'How do I apply?'],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'system',
        text: 'Sorry, I encountered an issue fetching scheme guidance. Please try again or check the Scheme Directory directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] to-[#002244] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-[#8df9a8]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                AI Scheme Advisor
                <span className="px-1.5 py-0.2 bg-[#008744] text-white text-[10px] font-semibold uppercase rounded-full">
                  Live
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                Gemini 3.7 Intelligence Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close Advisor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-xs md:text-sm">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs text-center font-medium">
                  {msg.text}
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-start gap-2 max-w-[88%] ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isUser ? 'bg-[#003366] text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl ${
                      isUser
                        ? 'bg-[#003366] text-white rounded-tr-none shadow-2xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                      {msg.text}
                    </div>

                    <span
                      className={`text-[10px] block mt-1.5 text-right ${
                        isUser ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Suggested Schemes Cards */}
                {msg.suggestedSchemes && msg.suggestedSchemes.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full pl-9">
                    <span className="text-[11px] font-semibold text-slate-700 block">
                      Recommended Schemes:
                    </span>
                    {msg.suggestedSchemes.map((scheme) => (
                      <div
                        key={scheme.id}
                        onClick={() => {
                          onClose();
                          onSelectScheme(scheme);
                        }}
                        className="bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <h5 className="font-semibold text-xs text-[#003366] line-clamp-1">
                            {scheme.shortTitle || scheme.title}
                          </h5>
                          <span className="text-xs font-bold text-[#008744]">
                            {scheme.benefitAmount}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Chips */}
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pl-9">
                    {msg.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(reply)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#003366] border border-blue-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 pl-2 text-xs font-medium text-slate-500">
              <Bot className="w-4 h-4 animate-spin text-[#003366]" />
              <span>Querying central scheme knowledge base...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Am I eligible for PM-KISAN?')..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-normal focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center hover:bg-[#002244] shadow-xs transition-all disabled:opacity-40 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
