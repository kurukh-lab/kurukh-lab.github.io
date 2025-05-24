import React, { useState, useEffect } from 'react';
import { Button } from 'react-daisyui';

/**
 * Voice search button component for search interface
 * @param {object} props Component props
 * @param {function} props.onResult Callback when voice result is ready
 */
const VoiceSearchButton = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    setSupported(
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window
    );
  }, []);

  const startListening = () => {
    if (!supported) return;
    
    setIsListening(true);
    
    // Use the appropriate SpeechRecognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  if (!supported) return null;
  
  return (
    <Button
      type="button"
      color="ghost"
      shape="circle"
      className={`absolute right-12 top-1/2 -translate-y-1/2 transition-all ${isListening ? 'scale-125 text-primary' : ''}`}
      size="sm"
      onClick={startListening}
      disabled={isListening}
      title="Search by voice"
    >
      {isListening ? (
        <span className="relative flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 5a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 3 0v-3A1.5 1.5 0 0 0 8 5z"/>
              <path d="M4.5 8a3.5 3.5 0 1 1 7 0v3a3.5 3.5 0 0 1-7 0V8zm7 3a3 3 0 0 1-6 0V8a3 3 0 1 1 6 0v3z"/>
            </svg>
          </span>
        </span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 5a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 3 0v-3A1.5 1.5 0 0 0 8 5z"/>
          <path d="M4.5 8a3.5 3.5 0 1 1 7 0v3a3.5 3.5 0 0 1-7 0V8zm7 3a3 3 0 0 1-6 0V8a3 3 0 1 1 6 0v3z"/>
        </svg>
      )}
    </Button>
  );
};

export default VoiceSearchButton;
