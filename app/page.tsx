import Chat from '@/components/chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center px-4 py-10">
      {/* Page Header */}
      <header className="flex flex-col items-center mb-8 gap-3">
        <svg
          width="140"
          height="40"
          viewBox="0 0 140 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <style>{`
            @keyframes ekg-draw {
              0%   { stroke-dashoffset: 240; opacity: 1; }
              65%  { stroke-dashoffset: 0;   opacity: 1; }
              80%  { stroke-dashoffset: 0;   opacity: 0.25; }
              100% { stroke-dashoffset: 240; opacity: 0; }
            }
            .ekg-line {
              stroke-dasharray: 240;
              stroke-dashoffset: 240;
              animation: ekg-draw 2s ease-in-out infinite;
            }
          `}</style>
          <path
            className="ekg-line"
            d="M0,20 L30,20 L42,20 L48,5 L54,35 L60,10 L66,30 L72,20 L110,20 L140,20"
            stroke="#2DD4BF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        <h1 className="text-4xl font-bold text-[#1A6B4A] tracking-tight">
          SymptoSync
        </h1>
        <p className="text-sm text-[#1E293B]/55 text-center max-w-sm leading-relaxed">
          AI-powered medical triage &amp; scheduling.{' '}
          <span className="font-medium text-[#1E293B]/70">
            Not a substitute for professional medical advice.
          </span>
        </p>
      </header>

      {/* Chat Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
        <Chat />
      </div>

      <p className="mt-6 text-xs text-[#1E293B]/35 text-center">
        In an emergency, call{' '}
        <span className="text-[#DC2626] font-semibold">911</span> immediately.
      </p>
    </div>
  );
}