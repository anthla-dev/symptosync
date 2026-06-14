{/* Repeat button – floats right at the end of the text, no overlap */}
{!isUser && (
  <button
    onClick={() => speakMessage(message.content)}
    className="float-right ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-200 bg-white text-[#1A6B4A] hover:bg-[#1A6B4A]/10 hover:border-[#1A6B4A]/30 transition-colors"
    aria-label="Repeat message"
    title="Repeat"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  </button>
)}