import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../../types';
import styles from './ChatPane.module.css';

interface ChatPaneProps {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  open: boolean;
}

const ChatPane: React.FC<ChatPaneProps> = ({ messages, onSend, open }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <aside id="chat-pane" className={styles.pane}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Chat</span>
        <span className={styles.headerCount}>{messages.length}</span>
      </div>

      <div id="chat-messages" className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.noMessages}>No messages yet. Say hi! 👋</div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.bubble} ${m.type === 'local' ? styles.local : styles.remote}`}
          >
            <div className={styles.senderInfo}>
              {m.type === 'local' ? 'You' : m.sender} ·{' '}
              {new Date(m.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className={styles.msgText}>{m.msg}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          id="chat-input"
          className={styles.textarea}
          placeholder="Type a message…"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          id="chat-input-btn"
          className={styles.sendBtn}
          onClick={handleSend}
        >
          ➤
        </button>
      </div>
    </aside>
  );
};

export default ChatPane;
