import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useEngagementData } from '../../contexts';
import styles from './ContentViewer.module.css';

/**
 * Content Viewer Component
 * Displays different types of educational content (video, article, interactive, checklist)
 * with streamlined viewing experience and automatic trophy awarding
 */
const ContentViewer = ({ content, isOpen, onClose }) => {
  const { markEducationContentViewed, awardTrophy } = useEngagementData();
  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    if (content?.type === 'checklist' && content.checklistData) {
      setChecklistItems(
        content.checklistData.map((item, index) => ({
          id: index,
          text: item,
          checked: false
        }))
      );
    }
  }, [content]);

  const handleMarkWatched = async () => {
    if (content) {
      await markEducationContentViewed(content.id);
      setWatched(true);
      
      // Award trophy if content has a completion badge
      if (content.completionBadge) {
        await awardTrophy({
          id: `trophy_${content.id}_${Date.now()}`,
          name: content.completionBadge,
          icon: '🏆',
          earnedAt: new Date().toISOString()
        });
      }
    }
  };

  const handleChecklistToggle = (id) => {
    setChecklistItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      const completedCount = updated.filter(item => item.checked).length;
      const newProgress = (completedCount / updated.length) * 100;
      setProgress(newProgress);
      
      if (newProgress === 100 && !watched) {
        handleMarkWatched();
      }
      
      return updated;
    });
  };

  const renderVideoContent = () => (
    <div className={styles.videoContainer}>
      <div className={styles.videoPlaceholder}>
        <span className={styles.playIcon}>▶️</span>
        <p>Video Player</p>
        <p className={styles.videoTitle}>{content.title}</p>
        <p className={styles.videoDuration}>Duration: {content.duration}</p>
      </div>
      <div className={styles.videoDescription}>
        <h3>About this video</h3>
        <p>{content.description}</p>
        {content.videoTranscript && (
          <details className={styles.transcript}>
            <summary>📝 View Transcript</summary>
            <p>{content.videoTranscript}</p>
          </details>
        )}
      </div>
      {!completed && (
        <button onClick={handleComplete} className={styles.completeButton}>
          ✓ Mark as Watched
        </button>
      )}
      {completed && (
        <div className={styles.completionBadge}>
          🎉 Completed! {content.completionBadge && `You earned: ${content.completionBadge}`}
        </div>
      )}
    </div>
  );

  const renderArticleContent = () => (
    <div className={styles.articleContainer}>
      <h2 className={styles.articleTitle}>{content.title}</h2>
      <div className={styles.articleMeta}>
        <span>📖 {content.duration}</span>
        <span>By Dental Health Experts</span>
      </div>
      <div className={styles.articleBody}>
        <p>{content.description}</p>
        <div className={styles.articleContent}>
          {content.articleSections?.map((section, index) => (
            <div key={index} className={styles.section}>
              <h3>{section.heading}</h3>
              <p>{section.content}</p>
            </div>
          )) || (
            <>
              <h3>Introduction</h3>
              <p>This comprehensive guide covers everything you need to know about {content.title.toLowerCase()}.</p>
              
              <h3>Key Points</h3>
              <ul>
                <li>Understanding the importance of proper dental care</li>
                <li>Step-by-step instructions and best practices</li>
                <li>Common mistakes to avoid</li>
                <li>When to consult your dentist</li>
              </ul>

              <h3>Conclusion</h3>
              <p>By following these guidelines, you'll maintain excellent oral health and prevent common dental issues.</p>
            </>
          )}
        </div>
      </div>
      {!completed && (
        <button onClick={handleComplete} className={styles.completeButton}>
          ✓ Mark as Read
        </button>
      )}
      {completed && (
        <div className={styles.completionBadge}>
          🎉 Completed! {content.completionBadge && `You earned: ${content.completionBadge}`}
        </div>
      )}
    </div>
  );

  const renderInteractiveContent = () => (
    <div className={styles.interactiveContainer}>
      <h2 className={styles.interactiveTitle}>{content.title}</h2>
      <p className={styles.interactiveDescription}>{content.description}</p>
      
      <div className={styles.interactiveDemo}>
        <div className={styles.demoPlaceholder}>
          <span className={styles.interactiveIcon}>🎮</span>
          <p>Interactive Module</p>
          <p>Click and drag to learn proper technique</p>
        </div>
        
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
        <p className={styles.progressText}>{Math.round(progress)}% Complete</p>
        
        <div className={styles.interactiveSteps}>
          <button 
            className={styles.stepButton}
            onClick={() => setProgress(Math.min(100, progress + 33.33))}
          >
            Next Step →
          </button>
        </div>
      </div>

      {progress === 100 && !completed && (
        <button onClick={handleComplete} className={styles.completeButton}>
          ✓ Mark as Completed
        </button>
      )}
      {completed && (
        <div className={styles.completionBadge}>
          🎉 Completed! {content.completionBadge && `You earned: ${content.completionBadge}`}
        </div>
      )}
    </div>
  );

  const renderChecklistContent = () => (
    <div className={styles.checklistContainer}>
      <h2 className={styles.checklistTitle}>{content.title}</h2>
      <p className={styles.checklistDescription}>{content.description}</p>
      
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
      </div>
      <p className={styles.progressText}>
        {checklistItems.filter(item => item.checked).length} of {checklistItems.length} completed
      </p>

      <div className={styles.checklistItems}>
        {checklistItems.map(item => (
          <label key={item.id} className={styles.checklistItem}>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleChecklistToggle(item.id)}
              className={styles.checkbox}
            />
            <span className={item.checked ? styles.checkedText : ''}>{item.text}</span>
          </label>
        ))}
      </div>

      {completed && (
        <div className={styles.completionBadge}>
          🎉 All Done! {content.completionBadge && `You earned: ${content.completionBadge}`}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (!content) return null;

    switch (content.type) {
      case 'video':
        return renderVideoContent();
      case 'article':
        return renderArticleContent();
      case 'interactive':
        return renderInteractiveContent();
      case 'checklist':
        return renderChecklistContent();
      default:
        return <p>Content type not supported</p>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content?.type === 'article' ? '' : content?.title}
      size="large"
    >
      <div className={styles.contentViewer}>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default ContentViewer;
