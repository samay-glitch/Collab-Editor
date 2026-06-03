import React from 'react';

export default function CursorOverlay({ remoteCursors }) {
  const cursorsArray = Array.from(remoteCursors.entries());

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
      {cursorsArray.map(([userId, cursor]) => {
        if (!cursor.position || typeof cursor.position.top !== 'number') return null;

        return (
          <div
            key={userId}
            className="absolute transition-all duration-100 ease-out"
            style={{
              top: `${cursor.position.top}px`,
              left: `${cursor.position.left}px`,
            }}
          >
            <div
              className="w-[2px] h-5"
              style={{ backgroundColor: cursor.color || '#3b82f6' }}
            />
            <div
              className="absolute left-1 top-4 px-2 py-0.5 text-[9px] font-bold text-white rounded-md whitespace-nowrap opacity-90 shadow-md"
              style={{ backgroundColor: cursor.color || '#3b82f6' }}
            >
              {cursor.userName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
