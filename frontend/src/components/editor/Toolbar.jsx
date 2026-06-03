import React from 'react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading1, Heading2, Quote, Undo, Redo, Save, Minus,
} from 'lucide-react';

const FONT_SIZES = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '30px', value: '30px' },
  { label: '36px', value: '36px' },
];

function ToolbarButton({ onClick, isActive, disabled, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-600/20 text-primary-400'
          : 'text-dark-400 hover:text-dark-100 hover:bg-dark-700'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ editor, isSaving, onSave }) {
  if (!editor) return null;

  return (
    <div className="bg-dark-800 border-b border-dark-700 h-12 flex items-center justify-between px-4 overflow-x-auto transition-colors duration-200">
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-dark-700 mx-1.5" />

        {/* Font Size Select Dropdown */}
        <select
          value={editor.getAttributes('fontSize').size || '14px'}
          onChange={(e) => {
            const size = e.target.value;
            if (size === '14px') {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(size).run();
            }
          }}
          className="bg-dark-700 border border-dark-600/80 rounded-lg text-xs text-dark-200 hover:text-dark-100 px-2 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-primary-500 max-w-[85px] transition-colors duration-200"
          title="Font Size"
        >
          {FONT_SIZES.map((size) => (
            <option key={size.value} value={size.value} className="bg-dark-800 text-dark-200">
              {size.label}
            </option>
          ))}
        </select>

        <div className="w-px h-5 bg-dark-700 mx-1.5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-dark-700 mx-1.5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-dark-700 mx-1.5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isSaving ? (
          <span className="text-xs text-dark-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
            Saving...
          </span>
        ) : (
          <span className="text-xs text-green-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Saved
          </span>
        )}

        <button
          onClick={onSave}
          className="p-2 bg-dark-700 hover:bg-dark-600 text-dark-200 hover:text-dark-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold border border-dark-600"
        >
          <Save size={14} />
          Save
        </button>
      </div>
    </div>
  );
}
