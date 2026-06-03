import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import CursorOverlay from './CursorOverlay';

// Custom Tiptap mark for inline font sizes
const FontSizeMark = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.size) return {};
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
        return chain().setMark(this.name, { size }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().unsetMark(this.name).run();
      },
    };
  },
});

const Editor = forwardRef(function Editor({ value, onChange, onCursorMove, remoteCursors, onReady }, ref) {
  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100 },
      }),
      TextStyle,
      Color,
      FontSizeMark,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[460px] outline-none px-2 py-1 text-dark-100 text-sm leading-relaxed focus:outline-none',
      },
    },
    onCreate: ({ editor }) => {
      if (onReady) onReady(editor);
    },
    onUpdate: ({ editor }) => {
      if (isRemoteUpdate.current) return;
      const html = editor.getHTML();
      onChange(html);
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onCursorMove) return;
      const { from } = editor.state.selection;
      onCursorMove({
        index: from,
      });
    },
  });

  // Expose editor instance to parent via ref
  useImperativeHandle(ref, () => editor, [editor]);

  // Sync remote content changes without resetting cursor
  useEffect(() => {
    if (!editor || !value) return;
    const currentHTML = editor.getHTML();
    if (currentHTML !== value) {
      isRemoteUpdate.current = true;
      const { from } = editor.state.selection;
      editor.commands.setContent(value, false);
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
          <CursorOverlay editor={editor} remoteCursors={remoteCursors} />
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

export default Editor;
