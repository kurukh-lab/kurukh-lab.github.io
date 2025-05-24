import React from 'react';

/**
 * Button to pronounce a word using browser's speech synthesis
 * @param {object} props - Component props
 * @param {string} props.text - The text to pronounce
 * @param {string} [props.lang='en'] - The language code for pronunciation
 */
const PronunciationButton = ({ text, lang = 'en' }) => {
  // Check if speech synthesis is available in the browser
  const isSpeechSynthesisAvailable = 'speechSynthesis' in window;
  
  const handlePronounce = () => {
    if (!isSpeechSynthesisAvailable) {
      console.warn('Speech synthesis is not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Speak the word
    window.speechSynthesis.speak(utterance);
  };
  
  if (!isSpeechSynthesisAvailable) {
    return null; // Don't render anything if speech synthesis is not available
  }
  
  return (
    <button 
      onClick={handlePronounce}
      className="btn btn-ghost btn-xs"
      title="Click to hear pronunciation"
      aria-label={`Pronounce ${text}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        fill="currentColor" 
        className="bi bi-volume-up" 
        viewBox="0 0 16 16"
      >
        <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
        <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
        <path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z"/>
      </svg>
    </button>
  );
};

export default PronunciationButton;
