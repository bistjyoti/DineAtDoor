import React, { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ onVoiceInput, placeholder = "Click to speak..." }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isBrowserSupported, setIsBrowserSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            setIsBrowserSupported(true);
            const recognition = new SpeechRecognition();

            recognition.continuous = false; // Short commands ke liye best
            recognition.interimResults = false; 
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            
            recognition.onresult = (event) => {
                const finalTranscript = event.results[0][0].transcript;
                const cleanTranscript = finalTranscript.trim();
                setTranscript(cleanTranscript);
                if (onVoiceInput) onVoiceInput(cleanTranscript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
        };
    }, [onVoiceInput]);

    const startListening = () => {
        setTranscript(''); 
        if (onVoiceInput) onVoiceInput('');

        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                // Agar already active hai, toh restart logic
                recognitionRef.current.stop();
                setTimeout(() => recognitionRef.current.start(), 200);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    if (!isBrowserSupported) {
        return <p style={{ color: 'red', fontWeight: 'bold' }}>Browser doesn't support speech features.</p>;
    }

    return (
        <div style={styles.container}>
            <input
                type="text"
                value={transcript}
                placeholder={placeholder}
                readOnly
                style={styles.input}
            />

            <div style={styles.buttonGroup}>
                <button onClick={startListening} disabled={isListening} style={{...styles.button, ...styles.startButton}}>
                    {isListening ? "🎙️ Listening..." : "🎤 Start"}
                </button>
                <button onClick={stopListening} disabled={!isListening} style={{...styles.button, ...styles.stopButton}}>
                    ⏹ Stop
                </button>
                {transcript && (
                    <button onClick={() => speakText(transcript)} style={{...styles.button, ...styles.speakButton}}>
                        🔊 Play
                    </button>
                )}
            </div>

            <p style={styles.status}>
                {isListening ? '🔴 Live Listening...' : transcript ? '✅ Captured' : ''}
            </p>
        </div>
    );
};

const styles = {
    container: { padding: '15px', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    input: { width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' },
    buttonGroup: { display: 'flex', gap: '8px' },
    button: { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
    startButton: { backgroundColor: '#4CAF50', color: 'white' },
    stopButton: { backgroundColor: '#f44336', color: 'white' },
    speakButton: { backgroundColor: '#2196F3', color: 'white' },
    status: { marginTop: '10px', fontSize: '12px', color: '#555', fontWeight: 'bold' }
};

export default VoiceInput;