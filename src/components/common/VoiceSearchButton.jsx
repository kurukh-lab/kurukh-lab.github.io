import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

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
    <button
      type="button"
      onClick={startListening}
      disabled={isListening}
      className={`btn ${isListening ? 'btn-error' : 'btn-ghost'} join-item`} // Assuming Tailwind CSS classes
      title="Search by voice"
    >
      {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
    </button>
  );
};

export default VoiceSearchButton;
