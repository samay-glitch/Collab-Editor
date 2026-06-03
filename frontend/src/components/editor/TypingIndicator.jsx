import React from 'react';

export default function TypingIndicator({ typingUsers = [] }) {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName);
  let text;
  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className="flex items-center gap-2 px-6 py-1.5 bg-dark-900/60 border-t border-dark-700/50">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[11px] text-dark-400 italic">{text}</span>
    </div>
  );
}
