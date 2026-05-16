import { useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

// SpeechRecognition is a vendor-prefixed Web Speech API surface that TS
// doesn't expose by default. Type a minimal slice we use here.
interface SpeechRecognitionResult {
  readonly transcript: string;
}
interface SpeechRecognitionResultList {
  [index: number]: { [index: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
}

const VoiceSearchButton = ({ onResult }: VoiceSearchButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    );
  }, []);

  const startListening = () => {
    if (!supported) return;
    setIsListening(true);

    const Ctor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setIsListening(false);
      return;
    }
    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={isListening}
      className={`btn ${isListening ? 'btn-error' : 'btn-ghost'} join-item`}
      title="Search by voice"
    >
      {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
    </button>
  );
};

export default VoiceSearchButton;
