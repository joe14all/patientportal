import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useEngagementData } from '../../contexts';
import styles from './ContentViewer.module.css';

/**
 * Content Viewer Component - Enhanced UX
 * Beautiful, spacious modal for viewing educational content
 */
const ContentViewer = ({ content, isOpen, onClose }) => {
  const { markEducationContentViewed, awardTrophy } = useEngagementData();
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setCompleted(false);
    }
  }, [isOpen]);

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

  const handleComplete = async () => {
    if (content) {
      await markEducationContentViewed(content.id);
      setCompleted(true);
      
      // Award trophy if content has a completion badge
      if (content.completionBadge) {
        await awardTrophy({
          id: `trophy_${content.id}_${Date.now()}`,
          name: content.completionBadge,
          icon: '🏆',
          earnedAt: new Date().toISOString()
        });
      }
      
      // Auto-close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
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
      
      if (newProgress === 100 && !completed) {
        handleComplete();
      }
      
      return updated;
    });
  };

  const renderVideoContent = () => (
    <div className={styles.contentSection}>
      <div className={styles.videoWrapper}>
        <div className={styles.videoPlaceholder}>
          <div className={styles.playButton}>
            <span className={styles.playIcon}>▶</span>
          </div>
          <div className={styles.videoOverlay}>
            <span className={styles.videoLabel}>Video Lesson</span>
          </div>
        </div>
      </div>
      
      <div className={styles.contentBody}>
        <div className={styles.contentHeader}>
          <span className={styles.typeBadge}>🎥 Video</span>
          <h2 className={styles.contentTitle}>{content.title}</h2>
          <div className={styles.metaTags}>
            <span className={styles.metaTag}>⏱ 5 min</span>
            <span className={styles.metaTag}>⭐ Beginner Friendly</span>
          </div>
        </div>

        <p className={styles.contentDescription}>{content.description}</p>

        <div className={styles.transcriptSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            Video Transcript
          </h3>
          <p className={styles.transcriptText}>
            This is where the video transcript would appear, allowing you to read along or review 
            the content at your own pace. You can reference key points and important information 
            covered in the video.
          </p>
        </div>

        {!completed ? (
          <button className={styles.primaryButton} onClick={handleComplete}>
            <span className={styles.buttonIcon}>✓</span>
            Mark as Watched
          </button>
        ) : (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>🎉</span>
            <span>Great job! You've completed this lesson</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderArticleContent = () => (
    <div className={styles.contentSection}>
      <div className={styles.contentBody}>
        <div className={styles.contentHeader}>
          <span className={styles.typeBadge}>📖 Article</span>
          <h2 className={styles.contentTitle}>{content.title}</h2>
          <div className={styles.metaTags}>
            <span className={styles.metaTag}>📚 3 min read</span>
            <span className={styles.metaTag}>💡 Essential Knowledge</span>
          </div>
        </div>

        <p className={styles.contentDescription}>{content.description}</p>

        <div className={styles.articleSections}>
          <div className={styles.articleSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💡</span>
              Overview
            </h3>
            <p>Learn essential information about dental health practices that will help you maintain 
            a healthy smile and prevent common oral health issues.</p>
          </div>

          <div className={styles.articleSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🔑</span>
              Key Takeaways
            </h3>
            <ul className={styles.bulletList}>
              <li>Evidence-based dental health information</li>
              <li>Expert-recommended best practices</li>
              <li>Answers to your most common questions</li>
              <li>Practical tips for daily oral care</li>
            </ul>
          </div>

          <div className={styles.articleSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>✨</span>
              Remember
            </h3>
            <p>Understanding these concepts will help you maintain excellent oral health and make 
            informed decisions about your dental care.</p>
          </div>
        </div>

        {!completed ? (
          <button className={styles.primaryButton} onClick={handleComplete}>
            <span className={styles.buttonIcon}>✓</span>
            I've Read This
          </button>
        ) : (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>🎉</span>
            <span>Excellent! You've completed this article</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderInteractiveContent = () => (
    <div className={styles.contentSection}>
      <div className={styles.contentBody}>
        <div className={styles.contentHeader}>
          <span className={styles.typeBadge}>🎮 Interactive</span>
          <h2 className={styles.contentTitle}>{content.title}</h2>
        </div>

        <p className={styles.contentDescription}>{content.description}</p>

        <div className={styles.interactiveSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👆</span>
            Hands-On Learning
          </h3>
          <p className={styles.sectionSubtext}>
            Follow along with our step-by-step demonstration to master the proper technique
          </p>

          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
            <div className={styles.progressLabel}>
              <span className={styles.progressPercent}>{progress}%</span>
              <span className={styles.progressText}>Complete</span>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              className={progress === 100 ? styles.successButton : styles.primaryButton}
              onClick={() => setProgress(Math.min(100, progress + 25))}
              disabled={progress === 100}
            >
              {progress === 100 ? '✓ All Steps Done' : '→ Next Step'}
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={() => setProgress(0)}
            >
              ↻ Start Over
            </button>
          </div>
        </div>

        {progress === 100 && !completed && (
          <button className={styles.primaryButton} onClick={handleComplete}>
            <span className={styles.buttonIcon}>✓</span>
            Complete This Tutorial
          </button>
        )}
        
        {completed && (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>🎉</span>
            <span>Awesome! You've mastered this skill</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderChecklistContent = () => {
    const completedCount = checklistItems.filter(i => i.checked).length;
    const totalCount = checklistItems.length;

    return (
      <div className={styles.contentSection}>
        <div className={styles.contentBody}>
          <div className={styles.contentHeader}>
            <span className={styles.typeBadge}>✅ Care Checklist</span>
            <h2 className={styles.contentTitle}>{content.title}</h2>
          </div>

          <p className={styles.contentDescription}>{content.description}</p>

          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
            <div className={styles.progressLabel}>
              <span className={styles.progressPercent}>{Math.round(progress)}%</span>
              <span className={styles.progressText}>Completed • {completedCount} of {totalCount} items</span>
            </div>
          </div>

          <div className={styles.checklistWrapper}>
            {checklistItems.map(item => (
              <label key={item.id} className={styles.checklistItem}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleChecklistToggle(item.id)}
                    className={styles.checkbox}
                  />
                  <span className={styles.customCheckbox}>
                    {item.checked && <span className={styles.checkmark}>✓</span>}
                  </span>
                </div>
                <span className={item.checked ? styles.checkedText : styles.uncheckedText}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>

          {completed && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>🎉</span>
              <span>Perfect! You've completed all care steps</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGuideContent = () => (
    <div className={styles.contentSection}>
      <div className={styles.contentBody}>
        <div className={styles.contentHeader}>
          <span className={styles.typeBadge}>📖 Guide</span>
          <h2 className={styles.contentTitle}>{content.title}</h2>
          <div className={styles.metaTags}>
            <span className={styles.metaTag}>📚 Comprehensive Guide</span>
            <span className={styles.metaTag}>⏱ {content.duration}</span>
          </div>
        </div>

        <p className={styles.contentDescription}>{content.description}</p>

        <div className={styles.guideSteps}>
          <div className={styles.guideStep}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Understanding Your Options</h3>
              <p className={styles.stepText}>
                Learn about the different methods available and how they work. Professional treatments 
                offer faster, more dramatic results, while at-home options provide convenience and 
                gradual improvement over time.
              </p>
            </div>
          </div>

          <div className={styles.guideStep}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Professional vs At-Home</h3>
              <p className={styles.stepText}>
                <strong>Professional Whitening:</strong> In-office treatments use stronger bleaching agents 
                and can lighten teeth several shades in one visit. Results are immediate and supervised by 
                dental professionals.
              </p>
              <p className={styles.stepText}>
                <strong>At-Home Options:</strong> Custom trays, strips, and whitening toothpastes offer 
                gradual whitening over weeks. More affordable but require consistent use for best results.
              </p>
            </div>
          </div>

          <div className={styles.guideStep}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>What to Expect</h3>
              <p className={styles.stepText}>
                Most people experience some tooth sensitivity during treatment, which is temporary. 
                Results typically last 6 months to 2 years depending on your habits (coffee, tea, wine, smoking).
              </p>
            </div>
          </div>

          <div className={styles.guideStep}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Maintaining Your Results</h3>
              <ul className={styles.bulletList}>
                <li>Brush twice daily with whitening toothpaste</li>
                <li>Limit staining foods and beverages</li>
                <li>Use a straw for dark-colored drinks</li>
                <li>Schedule regular dental cleanings</li>
                <li>Touch-up treatments as needed</li>
              </ul>
            </div>
          </div>

          <div className={styles.importantNote}>
            <div className={styles.noteIcon}>💡</div>
            <div className={styles.noteContent}>
              <h4>Important Considerations</h4>
              <p>
                Whitening works best on natural teeth. It won't change the color of crowns, veneers, 
                or fillings. Consult with your dentist to determine the best option for your specific needs 
                and to ensure your teeth and gums are healthy before treatment.
              </p>
            </div>
          </div>
        </div>

        {!completed ? (
          <button className={styles.primaryButton} onClick={handleComplete}>
            <span className={styles.buttonIcon}>✓</span>
            I've Completed This Guide
          </button>
        ) : (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>🎉</span>
            <span>Awesome! You've finished this comprehensive guide</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!content) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="large">
      <div className={styles.viewerContainer}>
        {content.type === 'video' && renderVideoContent()}
        {content.type === 'article' && renderArticleContent()}
        {content.type === 'interactive' && renderInteractiveContent()}
        {content.type === 'checklist' && renderChecklistContent()}
        {content.type === 'guide' && renderGuideContent()}
      </div>
    </Modal>
  );
};

export default ContentViewer;
