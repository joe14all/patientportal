import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEngagementData, useAccountData } from '../contexts';
import { IconArrowLeft, IconSend } from '../layouts/components/Icons'; // [cite: src/layouts/components/Icons.jsx]
import styles from './Thread.module.css';

const Thread = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { 
    messageThreads, 
    messagePosts, 
    sendMessage, 
    markThreadAsRead, 
    loading, 
    error 
  } = useEngagementData();
  
  const { user } = useAccountData();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // --- Find the current thread and its posts ---
  const { thread, posts } = useMemo(() => {
    const currentThread = messageThreads.find(t => t.id === threadId);
    const threadPosts = messagePosts
      .filter(p => p.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort oldest to newest
    return { thread: currentThread, posts: threadPosts };
  }, [threadId, messageThreads, messagePosts]);

  // --- Auto-scroll to bottom ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [posts]); // Scroll when posts load/change

  // --- Mark thread as read on load ---
  useEffect(() => {
    if (thread && !thread.readStatus.isReadByPatient) {
      markThreadAsRead(threadId);
    }
    // Only run this once when the thread loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread, threadId]);

  // --- Handle Reply Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(threadId, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  if (loading && !thread) {
    return <p>Loading thread...</p>;
  }

  if (error) {
    return <p className="error-text">Error: {error}</p>;
  }

  if (!thread) {
    return <p>Message thread not found.</p>;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* --- Thread Header --- */}
      <div className={styles.threadHeader}>
        <button className="icon-button" onClick={() => navigate('/messages')}>
          <IconArrowLeft />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.headerSubject}>{thread.subject}</h1>
          <span className={styles.headerStatus}>{thread.status}</span>
        </div>
      </div>

      {/* --- Message List --- */}
      <div className={styles.messageList}>
        {posts.map(post => {
          const isMine = post.authorId === user.id;
          return (
            <div 
              key={post.id} 
              className={`${styles.messageBubble} ${isMine ? styles.mine : styles.theirs}`}
            >
              <div className={styles.bubbleHeader}>
                <strong>{isMine ? 'You' : post.authorName}</strong>
                <span>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <p className={styles.messageBody}>{post.body}</p>
              {/* TODO: Render attachments */}
            </div>
          );
        })}
        <div ref={messagesEndRef} /> {/* Anchor for auto-scroll */}
      </div>

      {/* --- Reply Form --- */}
      <form className={styles.replyForm} onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your reply..."
          disabled={loading}
        />
        <button type="submit" className="icon-button" disabled={loading}>
          <IconSend />
        </button>
      </form>
    </div>
  );
};

export default Thread;