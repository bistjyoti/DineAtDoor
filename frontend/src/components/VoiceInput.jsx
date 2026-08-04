import React, { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ onVoiceInput, placeholder = "Click to speak..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for HTTPS (required on Vercel)
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost';

    const SpeechRecognition = window.SpeechRecognition || 
                               window.webkitSpeechRecognition;

    if (SpeechRecognition && isSecure) {
      setIsBrowserSupported(true);

      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        const finalTranscript = event.results[0][0].transcript;
        const cleanTranscript = finalTranscript.trim();
        setTranscript(cleanTranscript);
        if (onVoiceInput) onVoiceInput(cleanTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        // Handle specific Vercel/HTTPS errors
        switch (event.error) {
          case 'not-allowed':
            setErrorMsg('Microphone access denied. Please allow mic permission.');
            break;
          case 'network':
            setErrorMsg('Network error. Check your connection.');
            break;
          case 'no-speech':
            setErrorMsg('No speech detected. Try again.');
            break;
          default:
            setErrorMsg(`Error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else if (!isSecure) {
      setErrorMsg('Voice input requires HTTPS.');
    }
  }, []);

  const handleToggle = async () => {
    if (!isBrowserSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    // Explicitly request mic permission before starting (KEY FIX for Vercel)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setErrorMsg('');
      recognitionRef.current?.start();
    } catch (err) {
      setErrorMsg('Microphone permission denied.');
      setIsListening(false);
    }
  };

  return (
    <div className="voice-input-container">
      <button
        onClick={handleToggle}
        disabled={!isBrowserSupported}
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        title={isBrowserSupported ? placeholder : 'Voice not supported'}
      >
        {isListening ? '🔴 Listening...' : '🎤'}
      </button>

      {transcript && (
        <span className="transcript-text">{transcript}</span>
      )}

      {errorMsg && (
        <span className="voice-error" style={{ color: 'red', fontSize: '12px' }}>
          {errorMsg}
        </span>
      )}

      {!isBrowserSupported && (
        <span style={{ color: 'gray', fontSize: '12px' }}>
          Voice not supported in this browser
        </span>
      )}
    </div>
  );
};

export default VoiceInput;