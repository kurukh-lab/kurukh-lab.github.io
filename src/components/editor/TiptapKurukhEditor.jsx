import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Mark } from '@tiptap/core';

// Custom mark for Kurukh font formatting
const KurukhFont = Mark.create({
  name: 'kurukhFont',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[style*="font-family: KellyTolong"]',
        getAttrs: element => element.style.fontFamily?.includes('KellyTolong') && null,
      },
      {
        style: 'font-family',
        getAttrs: value => value?.includes('KellyTolong') && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        ...HTMLAttributes,
        style: 'font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;',
        class: 'kurukh-text',
      },
      0,
    ];
  },

  addCommands() {
    return {
      setKurukhFont: () => ({ commands }) => {
        return commands.setMark(this.name);
      },
      toggleKurukhFont: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
      unsetKurukhFont: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

// Custom mark for Hindi font formatting
const HindiFont = Mark.create({
  name: 'hindiFont',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[style*="font-family: Noto Sans Devanagari"]',
        getAttrs: element => element.style.fontFamily?.includes('Noto Sans Devanagari') && null,
      },
      {
        style: 'font-family',
        getAttrs: value => value?.includes('Noto Sans Devanagari') && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        ...HTMLAttributes,
        style: 'font-family: "Noto Sans Devanagari", Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;',
        class: 'hindi-text',
      },
      0,
    ];
  },

  addCommands() {
    return {
      setHindiFont: () => ({ commands }) => {
        return commands.setMark(this.name);
      },
      toggleHindiFont: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
      unsetHindiFont: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

/**
 * TiptapKurukhEditor - A rich text editor using Tiptap with Kurukh font support
 * Features:
 * - Rich text editing capabilities
 * - Toggle Kurukh font formatting
 * - Placeholder support
 * - Customizable toolbar
 */
const TiptapKurukhEditor = ({
  content = '',
  placeholder = 'Start typing in Kurukh...',
  onContentChange = () => { },
  className = '',
  disabled = false,
  showToolbar = true,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      TextStyle,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      KurukhFont,
      HindiFont,
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onContentChange({ html, text, editor });
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none ${className}`,
        style: 'min-height: 100px; padding: 12px;',
      },
    },
  });

  // Font toggle functions - defined first to avoid hoisting issues
  const toggleKurukhFont = useCallback(() => {
    if (!editor) return;

    // Toggle the Kurukh font mark
    editor.chain().focus().toggleKurukhFont().run();
  }, [editor]);

  const applyKurukhToAll = useCallback(() => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .selectAll()
      .setKurukhFont()
      .run();
  }, [editor]);

  const removeKurukhFromAll = useCallback(() => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .selectAll()
      .unsetKurukhFont()
      .run();
  }, [editor]);

  // Hindi font functions
  const toggleHindiFont = useCallback(() => {
    if (!editor) return;

    // Toggle the Hindi font mark
    editor.chain().focus().toggleHindiFont().run();
  }, [editor]);

  const applyHindiToAll = useCallback(() => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .selectAll()
      .setHindiFont()
      .run();
  }, [editor]);

  const removeHindiFromAll = useCallback(() => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .selectAll()
      .unsetHindiFont()
      .run();
  }, [editor]);

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Add keyboard shortcuts - now after function declarations
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event) => {
      // Ctrl+K for Kurukh font
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        toggleKurukhFont();
      }
      // Ctrl+H for Hindi font
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        toggleHindiFont();
      }
      // Ctrl+Shift+K for apply Kurukh to all
      if (event.ctrlKey && event.shiftKey && event.key === 'K') {
        event.preventDefault();
        applyKurukhToAll();
      }
      // Ctrl+Shift+H for apply Hindi to all
      if (event.ctrlKey && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        applyHindiToAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, toggleKurukhFont, toggleHindiFont, applyKurukhToAll, applyHindiToAll]);

  if (!editor) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center">
        <span className="text-gray-500">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className={`tiptap-kurukh-editor w-full h-full ${disabled ? 'bg-gray-100' : 'bg-white'}`}>
      {/* Microsoft Word-style Ribbon */}
      {showToolbar && (
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 border-b-2 border-blue-200 shadow-sm">
          {/* Ribbon Header */}
          <div className="bg-white border-b border-gray-300 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm font-medium text-gray-700">Home</div>
                <div className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Insert</div>
                <div className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Layout</div>
                <div className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">References</div>
              </div>
              <div className="text-xs text-gray-500">Kurukh Dictionary Editor</div>
            </div>
          </div>

          {/* Ribbon Content */}
          <div className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-1">
              {/* Clipboard Group */}
              <div className="mr-6">
                <div className="text-xs text-gray-600 mb-1">Clipboard</div>
                <div className="flex items-center space-x-1">
                  <div className="flex flex-col items-center">
                    <button className="p-2 rounded hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all">
                      <div className="text-lg">📋</div>
                    </button>
                    <span className="text-xs text-gray-600">Paste</span>
                  </div>
                  <div className="w-px h-12 bg-gray-300 mx-2"></div>
                  <div className="flex flex-col space-y-1">
                    <button className="p-1 rounded hover:bg-blue-50 text-sm">✂️ Cut</button>
                    <button className="p-1 rounded hover:bg-blue-50 text-sm">📄 Copy</button>
                  </div>
                </div>
              </div>

              {/* Font Group */}
              <div className="mr-6">
                <div className="text-xs text-gray-600 mb-1">Font</div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-all ${editor.isActive('bold')
                        ? 'bg-blue-200 text-blue-800 border border-blue-300 shadow-inner'
                        : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                      } disabled:opacity-50`}
                    title="Bold (Ctrl+B)"
                  >
                    <strong className="font-bold">B</strong>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-all ${editor.isActive('italic')
                        ? 'bg-blue-200 text-blue-800 border border-blue-300 shadow-inner'
                        : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                      } disabled:opacity-50`}
                    title="Italic (Ctrl+I)"
                  >
                    <em className="italic">I</em>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-all ${editor.isActive('underline')
                        ? 'bg-blue-200 text-blue-800 border border-blue-300 shadow-inner'
                        : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                      } disabled:opacity-50`}
                    title="Underline (Ctrl+U)"
                  >
                    <span className="underline">U</span>
                  </button>
                </div>
              </div>

              {/* Paragraph Group */}
              <div className="mr-6">
                <div className="text-xs text-gray-600 mb-1">Paragraph</div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-all ${editor.isActive({ textAlign: 'left' })
                        ? 'bg-blue-200 text-blue-800 border border-blue-300 shadow-inner'
                        : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                      }`}
                    title="Align Left"
                  >
                    ⬅️
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-all ${editor.isActive({ textAlign: 'center' })
                        ? 'bg-blue-200 text-blue-800 border border-blue-300 shadow-inner'
                        : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                      }`}
                    title="Center"
                  >
                    ↔️
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-all ${editor.isActive({ textAlign: 'right' })
                        ? 'bg-blue-200 text-blue-800 border border-blue-300 shadow-inner'
                        : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                      }`}
                    title="Align Right"
                  >
                    ➡️
                  </button>
                </div>
              </div>

              {/* Language Formatting Group */}
              <div className="mr-6">
                <div className="text-xs text-gray-600 mb-1">Language</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleKurukhFont}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${editor.isActive('kurukhFont')
                        ? 'bg-green-200 text-green-800 border-2 border-green-400 shadow-inner'
                        : 'bg-white hover:bg-green-50 border-2 border-green-300 hover:border-green-400'
                      }`}
                    style={{
                      fontFamily: editor.isActive('kurukhFont')
                        ? 'KellyTolong, monospace'
                        : 'inherit'
                    }}
                    title="Apply Kurukh font formatting (Ctrl+K)"
                  >
                    𝐊𝐮𝐫𝐮𝐤𝐡
                  </button>
                  <button
                    onClick={toggleHindiFont}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${editor.isActive('hindiFont')
                        ? 'bg-orange-200 text-orange-800 border-2 border-orange-400 shadow-inner'
                        : 'bg-white hover:bg-orange-50 border-2 border-orange-300 hover:border-orange-400'
                      }`}
                    style={{
                      fontFamily: editor.isActive('hindiFont')
                        ? '"Noto Sans Devanagari", Arial, sans-serif'
                        : 'inherit'
                    }}
                    title="Apply Hindi font formatting (Ctrl+H)"
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Language Tools */}
              <div>
                <div className="text-xs text-gray-600 mb-1">Tools</div>
                <div className="flex items-center space-x-1">
                  <div className="relative group">
                    <button className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                      Kurukh Tools ▼
                    </button>
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-max">
                      <button
                        onClick={applyKurukhToAll}
                        className="block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 rounded-t-lg"
                        title="Apply Kurukh font to all text"
                      >
                        Apply to All Text
                      </button>
                      <button
                        onClick={removeKurukhFromAll}
                        className="block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 rounded-b-lg"
                        title="Remove Kurukh font from all text"
                      >
                        Remove from All Text
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <button className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                      Hindi Tools ▼
                    </button>
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-max">
                      <button
                        onClick={applyHindiToAll}
                        className="block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 rounded-t-lg"
                        title="Apply Hindi font to all text"
                      >
                        Apply to All Text
                      </button>
                      <button
                        onClick={removeHindiFromAll}
                        className="block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 rounded-b-lg"
                        title="Remove Hindi font from all text"
                      >
                        Remove from All Text
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content - Responsive */}
      <div className="tiptap-editor-container flex-1 overflow-auto">
        <div className="tiptap-editor-content">
          <EditorContent
            editor={editor}
            className={`tiptap-content h-full ${disabled ? 'pointer-events-none' : ''}`}
          />
          {disabled && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-50 cursor-not-allowed" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TiptapKurukhEditor;
