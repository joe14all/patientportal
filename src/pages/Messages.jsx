import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngagementData } from '../contexts';
import { IconSend, IconMessages } from '../layouts/components/Icons';
import styles from './Messages.module.css';

const Messages = () => {
  const { 
    messageThreads, 
    createNewThread, 
    loading, 
    error 
  } = useEngagementData();
  
  const navigate = useNavigate();

  // State for the "New Message" form
  const [isComposing, setIsComposing] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');

  const handleThreadClick = (threadId) => {
    // Navigate to the specific thread page
    navigate(`/messages/${threadId}`);
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!newSubject || !newBody) {
      alert("Please fill out both a subject and a message body.");
      return;
    }
    
    try {
      // "Clinical" is a good default category
      await createNewThread(newSubject, 'Clinical', newBody);
      // Reset form and hide it
      setIsComposing(false);
      setNewSubject('');
      setNewBody('');
    } catch (err) {
      console.error("Failed to create thread", err);
      // Error is handled in context
    }
  };

  // Helper to format date
  const formatLastDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h1>Messages</h1>
        <button 
          className={styles.composeButton} 
          onClick={() => setIsComposing(prev => !prev)}
        >
          {isComposing ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {error && <p className="error-text">Error: {error}</p>}

      {/* --- New Message Form --- */}
      {isComposing && (
        <div className={`card ${styles.composeCard}`}>
          <form onSubmit={handleComposeSubmit}>
            <h2>New Message</h2>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input 
                type="text" 
                id="subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Question about my treatment plan..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="body">Message</label>
              <textarea 
                id="body"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows="5"
                placeholder="Hi Dr. Farnsworth, I had a question..."
              ></textarea>
            </div>
            <div className={styles.composeActions}>
              <button 
                type="button" 
                className="secondary" 
                onClick={() => setIsComposing(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Thread List --- */}
      {loading && messageThreads.length === 0 && <p>Loading messages...</p>}
      
      <div className={styles.threadList}>
        {messageThreads.length > 0 ? (
          messageThreads.map(thread => (
            <div 
              className={`card ${styles.threadItem}`} 
              key={thread.id}
              onClick={() => handleThreadClick(thread.id)}
            >
              <div 
                className={`${styles.readIndicator} ${!thread.readStatus.isReadByPatient ? styles.unread : ''}`}
              ></div>
              <div className={styles.threadInfo}>
                <span className={styles.threadSubject}>{thread.subject}</span>
                <span className={styles.threadSnippet}>
                  {thread.lastMessage.snippet}
                </span>
              </div>
              <div className={styles.threadMeta}>
                <span className={styles.threadDate}>
                  {formatLastDate(thread.lastMessage.timestamp)}
                </span>
                <span className={styles.threadStatus}>
                  {thread.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>You have no messages.</p>
        )}
      </div>
    </div>
  );
};

export default Messages;