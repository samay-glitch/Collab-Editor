import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CursorOverlay from './CursorOverlay';

// Custom Tiptap mark for inline font sizes without requiring heavy dependencies
const FontSizeMark = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.size) {
            return {};
          }
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          const hasFontSize = element.style.fontSize;
          return hasFontSize ? {} : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => {
        return chain()
          .setMark(this.name, { size })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .unsetMark(this.name)
          .run();
      },
    };
  },
});

const Editor = forwardRef(function Editor({ value, onChange, onCursorMove, remoteCursors }, ref) {
  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100,
        },
      }),
      FontSizeMark,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[460px] outline-none px-2 py-1 text-dark-100 text-sm leading-relaxed focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (isRemoteUpdate.current) return;
      const html = editor.getHTML();
      onChange(html);
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onCursorMove) return;
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      const editorRect = editor.view.dom.getBoundingClientRect();

      onCursorMove({
        top: coords.top - editorRect.top,
        left: coords.left - editorRect.left,
        index: from,
      });
    },
  });

  // Expose editor instance to parent via ref
  useImperativeHandle(ref, () => editor, [editor]);

  // Sync remote content changes into the editor without resetting cursor
  useEffect(() => {
    if (!editor || !value) return;
    const currentHTML = editor.getHTML();
    if (currentHTML !== value) {
      isRemoteUpdate.current = true;
      const { from } = editor.state.selection;
      editor.commands.setContent(value, false);
      // Try to restore cursor position
      const docLength = editor.state.doc.content.size;
      const safePos = Math.min(from, docLength);
      editor.commands.setTextSelection(safePos);
      isRemoteUpdate.current = false;
    }
  }, [value, editor]);

  return (
    <div className="relative flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="relative flex-1 max-w-4xl w-full mx-auto bg-dark-800/20 border border-dark-700/60 rounded-xl flex flex-col shadow-inner min-h-[500px]">
        <div className="relative flex-1 p-4 md:p-6 overflow-y-auto">
          <CursorOverlay remoteCursors={remoteCursors} />
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

export default Editor;
export { FontSizeMark };
