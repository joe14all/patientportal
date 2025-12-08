/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; 
import { s3Service } from '../_mock/storage/s3'; // 1. Import the storage service

// 1. Create the context
export const EngagementContext = createContext(null);

// 3. Create the Provider component
export const EngagementProvider = ({ children }) => {
  // --- State ---
  const [threads, setThreads] = useState(mockApi.engagement.messageThreads);
  const [posts, setPosts] = useState(mockApi.engagement.messagePosts);
  const [documents, setDocuments] = useState(mockApi.engagement.documents);
  
  // Education tracking state
  const [viewedContent, setViewedContent] = useState([]);
  const [trophies, setTrophies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 1. Define default authors ---
  const patientAuthor = {
    type: "Patient",
    id: "user-uuid-001", // Get from auth context
    name: "Jane Doe" // Get from auth context
  };

  // This info is from mock data /core/offices.json and a mock ID
  const systemAuthor = {
    type: "Staff", // Use "Staff" so it appears as "theirs"
    id: "system-uuid-Practice", // A unique ID for the practice
    name: "Downtown Dental Center" // The practice name
  };

  // --- Helper for simulated API calls ---
  const simulateApi = (callback, delay = 500) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        try {
          const result = callback();
          resolve(result);
        } catch (err) {
          console.error("Mock API Error:", err.message);
          setError(err.message);
          reject(err);
        } finally {
          setLoading(false);
        }
      }, delay);
    });
  };

  // --- Message Functions ---
  
  /**
   * (CREATE) Sends a new message (reply) in an existing thread.
   */
  const sendMessage = useCallback(async (threadId, body, attachments = []) => {
    await simulateApi(() => {
      const newPost = {
        id: `msg-post-uuid-${Date.now()}`,
        threadId: threadId,
        authorType: patientAuthor.type,
        authorId: patientAuthor.id,
        authorName: patientAuthor.name,
        body: body,
        attachments: attachments,
        createdAt: new Date().toISOString()
      };

      setPosts(prev => [...prev, newPost]);

      setThreads(prev =>
        prev.map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              status: "PendingStaff", // Re-open the thread
              readStatus: {
                isReadByPatient: true,
                isReadByStaff: false, // Staff needs to see this
              },
              lastMessage: {
                timestamp: newPost.createdAt,
                authorType: patientAuthor.type,
                snippet: body.substring(0, 50) + "...",
              },
              systemInfo: {
                ...thread.systemInfo,
                updatedAt: newPost.createdAt,
              }
            };
          }
          return thread;
        })
      );
    });
  }, [patientAuthor]);

  /**
   * (CREATE) Creates a new message thread.
   */
  const createNewThread = useCallback(async (subject, category, body, attachments = [], authorInfo = null) => {
    
    const author = authorInfo || patientAuthor;
    const isPatientInitiated = author.type === 'Patient';
    
    await simulateApi(() => {
      const newThreadId = `msg-thread-uuid-${Date.now()}`;
      const newPostId = `msg-post-uuid-${Date.now()}`;
      const timestamp = new Date().toISOString();

      const newThread = {
        id: newThreadId,
        patientId: "patient-uuid-001", 
        initiatingUserId: author.id, 
        subject: subject,
        category: category,
        status: isPatientInitiated ? "PendingStaff" : "PendingPatient", 
        priority: "Normal",
        assignment: {
          assignedType: "Provider",
          assignedId: "provider-uuid-001",
        },
        readStatus: {
          isReadByPatient: isPatientInitiated,
          isReadByStaff: !isPatientInitiated,
        },
        lastMessage: {
          timestamp: timestamp,
          authorType: author.type, 
          snippet: body.substring(0, 50) + "...",
        },
        systemInfo: {
          createdAt: timestamp,
          updatedAt: timestamp,
          closedAt: null,
        }
      };

      const firstPost = {
        id: newPostId,
        threadId: newThreadId,
        authorType: author.type, 
        authorId: author.id, 
        authorName: author.name, 
        body: body,
        attachments: attachments,
        createdAt: timestamp,
      };

      setThreads(prev => [newThread, ...prev]);
      setPosts(prev => [firstPost, ...prev]);
    });
  }, [patientAuthor, systemAuthor]);

  /**
   * (UPDATE) Marks a thread as read by the patient.
   */
  const markThreadAsRead = useCallback(async (threadId) => {
    setThreads(prev =>
      prev.map(thread =>
        (thread.id === threadId && !thread.readStatus.isReadByPatient)
          ? { ...thread, readStatus: { ...thread.readStatus, isReadByPatient: true } }
          : thread
      )
    );
  }, []);


  // --- Document Functions ---

  /**
   * (CREATE) Uploads a new document.
   * Updated to use s3Service for file handling logic.
   */
  const uploadDocument = useCallback(async (file, category, linkContext = null) => {
    // 1. Upload to "S3" first. This handles the latency and URL generation.
    const s3Result = await s3Service.upload(file, 'documents');
    
    // 2. Save metadata to the "Database"
    const newDoc = await simulateApi(() => {
      const newDoc = {
        id: `doc-uuid-${Date.now()}`,
        patientId: "patient-uuid-001", 
        uploadedByUserId: "user-uuid-001", 
        fileName: file.name || "new-file.pdf",
        storage: {
          provider: "S3_Mock", // Updated provider
          key: s3Result.key,   // Store the unique key
          url: s3Result.url,   // Store the blob URL
          fileType: file.type || "application/pdf",
          fileSize: file.size || 123456,
        },
        category: category || "Patient Upload",
        linkContext: linkContext,
        tags: ["Patient Upload"],
        systemInfo: {
          createdAt: new Date().toISOString(),
          status: "Active"
        }
      };

      setDocuments(prev => [newDoc, ...prev]);
      return newDoc; 
    });
    
    return newDoc;
  }, []);

  /**
   * (DELETE) Archives a document (soft delete).
   */
  const archiveDocument = useCallback(async (documentId) => {
    await simulateApi(async () => {
      // Optional: If you wanted to delete the actual file blob, you could do:
      // const docToArchive = documents.find(doc => doc.id === documentId);
      // if (docToArchive?.storage?.key) { await s3Service.delete(docToArchive.storage.key); }

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, systemInfo: { ...doc.systemInfo, status: "Archived" } }
            : doc
        )
      );
    });
  }, []); // Added dependency array although documents is used inside callback logic via prev state

  /**
   * (UPDATE) Restores an archived document (Undo).
   */
  const restoreDocument = useCallback(async (documentId) => {
    await simulateApi(() => {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, systemInfo: { ...doc.systemInfo, status: "Active" } }
            : doc
        )
      );
    });
  }, []);

  /**
   * (UPDATE) Updates document metadata (e.g. Rename).
   */
  const updateDocument = useCallback(async (documentId, updates) => {
    await simulateApi(() => {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, ...updates }
            : doc
        )
      );
    });
  }, []);

  // --- Education Functions ---
  
  /**
   * Mark educational content as viewed
   */
  const markEducationContentViewed = useCallback(async (contentId) => {
    await simulateApi(() => {
      const viewedEntry = {
        contentId,
        viewedAt: new Date().toISOString(),
        completed: true
      };

      setViewedContent(prev => {
        const existing = prev.find(v => v.contentId === contentId);
        if (existing) return prev;
        return [...prev, viewedEntry];
      });
    });
  }, []);

  /**
   * Award a trophy to the patient
   */
  const awardTrophy = useCallback(async (trophyData) => {
    await simulateApi(() => {
      const newTrophy = {
        id: `trophy-${Date.now()}`,
        ...trophyData,
        earnedAt: new Date().toISOString()
      };

      setTrophies(prev => {
        const existing = prev.find(t => t.name === trophyData.name);
        if (existing) return prev;
        return [...prev, newTrophy];
      });
    });
  }, []);

  /**
   * Check if content has been viewed
   */
  const isContentViewed = useCallback((contentId) => {
    return viewedContent.some(v => v.contentId === contentId);
  }, [viewedContent]);

  /**
   * Get education progress stats
   */
  const getEducationStats = useCallback(() => {
    // Group trophies by category
    const categories = {
      basics: trophies.filter(t => ['Brushing Master', 'Flossing Pro'].includes(t.name)),
      procedures: trophies.filter(t => ['Crown Expert', 'Root Canal Scholar'].includes(t.name)),
      prevention: trophies.filter(t => ['Gum Health Guardian', 'Prevention Champion'].includes(t.name)),
      aftercare: trophies.filter(t => ['Extraction Expert', 'Implant Care Pro'].includes(t.name)),
      engagement: trophies.filter(t => ['Appointment Star', 'Perfect Attendance', 'Financial Fitness', 'Billing Champion', 'Wellness Warrior'].includes(t.name)),
      documents: trophies.filter(t => ['Document Pro', 'Paperwork Champion', 'Form Master'].includes(t.name)),
      health: trophies.filter(t => ['Health Historian', 'Medical Record Keeper', 'Proactive Patient'].includes(t.name)),
    };

    // Define milestones
    const milestones = [
      { name: 'First Steps', target: 1, icon: '🌟', achieved: viewedContent.length >= 1 },
      { name: 'Learning Path', target: 3, icon: '📚', achieved: viewedContent.length >= 3 },
      { name: 'Knowledge Seeker', target: 5, icon: '🎓', achieved: viewedContent.length >= 5 },
      { name: 'Dental Expert', target: 10, icon: '🏆', achieved: viewedContent.length >= 10 },
    ];

    const nextMilestone = milestones.find(m => !m.achieved);

    return {
      totalViewed: viewedContent.length,
      trophiesEarned: trophies.length,
      viewedContent: viewedContent,
      recentTrophies: trophies.slice(-3).reverse(),
      categories,
      milestones,
      nextMilestone,
      progress: nextMilestone ? Math.round((viewedContent.length / nextMilestone.target) * 100) : 100
    };
  }, [viewedContent, trophies]);

  /**
   * Calculate and award engagement trophies based on patient behavior
   */
  const calculateEngagementTrophies = useCallback((appointmentData, billingData, documentData, healthData) => {
    const earnedTrophies = [];

    // Appointment-based trophies
    if (appointmentData) {
      const { completedCount, cancelledCount, totalScheduled } = appointmentData;
      
      // Appointment Star: 3+ completed appointments
      if (completedCount >= 3 && !trophies.some(t => t.name === 'Appointment Star')) {
        earnedTrophies.push({
          name: 'Appointment Star',
          icon: '⭐',
          category: 'engagement',
          description: 'Completed 3 appointments'
        });
      }

      // Perfect Attendance: 5+ completed with no cancellations
      if (completedCount >= 5 && cancelledCount === 0 && !trophies.some(t => t.name === 'Perfect Attendance')) {
        earnedTrophies.push({
          name: 'Perfect Attendance',
          icon: '🎖️',
          category: 'engagement',
          description: '5 appointments with no cancellations'
        });
      }
    }

    // Billing-based trophies
    if (billingData) {
      const { paidOnTime, totalDue, paymentsCount } = billingData;
      
      // Financial Fitness: Current on all bills (totalDue = 0)
      if (totalDue === 0 && paymentsCount > 0 && !trophies.some(t => t.name === 'Financial Fitness')) {
        earnedTrophies.push({
          name: 'Financial Fitness',
          icon: '💵',
          category: 'engagement',
          description: 'All bills paid in full'
        });
      }

      // Billing Champion: 5+ on-time payments
      if (paidOnTime >= 5 && !trophies.some(t => t.name === 'Billing Champion')) {
        earnedTrophies.push({
          name: 'Billing Champion',
          icon: '💯',
          category: 'engagement',
          description: '5+ payments made on time'
        });
      }
    }

    // Document-based trophies
    if (documentData) {
      const { verifiedCount, totalRequired, allCompleted } = documentData;
      
      // Document Pro: Upload first required document
      if (verifiedCount >= 1 && !trophies.some(t => t.name === 'Document Pro')) {
        earnedTrophies.push({
          name: 'Document Pro',
          icon: '📄',
          category: 'documents',
          description: 'First document verified'
        });
      }

      // Paperwork Champion: All required documents completed
      if (allCompleted && totalRequired > 0 && !trophies.some(t => t.name === 'Paperwork Champion')) {
        earnedTrophies.push({
          name: 'Paperwork Champion',
          icon: '📋',
          category: 'documents',
          description: 'All required documents completed'
        });
      }

      // Form Master: 5+ documents verified
      if (verifiedCount >= 5 && !trophies.some(t => t.name === 'Form Master')) {
        earnedTrophies.push({
          name: 'Form Master',
          icon: '📑',
          category: 'documents',
          description: '5+ documents verified'
        });
      }
    }

    // Medical History-based trophies
    if (healthData) {
      const { hasHistory, isRecent, updateCount } = healthData;
      
      // Health Historian: Submit first medical history
      if (hasHistory && !trophies.some(t => t.name === 'Health Historian')) {
        earnedTrophies.push({
          name: 'Health Historian',
          icon: '📝',
          category: 'health',
          description: 'Medical history submitted'
        });
      }

      // Medical Record Keeper: Keep history updated (within 6 months)
      if (isRecent && !trophies.some(t => t.name === 'Medical Record Keeper')) {
        earnedTrophies.push({
          name: 'Medical Record Keeper',
          icon: '🏥',
          category: 'health',
          description: 'Medical history up to date'
        });
      }

      // Proactive Patient: 3+ medical history updates
      if (updateCount >= 3 && !trophies.some(t => t.name === 'Proactive Patient')) {
        earnedTrophies.push({
          name: 'Proactive Patient',
          icon: '🌟',
          category: 'health',
          description: 'Regular health updates'
        });
      }
    }

    // Combined trophy: Wellness Warrior (3+ appointments AND current on bills)
    if (appointmentData?.completedCount >= 3 && billingData?.totalDue === 0 && 
        !trophies.some(t => t.name === 'Wellness Warrior')) {
      earnedTrophies.push({
        name: 'Wellness Warrior',
        icon: '🦸',
        category: 'engagement',
        description: 'Great appointments & billing record'
      });
    }

    // Award all earned trophies
    earnedTrophies.forEach(trophy => {
      awardTrophy(trophy);
    });

    return earnedTrophies;
  }, [trophies, awardTrophy]);


  // --- Value ---
  const value = useMemo(() => ({
    // State (READ)
    messageThreads: threads,
    messagePosts: posts,
    documents,
    viewedContent,
    trophies,
    loading,
    error,
    
    // Functions (CREATE, UPDATE, DELETE)
    sendMessage,
    createNewThread,
    markThreadAsRead,
    uploadDocument,
    archiveDocument,
    restoreDocument,
    updateDocument,
    
    // Education Functions
    markEducationContentViewed,
    awardTrophy,
    isContentViewed,
    getEducationStats,
    calculateEngagementTrophies,
    
    // System Author
    systemAuthor
    
  }), [
    threads, 
    posts, 
    documents,
    viewedContent,
    trophies,
    loading, 
    error,
    sendMessage,
    createNewThread,
    markThreadAsRead,
    uploadDocument,
    archiveDocument,
    restoreDocument, 
    updateDocument,
    markEducationContentViewed,
    awardTrophy,
    isContentViewed,
    getEducationStats,
    calculateEngagementTrophies,
    systemAuthor
  ]);

  // --- Render ---
  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
};

// 2. Create the custom hook
export const useEngagementData = () => {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error('useEngagementData must be used within an EngagementProvider');
  }
  return context;
};