import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import TiptapKurukhEditor from '../components/editor/TiptapKurukhEditor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const KurukhEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isExporting, setIsExporting] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const editorRef = useRef(null);

  const handleContentChange = ({ html, text, editor }) => {
    setEditorContent(html);
    // Auto-save indication
    setSavedAt(new Date());
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Create a temporary div for PDF export
      const exportDiv = document.createElement('div');
      exportDiv.style.cssText = `
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        margin: 0 auto;
        background: white;
        font-family: 'Times New Roman', serif;
        line-height: 1.6;
        color: #000;
      `;

      // Add title
      const titleElement = document.createElement('h1');
      titleElement.textContent = documentTitle;
      titleElement.style.cssText = `
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
      `;
      exportDiv.appendChild(titleElement);

      // Add content
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = editorContent;

      // Apply PDF-specific styles to Kurukh text
      const kurukhElements = contentDiv.querySelectorAll('.kurukh-text, [style*="KellyTolong"]');
      kurukhElements.forEach(el => {
        el.style.fontFamily = 'KellyTolong, monospace';
        el.style.fontSize = '18px';
        el.style.lineHeight = '1.6';
      });

      // Apply PDF-specific styles to Hindi text
      const hindiElements = contentDiv.querySelectorAll('.hindi-text, [style*="Noto Sans Devanagari"]');
      hindiElements.forEach(el => {
        el.style.fontFamily = '"Noto Sans Devanagari", Arial, sans-serif';
        el.style.fontSize = '16px';
        el.style.lineHeight = '1.5';
      });

      exportDiv.appendChild(contentDiv);
      document.body.appendChild(exportDiv);

      // Generate PDF
      const canvas = await html2canvas(exportDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      document.body.removeChild(exportDiv);

      // Download PDF
      const fileName = `${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const saveAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: 'KellyTolong';
            src: url('kellytolong4.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            color: #000;
        }
        .kurukh-text, [style*="KellyTolong"] {
            font-family: 'KellyTolong', monospace !important;
            font-size: 1.5rem !important;
            line-height: 1.6 !important;
        }
        .hindi-text, [style*="Noto Sans Devanagari"] {
            font-family: 'Noto Sans Devanagari', Arial, sans-serif !important;
            font-size: 1.2rem !important;
            line-height: 1.5 !important;
        }
    </style>
</head>
<body>
    <h1>${documentTitle}</h1>
    ${editorContent}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const newDocument = () => {
    if (editorContent && confirm('Are you sure you want to create a new document? Unsaved changes will be lost.')) {
      setEditorContent('');
      setDocumentTitle('Untitled Document');
      setSavedAt(null);
    } else if (!editorContent) {
      setEditorContent('');
      setDocumentTitle('Untitled Document');
      setSavedAt(null);
    }
  };

  const loadTemplate = (templateType) => {
    let template = '';

    switch (templateType) {
      case 'dictionary':
        template = `
          <h1>Kurukh Dictionary Entry</h1>
          <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; background-color: #f8fafc;">
            <h3 style="color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Word Entry</h3>
            <p><strong>Word:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">[Enter Kurukh word here]</span></p>
            <p><strong>Meaning (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">[हिंदी अर्थ यहाँ लिखें]</span></p>
            <p><strong>Meaning (English):</strong> [Enter English meaning here]</p>
            <p><strong>Example:</strong> <span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">[Example sentence in Kurukh]</span></p>
            <p><strong>Translation (Hindi):</strong> <span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">[हिंदी अनुवाद]</span></p>
            <p><strong>Translation (English):</strong> [English translation]</p>
          </div>
        `;
        setDocumentTitle('Kurukh Dictionary Entry');
        break;
      case 'story':
        template = `
          <h1>Kurukh Story</h1>
          <p>Once upon a time in a beautiful village, there lived...</p>
          <p><span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">enga gRam men...</span></p>
          <p><span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">एक सुंदर गाँव में...</span></p>
        `;
        setDocumentTitle('Kurukh Story');
        break;
      case 'letter':
        template = `
          <div style="margin-bottom: 2rem;">
            <p style="text-align: right;">[Date]</p>
            <p>Dear [Name],</p>
            <p><span style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 1.2rem; line-height: 1.5;">प्रिय [नाम],</span></p>
            <p><span style="font-family: KellyTolong, monospace; font-size: 1.5rem; line-height: 1.6;">[Kurukh greeting]</span></p>
            <br>
            <p>[Letter content...]</p>
            <br>
            <p>Sincerely,<br>[Your name]</p>
          </div>
        `;
        setDocumentTitle('Letter');
        break;
      default:
        template = '<p>Start writing your document here...</p>';
    }

    setEditorContent(template);
  };

  return (
    <div className="kurukh-editor-fullscreen bg-gray-200">
      {/* Microsoft Word-style Title Bar */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="px-4 py-2">
          {/* Title bar with document name */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 text-lg font-bold">📝</span>
                <h1 className="text-lg font-semibold text-gray-800">Kurukh Editor</h1>
              </div>
              <span className="text-gray-400">-</span>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-sm bg-transparent border-none focus:outline-none focus:bg-blue-50 px-2 py-1 rounded min-w-[250px] font-medium"
                placeholder="Document title..."
              />
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {savedAt && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Saved {savedAt.toLocaleTimeString()}</span>
                </div>
              )}
              {isExporting && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  <span className="text-blue-600 font-medium">Exporting...</span>
                </div>
              )}
              <span className="text-gray-400">|</span>
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                Back to Kurukh Dictionary
              </Link>
            </div>
          </div>

          {/* Quick Access Toolbar */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            {/* Left side - File operations */}
            <div className="flex items-center space-x-1">
              <button
                onClick={newDocument}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>📄</span>
                <span>New Document</span>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm">
                  <span>📋</span>
                  <span>Templates</span>
                  <span className="text-xs">▼</span>
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-max">
                  <button
                    onClick={() => loadTemplate('dictionary')}
                    className="block w-full px-4 py-3 text-sm text-left hover:bg-blue-50 border-b border-gray-100"
                  >
                    <div className="font-medium">📖 Dictionary Entry</div>
                    <div className="text-xs text-gray-500">Structured word definition template</div>
                  </button>
                  <button
                    onClick={() => loadTemplate('story')}
                    className="block w-full px-4 py-3 text-sm text-left hover:bg-blue-50 border-b border-gray-100"
                  >
                    <div className="font-medium">📚 Story</div>
                    <div className="text-xs text-gray-500">Bilingual storytelling format</div>
                  </button>
                  <button
                    onClick={() => loadTemplate('letter')}
                    className="block w-full px-4 py-3 text-sm text-left hover:bg-blue-50"
                  >
                    <div className="font-medium">✉️ Letter</div>
                    <div className="text-xs text-gray-500">Formal letter template</div>
                  </button>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              <button
                onClick={exportToPDF}
                disabled={isExporting || !editorContent}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <span>📑</span>
                <span>Export PDF</span>
              </button>

              <button
                onClick={saveAsHTML}
                disabled={!editorContent}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <span>💾</span>
                <span>Save HTML</span>
              </button>

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              <button
                onClick={() => setShowHelpModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors shadow-sm"
              >
                <span>❓</span>
                <span>Help & Tips</span>
              </button>
            </div>

            {/* Right side - Document stats */}
            <div className="flex items-center space-x-4 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
              <div className="flex items-center space-x-1">
                <span>📊</span>
                <span>Words: {editorContent ? editorContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0}</span>
              </div>
              <span className="w-px h-4 bg-gray-300"></span>
              <div className="flex items-center space-x-1">
                <span>🔤</span>
                <span>Characters: {editorContent ? editorContent.replace(/<[^>]*>/g, '').length : 0}</span>
              </div>
              <span className="w-px h-4 bg-gray-300"></span>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main editor area - responsive and full height */}
      <div className="kurukh-editor-main">
        <TiptapKurukhEditor
          ref={editorRef}
          content={editorContent}
          placeholder="Start writing your document here... Use the language buttons in the toolbar to format text in Kurukh (𝐊𝐮𝐫𝐮𝐤𝐡) or Hindi (हिंदी) fonts."
          onContentChange={handleContentChange}
          className="h-full"
          showToolbar={true}
        />
      </div>

      {/* Fixed Status Bar at Bottom */}
      <div className="kurukh-editor-status-bar bg-blue-600 text-white px-4 py-1 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span>Document</span>
          <span className="border-l border-blue-400 pl-4">
            Words: {editorContent ? editorContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0}
          </span>
          <span>
            Characters: {editorContent ? editorContent.replace(/<[^>]*>/g, '').length : 0}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span>📝 Ready</span>
          <span className="text-green-300">●</span>
        </div>
      </div>

      {/* Help and tips modal */}
      {showHelpModal && (
        <div className="help-modal-backdrop" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Help & Tips</h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800 flex items-center">
                    <span className="mr-2">🎯</span>
                    Quick Start
                  </h3>
                  <ul className="space-y-1 text-blue-700 text-xs">
                    <li>• Click "Templates" to start with a pre-formatted document</li>
                    <li>• Use <strong>Kurukh</strong> and <strong>हिंदी</strong> buttons to format text</li>
                    <li>• Bold: <kbd>Ctrl+B</kbd>, Italic: <kbd>Ctrl+I</kbd>, Underline: <kbd>Ctrl+U</kbd></li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-800 flex items-center">
                    <span className="mr-2">🌐</span>
                    Language Features
                  </h3>
                  <ul className="space-y-1 text-green-700 text-xs">
                    <li>• Select text and click language buttons to apply fonts</li>
                    <li>• Keyboard shortcuts: <kbd>Ctrl+K</kbd> (Kurukh), <kbd>Ctrl+H</kbd> (Hindi)</li>
                    <li>• Use dropdown tools to apply fonts to entire document</li>
                    <li>• Kurukh text appears in green, Hindi in brown</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-purple-800 flex items-center">
                    <span className="mr-2">💾</span>
                    Export Options
                  </h3>
                  <ul className="space-y-1 text-purple-700 text-xs">
                    <li>• <strong>PDF Export:</strong> High-quality document with embedded fonts</li>
                    <li>• <strong>HTML Save:</strong> Web-compatible with font references</li>
                    <li>• Auto-save keeps your work safe in browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KurukhEditor;
