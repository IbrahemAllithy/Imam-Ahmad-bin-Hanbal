import { useEffect, useRef } from 'react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiLink,
  FiAlignRight,
  FiAlignCenter,
  FiAlignLeft,
  FiAlignJustify,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiX,
} from 'react-icons/fi';
import { MdFormatListNumbered, MdFormatQuote, MdStrikethroughS } from 'react-icons/md';
import './RichTextEditor.css';

const BLOCK_OPTIONS = [
  { value: 'p', label: 'نص عادي' },
  { value: 'h2', label: 'عنوان كبير' },
  { value: 'h3', label: 'عنوان فرعي' },
  { value: 'blockquote', label: 'اقتباس' },
];

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    onChange(editorRef.current?.innerHTML || '');
  };

  const exec = (command, arg) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const handleBlock = (e) => {
    const tag = e.target.value;
    exec('formatBlock', tag === 'p' ? 'P' : tag.toUpperCase());
    e.target.value = '';
  };

  const handleLink = () => {
    const url = window.prompt('أدخل رابط الوصلة (URL):', 'https://');
    if (url) exec('createLink', url);
  };

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        <select className="rte-block-select" defaultValue="" onChange={handleBlock}>
          <option value="" disabled>
            نمط الفقرة
          </option>
          {BLOCK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="rte-sep" />

        <button type="button" title="عريض" onClick={() => exec('bold')}>
          <FiBold />
        </button>
        <button type="button" title="مائل" onClick={() => exec('italic')}>
          <FiItalic />
        </button>
        <button type="button" title="تسطير" onClick={() => exec('underline')}>
          <FiUnderline />
        </button>
        <button type="button" title="يتوسطه خط" onClick={() => exec('strikeThrough')}>
          <MdStrikethroughS />
        </button>

        <span className="rte-sep" />

        <button type="button" title="قائمة نقطية" onClick={() => exec('insertUnorderedList')}>
          <FiList />
        </button>
        <button type="button" title="قائمة مرقّمة" onClick={() => exec('insertOrderedList')}>
          <MdFormatListNumbered />
        </button>
        <button type="button" title="اقتباس" onClick={() => exec('formatBlock', 'BLOCKQUOTE')}>
          <MdFormatQuote />
        </button>
        <button type="button" title="إدراج رابط" onClick={handleLink}>
          <FiLink />
        </button>

        <span className="rte-sep" />

        <button type="button" title="محاذاة يمين" onClick={() => exec('justifyRight')}>
          <FiAlignRight />
        </button>
        <button type="button" title="توسيط" onClick={() => exec('justifyCenter')}>
          <FiAlignCenter />
        </button>
        <button type="button" title="محاذاة يسار" onClick={() => exec('justifyLeft')}>
          <FiAlignLeft />
        </button>
        <button type="button" title="ضبط" onClick={() => exec('justifyFull')}>
          <FiAlignJustify />
        </button>

        <span className="rte-sep" />

        <button type="button" title="تراجع" onClick={() => exec('undo')}>
          <FiCornerUpRight />
        </button>
        <button type="button" title="إعادة" onClick={() => exec('redo')}>
          <FiCornerUpLeft />
        </button>
        <button type="button" title="إزالة التنسيق" onClick={() => exec('removeFormat')}>
          <FiX />
        </button>
      </div>

      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        dir="rtl"
        data-placeholder={placeholder || 'اكتب محتوى المقال هنا...'}
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
