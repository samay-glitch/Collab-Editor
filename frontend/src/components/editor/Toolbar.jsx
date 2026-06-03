import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading1, Heading2, Quote, Undo, Redo, Minus, Download, Save,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette,
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

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Gray', value: '#6b7280' },
  { label: 'White', value: '#ffffff' },
  { label: 'Black', value: '#000000' },
];

function ToolbarButton({ onClick, isActive, disabled, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors shrink-0 ${
        isActive
          ? 'bg-primary-600/20 text-primary-400'
          : 'text-dark-400 hover:text-dark-100 hover:bg-dark-700'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ColorPicker({ editor }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) window.document.addEventListener('mousedown', handleClickOutside);
    return () => window.document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentColor = editor.getAttributes('textStyle').color || '';

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Text Color"
        className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors flex items-center gap-1 shrink-0"
      >
        <Palette size={16} />
        <span
          className="w-3 h-3 rounded-full border border-dark-600"
          style={{ backgroundColor: currentColor || 'transparent' }}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 bg-dark-800 border border-dark-600 rounded-xl shadow-xl p-3 z-50 w-[180px]">
          <p className="text-[10px] text-dark-400 font-semibold mb-2 uppercase tracking-wider">Text Color</p>
          <div className="grid grid-cols-5 gap-1.5">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.label}
                onClick={() => {
                  if (color.value === '') {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    editor.chain().focus().setColor(color.value).run();
                  }
                  setIsOpen(false);
                }}
                title={color.label}
                className={`w-7 h-7 rounded-lg border-2 transition-all duration-150 hover:scale-110 ${
                  currentColor === color.value
                    ? 'border-primary-400 ring-2 ring-primary-400/30'
                    : 'border-dark-600 hover:border-dark-400'
                }`}
                style={{
                  backgroundColor: color.value || 'transparent',
                  backgroundImage: color.value === '' ? 'linear-gradient(135deg, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Toolbar({ editor, isSaving, onSave, onExport }) {
  if (!editor) return null;

  return (
    <div className="bg-dark-800 border-b border-dark-700 py-2.5 flex items-center justify-between px-4 gap-3 md:gap-4 transition-colors duration-200 relative z-30 max-w-full overflow-hidden mb-2">
      {/* 2-Row Grouped Formatting Tools */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        
        {/* Row 1: Document Structure & History */}
        <div className="flex items-center gap-0.5 overflow-x-auto max-w-full scrollbar-none py-0.5">
          {/* Font Size */}
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
            className="bg-dark-700 border border-dark-600/80 rounded-lg text-xs text-dark-200 hover:text-dark-100 px-2 py-1.5 outline-none cursor-pointer focus:ring-1 focus:ring-primary-500 w-[72px] transition-colors duration-200 shrink-0 mr-1"
            title="Font Size"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value} className="bg-dark-800 text-dark-200">
                {size.label}
              </option>
            ))}
          </select>

          <div className="w-px h-5 bg-dark-700 mx-1 shrink-0" />

          {/* Headings */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <Heading2 size={16} />
          </ToolbarButton>

          <div className="w-px h-5 bg-dark-700 mx-1 shrink-0" />

          {/* Lists / Blockquote / HR */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
            <Minus size={16} />
          </ToolbarButton>

          <div className="w-px h-5 bg-dark-700 mx-1 shrink-0" />

          {/* Undo / Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
            <Undo size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
            <Redo size={16} />
          </ToolbarButton>
        </div>

        {/* Row 2: Text Styling & Alignments */}
        <div className="flex items-center gap-0.5 overflow-x-auto max-w-full scrollbar-none py-0.5">
          {/* Bold / Italic / Strike / Code */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
            <Code size={16} />
          </ToolbarButton>

          {/* Text Color */}
          <ColorPicker editor={editor} />

          <div className="w-px h-5 bg-dark-700 mx-1 shrink-0" />

          {/* Text Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
            <AlignRight size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
            <AlignJustify size={16} />
          </ToolbarButton>
        </div>

      </div>

      {/* Right Side: Document Actions */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 pl-3 border-l border-dark-700/60 self-stretch justify-center">
        <div className="text-right shrink-0">
          {isSaving ? (
            <span className="text-[10px] text-dark-400 flex items-center gap-1.5 font-medium justify-end">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              <span className="hidden xs:inline">Saving...</span>
            </span>
          ) : (
            <span className="text-[10px] text-green-500 flex items-center gap-1.5 font-medium justify-end">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-once" />
              <span className="hidden xs:inline">Saved</span>
            </span>
          )}
        </div>

        <div className="flex flex-col xs:flex-row items-center gap-1.5 shrink-0">
          <button
            onClick={onExport}
            className="p-1.5 bg-dark-700 hover:bg-dark-600 text-dark-200 hover:text-dark-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold border border-dark-600"
            title="Download Document as HTML"
          >
            <Download size={12} />
            <span>Export</span>
          </button>

          <button
            onClick={onSave}
            className="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold"
            title="Save to database"
          >
            <Save size={12} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
