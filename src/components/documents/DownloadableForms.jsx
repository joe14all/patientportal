import React, { useRef, useState } from 'react';
import { useCoreData, useEngagementData } from '../../contexts';
import { 
  IconDownload, 
  IconFileText, 
  IconUploadCloud, 
  IconCheck, 
  IconAlertCircle, 
  IconClock 
} from '../../layouts/components/Icons';
import styles from './DownloadableForms.module.css';

const DownloadableForms = ({ onFormUpload, loading }) => {
  const { downloadableForms } = useCoreData();
  const { documents } = useEngagementData();
  
  // --- NEW: Refs for handling file upload ---
  const fileInputRef = useRef(null);
  const [activeForm, setActiveForm] = useState(null);

  // --- 1. Trigger the hidden input ---
  const handleUploadClick = (form) => {
    setActiveForm(form);
    // Clear previous value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
      fileInputRef.current.click();
    }
  };

  // --- 2. Handle file selection ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0] && activeForm) {
      const file = e.target.files[0];
      // Pass the file AND the form definition up to the parent
      onFormUpload(file, activeForm);
      setActiveForm(null);
    }
  };

  const getFormStatus = (formDef) => {
    const linkedDocs = documents.filter(
      doc => doc.linkContext?.type === 'FormDefinition' && 
             doc.linkContext?.id === formDef.id && 
             doc.systemInfo.status === 'Active'
    );

    if (linkedDocs.length === 0) return { status: 'Missing', doc: null };

    linkedDocs.sort((a, b) => new Date(b.systemInfo.createdAt) - new Date(a.systemInfo.createdAt));
    const latestDoc = linkedDocs[0];
    const verification = latestDoc.verification || { status: 'Pending' };

    if (verification.status === 'Rejected') {
      return { status: 'Rejected', doc: latestDoc, reason: verification.reason };
    }
    if (verification.status === 'Pending') {
      return { status: 'Pending', doc: latestDoc };
    }
    if (verification.status === 'Verified') {
      if (formDef.frequency === 'Annually') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (new Date(verification.verifiedAt) < oneYearAgo) {
          return { status: 'Expired', doc: latestDoc };
        }
      }
      return { status: 'Complete', doc: latestDoc };
    }
    return { status: 'Missing', doc: null };
  };

  const renderStatusBadge = (statusInfo) => {
    const { status } = statusInfo;
    switch (status) {
      case 'Complete':
        return <span className={`${styles.badge} ${styles.success}`}><IconCheck /> Verified</span>;
      case 'Pending':
        return <span className={`${styles.badge} ${styles.warning}`}><IconClock /> In Review</span>;
      case 'Rejected':
        return <span className={`${styles.badge} ${styles.error}`}><IconAlertCircle /> Action Needed</span>;
      case 'Expired':
        return <span className={`${styles.badge} ${styles.warning}`}>Update Due</span>;
      default:
        return <span className={`${styles.badge} ${styles.neutral}`}>To Do</span>;
    }
  };

  return (
    <section className={`card ${styles.formsCard}`}>
      <div className={styles.header}>
        <h2>Required Forms</h2>
        <p>Please ensure these documents are up to date.</p>
      </div>

      <div className={styles.formGrid}>
        {downloadableForms.map((form) => {
          const statusInfo = getFormStatus(form);
          const isComplete = statusInfo.status === 'Complete';
          
          return (
            <div key={form.id} className={`${styles.formItem} ${styles[statusInfo.status.toLowerCase()]}`}>
              <div className={styles.itemHeader}>
                <div className={styles.iconWrapper}><IconFileText /></div>
                <div className={styles.formInfo}>
                  <strong>{form.title}</strong>
                  <span className={styles.freq}>{form.frequency === 'Once' ? 'One-time' : form.frequency}</span>
                </div>
                <div className={styles.statusWrapper}>{renderStatusBadge(statusInfo)}</div>
              </div>

              {statusInfo.status === 'Rejected' && (
                <div className={styles.feedbackMsg}><strong>Issue:</strong> {statusInfo.reason}</div>
              )}
              {statusInfo.status === 'Expired' && (
                <div className={styles.feedbackMsg}>Update Required</div>
              )}

              <div className={styles.actions}>
                {isComplete ? (
                  <a 
                    href={statusInfo.doc.storage.url} 
                    download={statusInfo.doc.fileName}
                    className={styles.actionLink}
                  >
                    <IconDownload /> Download Signed Copy
                  </a>
                ) : (
                  <>
                    <a 
                      href={form.fileUrl} 
                      download={form.fileName}
                      className={styles.actionLink}
                    >
                      <IconDownload /> Get Blank Form
                    </a>
                    
                    {/* --- 3. Wired Up Button --- */}
                    <button 
                      className={styles.uploadBtn}
                      onClick={() => handleUploadClick(form)}
                      disabled={loading}
                    >
                      <IconUploadCloud /> {loading ? '...' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 4. Hidden Input --- */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="application/pdf,image/*"
      />
    </section>
  );
};

export default DownloadableForms;