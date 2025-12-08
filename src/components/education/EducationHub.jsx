import React, { useState, useMemo } from 'react';
import { useClinicalData } from '../../contexts';
import { useEngagementData } from '../../contexts';
import ContentViewer from './ContentViewer';
import styles from './EducationHub.module.css';

/**
 * Dental Health Education Hub
 * Personalized educational content library based on patient's treatments and conditions
 */
const EducationHub = () => {
  const { treatmentPlans, appointments } = useClinicalData();
  const { isContentViewed, getEducationStats } = useEngagementData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const educationStats = getEducationStats();

  // Filter stats to only show education-related achievements
  const educationOnlyStats = useMemo(() => {
    // Only show trophies from education categories (not engagement, documents, health)
    const educationCategories = ['basics', 'procedures', 'prevention', 'aftercare', 'cosmetic', 'family', 'emergency'];
    const educationTrophyNames = [
      'Brushing Master', 'Flossing Pro', 
      'Crown Expert', 'Root Canal Scholar',
      'Gum Health Guardian', 'Prevention Champion',
      'Extraction Expert', 'Implant Care Pro',
      'Whitening Specialist', 'Cosmetic Expert',
      'Family Care Champion', 'Emergency Ready'
    ];
    
    const educationTrophies = educationStats.recentTrophies?.filter(trophy => 
      educationTrophyNames.includes(trophy.name)
    ) || [];
    
    const totalEducationTrophies = (educationStats.categories?.basics?.length || 0) +
                                    (educationStats.categories?.procedures?.length || 0) +
                                    (educationStats.categories?.prevention?.length || 0) +
                                    (educationStats.categories?.aftercare?.length || 0);
    
    return {
      ...educationStats,
      recentTrophies: educationTrophies,
      trophiesEarned: totalEducationTrophies
    };
  }, [educationStats]);

  // Educational content library - wrapped in useMemo to prevent recreation on every render
  const educationContent = useMemo(() => [
    {
      id: 'proper-brushing',
      title: 'How to Brush Your Teeth Properly',
      category: 'basics',
      type: 'video',
      duration: '3:45',
      thumbnail: '🪥',
      description: 'Learn the correct technique for effective brushing',
      personalizedFor: ['all'],
      videoUrl: '#',
      completionBadge: 'Brushing Master'
    },
    {
      id: 'flossing-guide',
      title: 'Complete Flossing Guide',
      category: 'basics',
      type: 'interactive',
      duration: '5 min',
      thumbnail: '🦷',
      description: 'Step-by-step interactive guide to proper flossing',
      personalizedFor: ['all'],
      completionBadge: 'Flossing Pro'
    },
    {
      id: 'crown-procedure',
      title: 'Understanding Your Crown Procedure',
      category: 'procedures',
      type: 'video',
      duration: '4:20',
      thumbnail: '👑',
      description: 'What to expect before, during, and after a crown',
      personalizedFor: ['crown'],
      keywords: ['crown', 'procedure', 'preparation']
    },
    {
      id: 'root-canal-explained',
      title: 'Root Canal: What You Need to Know',
      category: 'procedures',
      type: 'article',
      duration: '8 min read',
      thumbnail: '🏥',
      description: 'Demystifying root canal therapy with clear explanations',
      personalizedFor: ['root canal'],
      keywords: ['root canal', 'pain', 'therapy']
    },
    {
      id: 'post-extraction-care',
      title: 'Caring for Your Mouth After Extraction',
      category: 'aftercare',
      type: 'checklist',
      duration: '10 min',
      thumbnail: '📋',
      description: 'Important dos and don\'ts for healing',
      personalizedFor: ['extraction'],
      keywords: ['extraction', 'aftercare', 'healing'],
      checklistData: [
        'Avoid drinking through a straw for 24 hours',
        'Apply ice pack for 15 minutes every hour',
        'Take prescribed pain medication as directed',
        'Eat soft foods for the first 24-48 hours',
        'Gently rinse with salt water after 24 hours',
        'Avoid smoking and alcohol for at least 48 hours',
        'Keep gauze pad in place for 30-45 minutes',
        'Sleep with your head elevated',
        'Avoid vigorous rinsing or spitting',
        'Call dentist if bleeding doesn\'t stop after 2 hours'
      ]
    },
    {
      id: 'gum-disease-prevention',
      title: 'Preventing Gum Disease',
      category: 'prevention',
      type: 'article',
      duration: '6 min read',
      thumbnail: '🛡️',
      description: 'Keep your gums healthy with these proven strategies',
      personalizedFor: ['all'],
      keywords: ['gum', 'disease', 'prevention', 'gingivitis']
    },
    {
      id: 'kids-dental-health',
      title: 'Dental Health for Kids',
      category: 'family',
      type: 'video',
      duration: '5:30',
      thumbnail: '👶',
      description: 'Fun and engaging dental care tips for children',
      personalizedFor: ['family'],
      isKidFriendly: true
    },
    {
      id: 'whitening-options',
      title: 'Teeth Whitening: Your Options',
      category: 'cosmetic',
      type: 'guide',
      duration: '7 min read',
      thumbnail: '✨',
      description: 'Compare professional and at-home whitening methods',
      personalizedFor: ['whitening'],
      keywords: ['whitening', 'cosmetic', 'bright']
    },
    {
      id: 'dental-emergency',
      title: 'Handling Dental Emergencies',
      category: 'emergency',
      type: 'checklist',
      duration: '5 min',
      thumbnail: '🚨',
      description: 'Quick action guide for common dental emergencies',
      personalizedFor: ['all'],
      keywords: ['emergency', 'pain', 'urgent']
    },
    {
      id: 'implant-care',
      title: 'Caring for Your Dental Implants',
      category: 'aftercare',
      type: 'article',
      duration: '6 min read',
      thumbnail: '🦷',
      description: 'Maintain your implants for lasting results',
      personalizedFor: ['implant'],
      keywords: ['implant', 'care', 'maintenance']
    }
  ], []); // Empty dependency array - content is static

  // Get personalized recommendations based on patient's treatment history
  const recommendedContent = useMemo(() => {
    const recommendations = new Set();
    
    // Based on treatment plans
    treatmentPlans.forEach(plan => {
      plan.plannedProcedures?.forEach(proc => {
        if (proc.procedureName) {
          const procName = proc.procedureName.toLowerCase();
          educationContent.forEach(content => {
            if (content.personalizedFor.some(tag => procName.includes(tag))) {
              recommendations.add(content.id);
            }
          });
        }
      });
    });

    // Based on recent appointments
    appointments.slice(0, 3).forEach(appt => {
      if (appt.appointmentType) {
        const apptType = appt.appointmentType.toLowerCase();
        educationContent.forEach(content => {
          if (content.keywords?.some(keyword => apptType.includes(keyword))) {
            recommendations.add(content.id);
          }
        });
      }
    });

    return Array.from(recommendations);
  }, [treatmentPlans, appointments, educationContent]);

  // Filter content
  const filteredContent = useMemo(() => {
    let filtered = educationContent;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.keywords?.some(k => k.includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery, educationContent]);

  const categories = [
    { id: 'all', label: 'All Topics', icon: '📚' },
    { id: 'basics', label: 'Daily Care', icon: '🪥' },
    { id: 'procedures', label: 'Procedures', icon: '🦷' },
    { id: 'prevention', label: 'Prevention', icon: '🛡️' },
    { id: 'aftercare', label: 'Aftercare', icon: '💊' },
    { id: 'cosmetic', label: 'Cosmetic', icon: '✨' },
    { id: 'family', label: 'Family & Kids', icon: '👨‍👩‍👧' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'interactive': return '🎮';
      case 'checklist': return '☑️';
      case 'guide': return '📖';
      default: return '📝';
    }
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedContent(null);
  };

  return (
    <div className={styles.educationHub}>
      {/* Trophy Achievement Banner */}
      <div className={styles.trophyBanner}>
        <div className={styles.trophyHeader}>
          <span className={styles.trophyIcon}>🏆</span>
          <div className={styles.trophyText}>
            <h3 className={styles.trophyTitle}>
              {educationOnlyStats.trophiesEarned > 0 ? 'Your Learning Achievements' : 'Build Your Badge Collection'}
            </h3>
            <p className={styles.trophyStats}>
              {educationOnlyStats.trophiesEarned > 0 ? (
                <>
                  <strong>{educationOnlyStats.trophiesEarned}</strong> {educationOnlyStats.trophiesEarned === 1 ? 'badge' : 'badges'} earned • <strong>{educationOnlyStats.totalViewed}</strong> {educationOnlyStats.totalViewed === 1 ? 'lesson' : 'lessons'} completed
                </>
              ) : (
                'Complete lessons to earn badges and track your dental health knowledge'
              )}
            </p>
          </div>
        </div>
        {educationOnlyStats.recentTrophies?.length > 0 && (
          <div className={styles.recentBadges}>
            <span className={styles.badgesLabel}>Recent:</span>
            {educationOnlyStats.recentTrophies.map((trophy, index) => (
              <div key={index} className={styles.badgeItem} title={trophy.name}>
                <span className={styles.badgeIcon}>{trophy.icon || '🏅'}</span>
                <span className={styles.badgeName}>{trophy.name}</span>
              </div>
            ))}
          </div>
        )}
        {educationOnlyStats.nextMilestone && (
          <div className={styles.milestonePreview}>
            <span className={styles.milestoneIcon}>{educationOnlyStats.nextMilestone.icon}</span>
            <span className={styles.milestoneText}>
              {educationOnlyStats.totalViewed === 0 ? 'Start your first lesson!' : `${educationOnlyStats.nextMilestone.target - educationOnlyStats.totalViewed} more to unlock "${educationOnlyStats.nextMilestone.name}"`}
            </span>
          </div>
        )}
      </div>

      <div className={styles.header}>
        <h2>Dental Health Education</h2>
        <p className={styles.subtitle}>
          Learn about your dental health with personalized, expert-approved content
        </p>
      </div>

      

      {/* Personalized Recommendations */}
      {recommendedContent.length > 0 && (
        <div className={styles.recommendedSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sparkle}>✨</span>
            Recommended for You
          </h3>
          <div className={styles.contentGrid}>
            {educationContent
              .filter(c => recommendedContent.includes(c.id))
              .slice(0, 3)
              .map(content => (
                <ContentCard 
                  key={content.id} 
                  content={content} 
                  getTypeIcon={getTypeIcon} 
                  isRecommended 
                  onView={() => handleViewContent(content)}
                  isViewed={isContentViewed(content.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search topics... (e.g., 'crown', 'flossing', 'emergency')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button 
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className={styles.categories}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className={styles.categoryIcon}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {filteredContent.map(content => (
          <ContentCard 
            key={content.id} 
            content={content} 
            getTypeIcon={getTypeIcon} 
            onView={() => handleViewContent(content)}
            isViewed={isContentViewed(content.id)}
          />
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <p>No content found. Try a different search or category.</p>
        </div>
      )}

      {/* Content Viewer Modal */}
      <ContentViewer
        content={selectedContent}
        isOpen={viewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
};

const ContentCard = ({ content, getTypeIcon, isRecommended = false, onView, isViewed }) => (
  <div className={`${styles.contentCard} ${isViewed ? styles.viewed : ''}`} onClick={onView}>
    {/* Status Badge - Top Right */}
    {isViewed ? (
      <div className={styles.completedBadge}>
        <span className={styles.checkmark}>✓</span>
      </div>
    ) : isRecommended && (
      <div className={styles.recommendedTag}>
        For You
      </div>
    )}
    
    <div className={styles.cardThumbnail}>
      <span className={styles.thumbnailIcon}>{content.thumbnail}</span>
      <span className={styles.typeIcon}>{getTypeIcon(content.type)}</span>
    </div>
    
    <div className={styles.cardContent}>
      <h4 className={styles.cardTitle}>{content.title}</h4>
      <p className={styles.cardDescription}>{content.description}</p>
      
      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>
          {content.duration}
        </span>
        {content.isKidFriendly && (
          <span className={styles.kidBadge}>
            Kid-Friendly
          </span>
        )}
      </div>
      
      {content.completionBadge && !isViewed && (
        <div className={styles.earnBadge}>
          <span className={styles.trophy}>🏆</span>
          <span>{content.completionBadge}</span>
        </div>
      )}
      
      <button className={styles.actionButton}>
        {isViewed ? 'Review' : 'Start'}
      </button>
    </div>
  </div>
);

export default EducationHub;
