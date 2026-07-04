import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { ChatMessage } from '../context/AppContext';

interface ChatWindowProps {
  chatHistory: ChatMessage[];
  currentRole: 'candidate' | 'recruiter';
  onSendMessage: (text: string) => void;
  title: string;
  showReciprocalBanner?: boolean;
  onConfirmProfile?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatHistory,
  currentRole,
  onSendMessage,
  title,
  showReciprocalBanner = false,
  onConfirmProfile
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="chat-container glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px', background: '#0B0E14', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
          {title}
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Direct Chat</span>
      </div>

      {/* Reciprocal Interest Banner */}
      {showReciprocalBanner && (
        <div style={{
          background: 'rgba(242, 153, 74, 0.15)',
          borderBottom: '1.5px solid var(--tech-orange)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          color: '#fff'
        }}>
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--tech-orange)', marginBottom: '4px' }}>
              🤝 Reciprocal Interest
            </h5>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Candidate wants position. Recruiter wants candidate.
            </p>
          </div>
          <button 
            type="button"
            onClick={onConfirmProfile}
            className="btn"
            style={{
              background: 'var(--tech-orange)',
              color: '#fff',
              fontSize: '12px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 750,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(242, 153, 74, 0.3)'
            }}
          >
            Confirm Profile
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '300px'
      }}>
        {chatHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
            marginTop: '32px'
          }}>
            No messages yet. Send a message to open the conversation!
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isSystem = msg.text.startsWith('[SYSTEM:');
            if (isSystem) {
              return (
                <div key={msg.id} style={{
                  alignSelf: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  margin: '8px 0',
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  {msg.text.replace('[SYSTEM: ', '').replace(']', '')}
                </div>
              );
            }

            const isMe = msg.sender === currentRole;
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  background: isMe
                    ? 'var(--primary-gradient)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isMe ? 'none' : '1px solid var(--border-color)',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  boxShadow: isMe ? '0 4px 10px -3px rgba(99, 102, 241, 0.3)' : 'none'
                }}>
                  {msg.text}
                </div>
                <span style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  padding: '0 4px'
                }}>
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{
        padding: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.1)'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message as ${currentRole === 'candidate' ? 'Job Seeker' : 'Recruiter'}...`}
          className="glass-input"
          style={{ flex: 1, padding: '10px 14px', fontSize: '13px', borderRadius: '8px' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px' }}
          disabled={!inputText.trim()}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
