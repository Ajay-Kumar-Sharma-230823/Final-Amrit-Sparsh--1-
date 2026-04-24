'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, StopCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isSpeaking?: boolean;
}

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isListening: boolean;
  isSpeaking: boolean;
  onMicClick: () => void;
  onStopClick: () => void;
  theme?: 'light' | 'dark' | 'brown' | 'pink';
}

export default function AIChat({
  messages,
  onSendMessage,
  isListening,
  isSpeaking,
  onMicClick,
  onStopClick,
  theme = 'dark',
}: AIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = React.useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const themeStyles = {
    light: {
      bg: '#ffffff',
      bgCard: '#f8f9fa',
      textPrimary: '#1a1a1a',
      textMuted: '#666666',
      accent: '#3b82f6',
      border: '#e5e7eb',
    },
    dark: {
      bg: 'rgba(15, 15, 20, 0.8)',
      bgCard: 'rgba(25, 25, 35, 0.9)',
      textPrimary: '#ffffff',
      textMuted: '#b0b0c0',
      accent: '#7c3aed',
      border: 'rgba(120, 119, 198, 0.3)',
    },
    brown: {
      bg: 'rgba(139, 94, 52, 0.1)',
      bgCard: 'rgba(212, 165, 116, 0.15)',
      textPrimary: '#8B5E34',
      textMuted: '#a0826d',
      accent: '#d4a574',
      border: 'rgba(212, 165, 116, 0.3)',
    },
    pink: {
      bg: 'rgba(252, 231, 243, 0.8)',
      bgCard: 'rgba(252, 165, 200, 0.2)',
      textPrimary: '#9f1239',
      textMuted: '#be185d',
      accent: '#ec4899',
      border: 'rgba(236, 72, 153, 0.3)',
    },
  };

  const styles = themeStyles[theme];

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        background: styles.bg,
        borderRadius: 20,
        border: `1px solid ${styles.border}`,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Chat Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: 12,
              }}
            >
              {/* AI Avatar */}
              {msg.role === 'ai' && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${styles.accent}, ${styles.textPrimary}20)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
              )}

              {/* Message Bubble */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                style={{
                  maxWidth: '75%',
                  background:
                    msg.role === 'user'
                      ? styles.accent
                      : styles.bgCard,
                  color:
                    msg.role === 'user'
                      ? '#ffffff'
                      : styles.textPrimary,
                  borderRadius: msg.role === 'user' ? 16 : 16,
                  padding: '12px 16px',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                  borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
                  wordWrap: 'break-word',
                  boxShadow:
                    msg.role === 'user'
                      ? `0 4px 12px rgba(124, 58, 237, 0.25)`
                      : `0 2px 8px rgba(0, 0, 0, 0.1)`,
                  position: 'relative',
                }}
              >
                {/* Typing animation for AI messages */}
                {msg.role === 'ai' && msg.isSpeaking && (
                  <div style={{ position: 'absolute', top: -30, left: 0, display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [-4, 0, -4] }}
                        transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: styles.accent,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                  {msg.text}
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    fontSize: 10,
                    marginTop: 6,
                    opacity: 0.7,
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </motion.div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: styles.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Listening indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: styles.accent,
              fontWeight: 600,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: styles.accent,
              }}
            />
            Listening...
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          borderTop: `1px solid ${styles.border}`,
          padding: '16px',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-end',
          background: `rgba(0, 0, 0, 0.1)`,
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Mic Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={isSpeaking ? onStopClick : onMicClick}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: isSpeaking ? '#ef4444' : styles.accent,
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: `0 4px 12px rgba(124, 58, 237, 0.3)`,
            transition: 'all 0.2s',
          }}
          title={isSpeaking ? 'Stop' : 'Voice input'}
        >
          {isSpeaking ? (
            <StopCircle size={18} />
          ) : (
            <motion.div animate={{ scale: isListening ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}>
              <Mic size={18} />
            </motion.div>
          )}
        </motion.button>

        {/* Text Input */}
        <motion.input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 24,
            border: `1px solid ${styles.border}`,
            background: styles.bgCard,
            color: styles.textPrimary,
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = styles.accent;
            (e.target as HTMLInputElement).style.boxShadow = `0 0 12px ${styles.accent}40`;
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = styles.border;
            (e.target as HTMLInputElement).style.boxShadow = 'none';
          }}
        />

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: inputText.trim() ? styles.accent : '#cccccc',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            boxShadow: inputText.trim() ? `0 4px 12px rgba(124, 58, 237, 0.3)` : 'none',
            transition: 'all 0.2s',
          }}
          title="Send message"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}
