import { useState } from 'react';
import TiptapKurukhEditor, {
  type TiptapContentPayload,
} from '../components/editor/TiptapKurukhEditor';

const TiptapEditorDemo = () => {
  const [editorContent, setEditorContent] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [newEntryWord, setNewEntryWord] = useState('');

  const handleContentChange = ({ html }: TiptapContentPayload) => {
    setEditorContent(html);
  };

  const clearContent = () => setEditorContent('');

  const addDictionaryEntryTemplate = () => {
    if (!newEntryWord.trim()) {
      alert('Please enter a word for the new entry');
      return;
    }
    const entryTemplate = `
      <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; background-color: #f8fafc;">
        <h4 style="color: #1e40af;">Entry: ${newEntryWord}</h4>
        <p><strong>Word:</strong> <span style="font-family: KellyTolong, monospace;">${newEntryWord}</span></p>
      </div>
    `;
    setEditorContent((prev) => prev + entryTemplate);
    setNewEntryWord('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Tiptap Kurukh Editor Demo</h1>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Editor Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={clearContent} className="btn btn-outline btn-sm">
              Clear Content
            </button>
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Disable Editor:</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={isDisabled}
                onChange={(e) => setIsDisabled(e.target.checked)}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Show Toolbar:</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showToolbar}
                onChange={(e) => setShowToolbar(e.target.checked)}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newEntryWord}
              onChange={(e) => setNewEntryWord(e.target.value)}
              placeholder="Enter word in Kurukh"
              className="input input-bordered input-sm flex-grow"
            />
            <button
              onClick={addDictionaryEntryTemplate}
              className="btn btn-sm bg-indigo-500 hover:bg-indigo-600 text-white"
              disabled={!newEntryWord.trim()}
            >
              Add Entry Template
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tiptap Kurukh Rich Text Editor</h2>
          <TiptapKurukhEditor
            content={editorContent}
            placeholder="Start typing here..."
            onContentChange={handleContentChange}
            disabled={isDisabled}
            showToolbar={showToolbar}
            className="min-h-[200px]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">HTML Output</h2>
            <div className="bg-gray-100 p-4 rounded-lg min-h-[8rem] max-h-64 overflow-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {editorContent || '(empty)'}
              </pre>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Rendered Preview</h2>
            <div className="bg-white p-4 rounded-lg border min-h-[8rem] max-h-64 overflow-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: editorContent || '<p class="text-gray-400">(empty)</p>',
                }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditorDemo;
