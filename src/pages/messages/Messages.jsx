import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngagementData } from '../../contexts';
// --- 1. Import the new component ---
import NewMessageForm from '../../components/messages/NewMessageForm';
// --- 2. (IconSend and IconMessages are no longer needed here) ---
import styles from './Messages.module.css';

const Messages = () => {
  const { 
    messageThreads, 
    // --- 3. (createNewThread is no longer needed here) ---
    loading, 
    error 
  } = useEngagementData();
  
  const navigate = useNavigate();

  // --- 4. State is simplified to just manage visibility ---
  const [isComposing, setIsComposing] = useState(false);
  // (newSubject and newBody state is removed)

  const handleThreadClick = (threadId) => {
    // Navigate to the specific thread page
    navigate(`/messages/${threadId}`);
  };

  // --- 5. (handleComposeSubmit is removed) ---
  // The NewMessageForm component now handles its own submission.

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

      {/* --- 6. Render the new component --- */}
      {isComposing && (
        <NewMessageForm onClose={() => setIsComposing(false)} />
      )}

      {/* --- Thread List (remains the same) --- */}
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