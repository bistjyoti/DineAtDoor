import React, { useState, useEffect } from 'react';

const VoiceInput = ({ onVoiceInput, placeholder = "Click to speak..." }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isBrowserSupported, setIsBrowserSupported] = useState(false);
    const recognitionRef = React.useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            setIsBrowserSupported(true);
            recognitionRef.current = new SpeechRecognition();

            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        setTranscript(transcript);
                        onVoiceInput(transcript);
                    } else {
                        interimTranscript += transcript;
                    }
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onVoiceInput]);

    const startListening = () => {
        setTranscript('');
        recognitionRef.current?.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    if (!isBrowserSupported) {
        return <p>Speech Recognition not supported in this browser</p>;
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
                {isListening ? '🎤 Listening...' : ''}
                {transcript && !isListening ? '✓ Captured' : ''}
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
        backgroundColor: '#f9f9f9'
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px'
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
        fontWeight: 'bold'
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
        fontSize: '12px',
        color: '#666'
    }
};

export default VoiceInput;
