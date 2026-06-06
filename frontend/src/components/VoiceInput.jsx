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

            // Strict settings taaki text bar-bar repeat na ho aur memory clear rahe
            recognition.continuous = false;
            recognition.interimResults = false; 
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const currentResultIndex = event.resultIndex;
                const finalTranscript = event.results[currentResultIndex][0].transcript;

                if (event.results[currentResultIndex].isFinal) {
                    // Ekdum fresh aur bina extra space ka text set hoga
                    const cleanTranscript = finalTranscript.trim();
                    setTranscript(cleanTranscript);
                    
                    if (onVoiceInput) {
                        onVoiceInput(cleanTranscript); // Parent component ko direct update karega
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onVoiceInput]);

    const startListening = () => {
        // Purani memory poori tarah flush karne ke liye
        setTranscript(''); 
        if (onVoiceInput) {
            onVoiceInput(''); 
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                // Agar process pehle se open ho toh refresh karke chalayega
                recognitionRef.current.stop();
                setTimeout(() => recognitionRef.current.start(), 150);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel(); // Purani TTS voice ko clear karne ke liye
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    if (!isBrowserSupported) {
        return <p style={{ color: 'red', fontWeight: 'bold' }}>Speech Recognition not supported in this browser</p>;
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
                <button
                    onClick={startListening}
                    disabled={isListening}
                    style={{...styles.button, ...styles.startButton}}
                >
                    🎤 Start Speaking
                </button>

                <button
                    onClick={stopListening}
                    disabled={!isListening}
                    style={{...styles.button, ...styles.stopButton}}
                >
                    ⏹ Stop
                </button>

                {transcript && (
                    <button
                        onClick={() => speakText(transcript)}
                        style={{...styles.button, ...styles.speakButton}}
                    >
                        🔊 Speak Back
                    </button>
                )}
            </div>

            <p style={styles.status}>
                {isListening ? '🎤 Live Listening... Speak now!' : ''}
                {transcript && !isListening ? '✓ Captured Successfully' : ''}
            </p>
        </div>
    );
};

const styles = {
    container: {
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '15px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },
    button: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s'
    },
    startButton: {
        backgroundColor: '#4CAF50',
        color: 'white'
    },
    stopButton: {
        backgroundColor: '#f44336',
        color: 'white'
    },
    speakButton: {
        backgroundColor: '#2196F3',
        color: 'white'
    },
    status: {
        marginTop: '10px',
        fontSize: '13px',
        color: '#d9534f',
        fontWeight: '500'
    }
};

export default VoiceInput;