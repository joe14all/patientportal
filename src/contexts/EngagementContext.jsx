/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; // Import the initial mock data

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
    // Note: `attachments` should be an array of objects like:
    // { documentId: "doc-uuid-007", fileName: "photo.jpg" }
    await simulateApi(() => {
      const newPost = {
        id: `msg-post-uuid-${Date.now()}`,
        threadId: threadId,
        authorType: "Patient",
        authorId: "user-uuid-001", // Get from auth context
        authorName: "Jane Doe", // Get from auth context
        body: body,
        attachments: attachments,
        createdAt: new Date().toISOString()
      };

      // Add the new post
      setPosts(prev => [...prev, newPost]);

      // Update the parent thread
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
                authorType: "Patient",
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
  }, []);

  /**
   * (CREATE) Creates a new message thread.
   */
  const createNewThread = useCallback(async (subject, category, body, attachments = []) => {
    await simulateApi(() => {
      const newThreadId = `msg-thread-uuid-${Date.now()}`;
      const newPostId = `msg-post-uuid-${Date.now()}`;
      const timestamp = new Date().toISOString();

      const newThread = {
        id: newThreadId,
        patientId: "patient-uuid-001", // Get from auth
        initiatingUserId: "user-uuid-001", // Get from auth
        subject: subject,
        category: category,
        status: "PendingStaff",
        priority: "Normal",
        assignment: {
          assignedType: "Provider",
          assignedId: "provider-uuid-001", // Default provider
        },
        readStatus: {
          isReadByPatient: true,
          isReadByStaff: false,
        },
        lastMessage: {
          timestamp: timestamp,
          authorType: "Patient",
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
        authorType: "Patient",
        authorId: "user-uuid-001",
        authorName: "Jane Doe",
        body: body,
        attachments: attachments,
        createdAt: timestamp,
      };

      // Add both the new thread and the new post
      setThreads(prev => [newThread, ...prev]);
      setPosts(prev => [firstPost, ...prev]);
    });
  }, []);

  /**
   * (UPDATE) Marks a thread as read by the patient.
   */
  const markThreadAsRead = useCallback(async (threadId) => {
    // This is a "silent" API call, no loading spinner
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
   */
  const uploadDocument = useCallback(async (file, category, linkContext = null) => {
    // `file` would be a File object. We'll mock it.
    // `linkContext` could be { type: "MessagePost", id: "msg-post-uuid-xxx" }
    await simulateApi(() => {
      const newDoc = {
        id: `doc-uuid-${Date.now()}`,
        patientId: "patient-uuid-001", // Get from auth
        uploadedByUserId: "user-uuid-001", // Get from auth
        fileName: file.name || "new-file.pdf",
        storage: {
          provider: "Mock",
          url: `/mock/uploads/patient-001/${file.name || "new-file.pdf"}`,
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
      return newDoc; // Return the new doc so it can be attached to a message
    });
  }, []);

  /**
   * (DELETE) Archives a document (soft delete).
   */
  const archiveDocument = useCallback(async (documentId) => {
    await simulateApi(() => {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, systemInfo: { ...doc.systemInfo, status: "Archived" } }
            : doc
        )
      );
    });
  }, []);


  // --- Value ---
  // Memoize the context value to prevent unnecessary re-renders
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
    archiveDocument
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