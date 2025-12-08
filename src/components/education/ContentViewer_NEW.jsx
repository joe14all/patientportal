import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useEngagementData } from '../../contexts';
import styles from './ContentViewer.module.css';

/**
 * Content Viewer Component - Redesigned for Better UX
 * Streamlined viewing experience with attractive UI and automatic trophy awarding
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
        <div className={styles.playIconWrapper}>
          <span className={styles.playIcon}>▶</span>
        </div>
        <p className={styles.placeholderText}>Video Content</p>
      </div>
      <div className={styles.videoInfo}>
        <h3 className={styles.contentTitle}>{content.title}</h3>
        <div className={styles.metaInfo}>
          <span className={styles.duration}>⏱ {content.duration || '5 min'}</span>
        </div>
        <p className={styles.description}>{content.description}</p>
      </div>
      {content.transcript && (
        <div className={styles.transcript}>
          <h4 className={styles.transcriptTitle}>📝 Transcript</h4>
          <p className={styles.transcriptContent}>{content.transcript}</p>
        </div>
      )}
      <div className={styles.actionFooter}>
        {!watched ? (
          <button className={styles.watchButton} onClick={handleMarkWatched}>
            <span className={styles.buttonIcon}>✓</span>
            Mark as Watched
          </button>
        ) : (
          <div className={styles.watchedBadge}>
            <span className={styles.badgeIcon}>✓</span>
            Watched
          </div>
        )}
      </div>
    </div>
  );

  const renderArticleContent = () => (
    <div className={styles.articleContainer}>
      <div className={styles.articleHeader}>
        <h3 className={styles.contentTitle}>{content.title}</h3>
        <div className={styles.metaInfo}>
          <span className={styles.readingTime}>📖 {content.readingTime || '3 min read'}</span>
        </div>
      </div>
      <div className={styles.articleBody}>
        {content.sections?.map((section, idx) => (
          <div key={idx} className={styles.section}>
            <h4 className={styles.sectionHeading}>{section.heading}</h4>
            <p className={styles.sectionContent}>{section.content}</p>
          </div>
        ))}
      </div>
      <div className={styles.actionFooter}>
        {!watched ? (
          <button className={styles.watchButton} onClick={handleMarkWatched}>
            <span className={styles.buttonIcon}>✓</span>
            Mark as Read
          </button>
        ) : (
          <div className={styles.watchedBadge}>
            <span className={styles.badgeIcon}>✓</span>
            Read
          </div>
        )}
      </div>
    </div>
  );

  const renderInteractiveContent = () => (
    <div className={styles.interactiveContainer}>
      <div className={styles.interactiveHeader}>
        <h3 className={styles.contentTitle}>{content.title}</h3>
        <p className={styles.description}>{content.description}</p>
      </div>
      <div className={styles.interactiveDemo}>
        <div className={styles.demoPlaceholder}>
          <span className={styles.demoIcon}>🎯</span>
          <p className={styles.demoText}>Interactive Learning Module</p>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Your Progress</span>
            <span className={styles.progressPercent}>{Math.round(progress)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={styles.interactiveControls}>
          <button className={styles.stepButton} onClick={() => setProgress(Math.min(progress + 25, 100))}>
            <span className={styles.buttonIcon}>→</span>
            Next Step
          </button>
          <button className={styles.resetButton} onClick={() => setProgress(0)}>Reset</button>
        </div>
      </div>
      {progress === 100 && (
        <div className={styles.watchedBadge}>
          <span className={styles.badgeIcon}>✓</span>
          Completed
        </div>
      )}
    </div>
  );

  const renderChecklistContent = () => (
    <div className={styles.checklistContainer}>
      <div className={styles.checklistHeader}>
        <h3 className={styles.contentTitle}>{content.title}</h3>
        <p className={styles.description}>{content.description}</p>
      </div>
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Completion Progress</span>
          <span className={styles.progressPercent}>{Math.round(progress)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className={styles.checklistItems}>
        {checklistItems.map(item => (
          <label key={item.id} className={`${styles.checklistItem} ${item.checked ? styles.checked : ''}`}>
            <div className={styles.customCheckbox}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleChecklistToggle(item.id)}
              />
              <span className={styles.checkmark}>✓</span>
            </div>
            <span className={styles.itemText}>{item.text}</span>
          </label>
        ))}
      </div>
      {watched && (
        <div className={styles.watchedBadge}>
          <span className={styles.badgeIcon}>🎉</span>
          All Steps Completed!
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
        return <p>Unknown content type</p>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={content?.title || 'Content'} size="xlarge">
      {renderContent()}
    </Modal>
  );
};

export default ContentViewer;
