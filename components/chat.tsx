'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function hasEmergency(text: string): boolean {
  return /emergency|escalate/i.test(text);
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: '/api/chat' });

  const bottomRef = useRef<HTMLDivElement>(null);

  // ---------- Voice Input ----------
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange({ target: { value: transcript } } as any);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
    recognitionRef.current = recognition;
  };

  // ---------- Text-to-Speech ----------
  const speakMessage = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // ---------- Auto-scroll ----------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 bg-white rounded-t-2xl shrink-0">
        <svg
          width="32"
          height="22"
          viewBox="0 0 32 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polyline
            points="0,11 6,11 9,3 12,19 15,7 18,15 21,11 32,11"
            stroke="#1A6B4A"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="text-base font-semibold text-[#1A6B4A] tracking-tight select-none">
          SymptoSync
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10 px-4">
            Describe your symptoms and I&apos;ll help you get the right care.
          </p>
        )}

        {messages.map((message) => {
          const isUser = message.role === 'user';
          const urgent = hasEmergency(message.content);

          return (
            <div
              key={message.id}
              className={`flex animate-message-in ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm text-[#1E293B] leading-relaxed
                  ${isUser
                    ? 'bg-[#E8F5F0] rounded-br-sm'
                    : 'bg-white border border-gray-200 shadow-sm rounded-bl-sm'}
                `}
              >
                {urgent && (
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-[#DC2626] mr-1.5 mb-0.5 align-middle shrink-0"
                    aria-label="Emergency indicator"
                  />
                )}
                {isUser ? (
                  <span className="whitespace-pre-wrap">{message.content}</span>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-1.5 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc ml-4 mb-1.5 space-y-0.5">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal ml-4 mb-1.5 space-y-0.5">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-snug">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[#1E293B]">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}

                {/* Text-to-speech button for assistant messages */}
                {!isUser && (
                  <button
                    onClick={() => speakMessage(message.content)}
                    className="ml-2 text-gray-400 hover:text-[#1A6B4A] transition-colors align-middle"
                    aria-label="Read aloud"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 px-4 py-3 border-t border-gray-200 bg-white rounded-b-2xl shrink-0"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe your symptoms…"
          className="flex-1 text-sm text-[#1E293B] focus-visible:ring-[#1A6B4A] focus-visible:ring-1"
          disabled={isLoading}
          autoComplete="off"
          aria-label="Symptom input"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={startListening}
          disabled={listening}
          className="shrink-0"
          aria-label="Start voice input"
        >
          🎤
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[#1A6B4A] hover:bg-[#155e3f] active:bg-[#10492f] text-white text-sm px-5 transition-colors"
        >
          Send
        </Button>
      </form>
    </div>
  );
}