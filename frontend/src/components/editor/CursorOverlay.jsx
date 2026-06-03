import React from 'react';

export default function CursorOverlay({ editor, remoteCursors }) {
  if (!editor || !editor.view) return null;

  const cursorsArray = Array.from(remoteCursors.entries());

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
      {cursorsArray.map(([userId, cursor]) => {
        if (!cursor.position || typeof cursor.position.index !== 'number') return null;

        const index = cursor.position.index;
        const docLength = editor.state.doc.content.size;
        const safePos = Math.min(index, docLength);

        let coords;
        try {
          coords = editor.view.coordsAtPos(safePos);
        } catch (e) {
          // If the position calculation fails temporarily (e.g. view not loaded or size mismatch)
          return null;
        }

        if (!coords) return null;

        const container = editor.view.dom.closest('.overflow-y-auto');
        if (!container) return null;

        const containerRect = container.getBoundingClientRect();
        
        // Calculate coordinates relative to the scrolling container
        const top = coords.top - containerRect.top + container.scrollTop;
        const left = coords.left - containerRect.left + container.scrollLeft;
        const height = coords.bottom - coords.top || 20;

        return (
          <div
            key={userId}
            className="absolute transition-all duration-100 ease-out"
            style={{
              top: `${top}px`,
              left: `${left}px`,
            }}
          >
            <div
              className="w-[2px]"
              style={{ 
                backgroundColor: cursor.color || '#3b82f6',
                height: `${height}px`
              }}
            />
            <div
              className="absolute left-1 px-1.5 py-0.5 text-[9px] font-bold text-white rounded-md whitespace-nowrap opacity-90 shadow-md"
              style={{ 
                backgroundColor: cursor.color || '#3b82f6',
                top: `${height}px`
              }}
            >
              {cursor.userName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
