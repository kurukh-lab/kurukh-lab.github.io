import React, { useState } from 'react';
import TiptapKurukhEditor from '../components/editor/TiptapKurukhEditor';

const TiptapEditorDemo = () => {
  const [editorContent, setEditorContent] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [newEntryWord, setNewEntryWord] = useState('');

  // Function to handle content changes from the editor
  const handleContentChange = ({ html, text, editor }) => {
    setEditorContent(html);
    console.log('Editor content changed:', { html, text });
  };

  // Function to load sample content
  const loadSampleContent = () => {
    const sampleContent = `
      <p>Welcome to the <strong>Kurukh Dictionary Editor</strong>!</p>
      <p>This is regular text. <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">And this is Kurukh text formatted with the special font.</span></p>
      <p><span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">यह हिंदी में टेक्स्ट है। (This is text in Hindi)</span></p>
      <p>You can mix regular text, <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">Kurukh text</span>, and <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">हिंदी text</span> seamlessly.</p>
      
      <h3>Dictionary Entries Examples:</h3>
      
      <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; background-color: #f8fafc;">
        <h4 style="color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Entry 1: Day</h4>
        <p><strong>Word:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">onDro</span></p>
        <p><strong>Meaning (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">दिन, प्रकाश का समय</span></p>
        <p><strong>Meaning (English):</strong> Day, time of light</p>
        <p><strong>Example:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">inji onDro namma enji.</span></p>
        <p><strong>Translation (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">आज दिन अच्छा है।</span></p>
        <p><strong>Translation (English):</strong> Today is a good day.</p>
      </div>
      
      <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; background-color: #f8fafc;">
        <h4 style="color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Entry 2: Water</h4>
        <p><strong>Word:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">nijm</span></p>
        <p><strong>Meaning (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">पानी, जल</span></p>
        <p><strong>Meaning (English):</strong> Water</p>
        <p><strong>Example:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">enak nijm kuDDa.</span></p>
        <p><strong>Translation (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">मुझे पानी पीना है।</span></p>
        <p><strong>Translation (English):</strong> I want to drink water.</p>
      </div>
      
      <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; background-color: #f8fafc;">
        <h4 style="color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Entry 3: Village</h4>
        <p><strong>Word:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">gRam</span></p>
        <p><strong>Meaning (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">गाँव, ग्राम</span></p>
        <p><strong>Meaning (English):</strong> Village</p>
        <p><strong>Example:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">en gRam bara sohna manja.</span></p>
        <p><strong>Translation (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">मेरा गाँव बहुत सुंदर है।</span></p>
        <p><strong>Translation (English):</strong> My village is very beautiful.</p>
      </div>
    `;
    setEditorContent(sampleContent);
  };

  // Function to clear content
  const clearContent = () => {
    setEditorContent('');
  };

  // Function to add a new dictionary entry template
  const addDictionaryEntryTemplate = () => {
    if (!newEntryWord.trim()) {
      alert('Please enter a word for the new entry');
      return;
    }

    const entryTemplate = `
      <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; background-color: #f8fafc;">
        <h4 style="color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Entry: ${newEntryWord}</h4>
        <p><strong>Word:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">${newEntryWord}</span></p>
        <p><strong>Meaning (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">Hindi meaning here...</span></p>
        <p><strong>Meaning (English):</strong> English meaning here...</p>
        <p><strong>Example:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">Example sentence here...</span></p>
        <p><strong>Translation (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">Hindi translation here...</span></p>
        <p><strong>Translation (English):</strong> English translation here...</p>
      </div>
    `;

    setEditorContent((prevContent) => {
      if (prevContent) {
        return prevContent + entryTemplate;
      }
      return entryTemplate;
    });

    setNewEntryWord('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Tiptap Kurukh Editor Demo</h1>

      <div className="space-y-6">
        {/* Control Panel */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Editor Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={clearContent}
              className="btn btn-outline btn-sm"
            >
              Clear Content
            </button>
            <button
              onClick={loadSampleContent}
              className="btn btn-outline btn-sm"
            >
              Load Sample Content
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

          {/* Dictionary Entry Template Generator */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-md font-semibold mb-2">Dictionary Entry Generator</h3>
            <div className="flex gap-2">
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
            <p className="text-xs text-gray-500 mt-1">
              Creates a new dictionary entry template with formatting for Kurukh and Hindi text.
            </p>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tiptap Kurukh Rich Text Editor</h2>
          <TiptapKurukhEditor
            content={editorContent}
            placeholder="Start typing here... Select text and click 'Kurukh' to format in Kurukh font!"
            onContentChange={handleContentChange}
            disabled={isDisabled}
            showToolbar={showToolbar}
            className="min-h-[200px]"
          />
        </div>

        {/* Output Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HTML Output */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">HTML Output</h2>
            <div className="bg-gray-100 p-4 rounded-lg min-h-[8rem] max-h-64 overflow-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {editorContent || '(empty)'}
              </pre>
            </div>
          </div>

          {/* Rendered Preview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Rendered Preview</h2>
            <div className="bg-white p-4 rounded-lg border min-h-[8rem] max-h-64 overflow-auto">
              <div
                dangerouslySetInnerHTML={{ __html: editorContent || '<p class="text-gray-400">(empty)</p>' }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How to Use</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Basic Editing:</strong> Type normally in the editor</li>
            <li><strong>Format as Kurukh:</strong> Select text and click the "Kurukh" button in the toolbar</li>
            <li><strong>Format as Hindi:</strong> Select text and click the "हिंदी (Hindi)" button to apply Devanagari font</li>
            <li><strong>Apply to All:</strong> Use "All→Kurukh" or "All→Hindi" to convert entire content to respective font</li>
            <li><strong>Remove Formatting:</strong> Use "Remove Kurukh" or "Remove Hindi" to remove respective font formatting</li>
            <li><strong>Mixed Content:</strong> You can have regular text, Kurukh text, and Hindi text all in the same document</li>
            <li><strong>Rich Text Features:</strong> Bold, italic, undo/redo all work with both Kurukh and Hindi text</li>
            <li><strong>Selection:</strong> Select specific words or paragraphs to apply formatting</li>
          </ul>
        </div>

        {/* Technical Features */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Technical Features</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Tiptap Integration:</strong> Built on top of ProseMirror for robust editing</li>
            <li><strong>Custom Extensions:</strong> KurukhFormat and HindiFont extensions for specialized font management</li>
            <li><strong>Multilingual Support:</strong> Seamless integration of Kurukh and Hindi (Devanagari) text</li>
            <li><strong>Font Persistence:</strong> Special font formatting is saved in HTML output</li>
            <li><strong>Responsive Design:</strong> Works on desktop and mobile devices</li>
            <li><strong>Accessibility:</strong> Proper ARIA labels and keyboard navigation</li>
            <li><strong>Performance:</strong> Efficient rendering with virtual DOM updates</li>
            <li><strong>Extensible:</strong> Easy to add more formatting options</li>
          </ul>
        </div>

        {/* Comparison */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Comparison with Basic Editor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Tiptap Editor Advantages:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Rich text formatting (bold, italic, etc.)</li>
                <li>Undo/Redo functionality</li>
                <li>Proper HTML output</li>
                <li>Better accessibility</li>
                <li>Extensible with plugins</li>
                <li>Professional editing experience</li>
                <li>Mixed content support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">📝 Basic Editor Features:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Character-by-character control</li>
                <li>Custom cursor implementation</li>
                <li>Simple text input/output</li>
                <li>Lightweight implementation</li>
                <li>Direct keyboard mapping</li>
                <li>Custom styling per character</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Multilingual Support */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-4">Multilingual Dictionary Support</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Kurukh Column */}
            <div className="bg-blue-100 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">Kurukh Language</h4>
              <div className="text-sm space-y-2">
                <p>
                  Use the specialized KellyTolong font for proper rendering of Kurukh characters and text.
                </p>

                <h5 className="font-medium text-blue-700">Using Kurukh Text:</h5>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Type or paste Kurukh text into the editor</li>
                  <li>Select the text you want to format</li>
                  <li>Click the "Kurukh" button to apply the special font</li>
                </ol>

                <h5 className="font-medium text-blue-700">Kurukh Features:</h5>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Custom Font:</strong> Uses KellyTolong font for accurate Kurukh character display</li>
                  <li><strong>Font Size:</strong> Displayed at 1.5rem with 1.6 line height for clarity</li>
                  <li><strong>One-Click Formatting:</strong> Apply to selected text or the entire document</li>
                </ul>

                <div className="bg-white p-3 rounded border mt-2">
                  <p className="text-sm font-medium mb-1">Example:</p>
                  <p style={{ fontFamily: 'KellyTolong, monospace', fontSize: '1.5rem', lineHeight: '1.6' }}>
                    onDro namma manjaa
                  </p>
                </div>
              </div>
            </div>

            {/* Hindi Column */}
            <div className="bg-orange-100 p-4 rounded-lg">
              <h4 className="font-medium text-orange-700 mb-2">Hindi Language</h4>
              <div className="text-sm space-y-2">
                <p>
                  Full support for Hindi text using the Noto Sans Devanagari font, perfect for bilingual dictionary entries.
                </p>

                <h5 className="font-medium text-orange-700">Using Hindi Text:</h5>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Type or paste Hindi text into the editor</li>
                  <li>Select the text you want to format</li>
                  <li>Click the <span className="font-medium">"हिंदी (Hindi)"</span> button to apply the Devanagari font</li>
                </ol>

                <h5 className="font-medium text-orange-700">Hindi Features:</h5>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Proper Font:</strong> Uses Google's Noto Sans Devanagari font</li>
                  <li><strong>Font Size:</strong> Displayed at 1.2rem with 1.5 line height for readability</li>
                  <li><strong>One-Click Formatting:</strong> Apply to selected text or the entire document</li>
                </ul>

                <div className="bg-white p-3 rounded border mt-2">
                  <p className="text-sm font-medium mb-1">Example:</p>
                  <p style={{ fontFamily: '"Noto Sans Devanagari", Arial, sans-serif', fontSize: '1.2rem' }}>
                    नमस्ते! यह हिंदी में एक उदाहरण है।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Multilingual Example */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-700 mb-2">Complete Dictionary Entry Example:</h4>
            <div className="text-sm">
              <p><strong>Word:</strong> <span style={{ fontFamily: 'KellyTolong, monospace', fontSize: '1.5rem' }}>enga</span></p>
              <p><strong>Meaning (Hindi):</strong> <span style={{ fontFamily: '"Noto Sans Devanagari", Arial, sans-serif', fontSize: '1.2rem' }}>अच्छा, सुंदर</span></p>
              <p><strong>Meaning (English):</strong> Good, beautiful</p>
              <p><strong>Example:</strong> <span style={{ fontFamily: 'KellyTolong, monospace', fontSize: '1.5rem' }}>i onDro enga manja.</span></p>
              <p><strong>Translation (Hindi):</strong> <span style={{ fontFamily: '"Noto Sans Devanagari", Arial, sans-serif', fontSize: '1.2rem' }}>यह दिन अच्छा है।</span></p>
              <p><strong>Translation (English):</strong> This day is good.</p>
            </div>
          </div>
        </div>

        {/* Language Support Tools */}
        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">Language Support Tools</h3>
          <p className="text-sm mb-4">
            Click on any phrase to insert it into the editor with proper formatting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kurukh Quick Phrases */}
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Kurukh Quick Phrases</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: 'namma', meaning: 'good' },
                  { text: 'onDro', meaning: 'day' },
                  { text: 'nijm', meaning: 'water' },
                  { text: 'gRam', meaning: 'village' },
                  { text: 'enga', meaning: 'beautiful' },
                  { text: 'kheb', meaning: 'ear' },
                  { text: 'kanD', meaning: 'eye' },
                ].map(phrase => (
                  <button
                    key={phrase.text}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                    style={{ fontFamily: 'KellyTolong, monospace', fontSize: '1.2rem' }}
                    title={`Insert "${phrase.text}" (${phrase.meaning})`}
                    onClick={() => {
                      const kurukhPhrase = `<span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">${phrase.text}</span>`;
                      setEditorContent(prev => prev + kurukhPhrase);
                    }}
                  >
                    {phrase.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Hindi Quick Phrases */}
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Hindi Quick Phrases</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: 'अच्छा', meaning: 'good' },
                  { text: 'दिन', meaning: 'day' },
                  { text: 'पानी', meaning: 'water' },
                  { text: 'गाँव', meaning: 'village' },
                  { text: 'सुंदर', meaning: 'beautiful' },
                  { text: 'कान', meaning: 'ear' },
                  { text: 'आँख', meaning: 'eye' },
                ].map(phrase => (
                  <button
                    key={phrase.text}
                    className="px-2 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-sm"
                    style={{ fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' }}
                    title={`Insert "${phrase.text}" (${phrase.meaning})`}
                    onClick={() => {
                      const hindiPhrase = `<span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">${phrase.text}</span>`;
                      setEditorContent(prev => prev + hindiPhrase);
                    }}
                  >
                    {phrase.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditorDemo;
