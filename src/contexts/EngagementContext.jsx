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


  // --- Value ---
  const value = useMemo(() => ({
    // State (READ)
    messageThreads: threads,
    messagePosts: posts,
    documents,
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
    
    // System Author
    systemAuthor
    
  }), [
    threads, 
    posts, 
    documents, 
    loading, 
    error,
    sendMessage,
    createNewThread,
    markThreadAsRead,
    uploadDocument,
    archiveDocument,
    restoreDocument, 
    updateDocument, 
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