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
  
  const fileInputRef = useRef(null);
  const [activeForm, setActiveForm] = useState(null);

  // --- Logic: Determine Form Status ---
  const getFormStatus = (formDef) => {
    const linkedDocs = documents.filter(
      doc => doc.linkContext?.type === 'FormDefinition' && 
             doc.linkContext?.id === formDef.id && 
             doc.systemInfo.status === 'Active'
    );

    // 1. If no document found...
    if (linkedDocs.length === 0) {
      // Check if it is required or optional
      return { status: formDef.required ? 'Missing' : 'Optional', doc: null };
    }

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
    
    // Fallback
    return { status: formDef.required ? 'Missing' : 'Optional', doc: null };
  };

  const handleUploadClick = (form) => {
    setActiveForm(form);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0] && activeForm) {
      const file = e.target.files[0];
      onFormUpload(file, activeForm); 
      setActiveForm(null);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3>Required Documents</h3>
      </div>

      <div className={styles.listHeader}>
        <span style={{textAlign: 'center'}}>Stat</span>
        <span>Document Details</span>
        <span style={{textAlign: 'right'}}>Action</span>
      </div>

      <div className={styles.listGroup}>
        {downloadableForms.map((form) => {
          const { status, reason } = getFormStatus(form);
          const isComplete = status === 'Complete';
          const isOptional = status === 'Optional';
          const isMissing = status === 'Missing';
          
          // Only highlight row as error if it's an actual issue
          const isRowError = status === 'Rejected' || status === 'Expired' || (isMissing && form.required);

          return (
            <div key={form.id} className={`${styles.row} ${isRowError ? styles.rowError : ''}`}>
              
              {/* COLUMN 1: STATUS */}
              <div className={styles.statusCol}>
                {isComplete && <IconCheck className={`${styles.statusIcon} ${styles.complete}`} />}
                {status === 'Pending' && <IconClock className={`${styles.statusIcon} ${styles.pending}`} />}
                {(status === 'Rejected' || status === 'Expired') && <IconAlertCircle className={`${styles.statusIcon} ${styles.error}`} />}
                
                {/* Red Dot for Missing */}
                {isMissing && <div className={`${styles.statusIcon} ${styles.missing}`} />}
                {/* Gray Circle for Optional */}
                {isOptional && <div className={`${styles.statusIcon} ${styles.optional}`} />}

                <span className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
                  {status}
                </span>
              </div>

              {/* COLUMN 2: INFO */}
              <div className={styles.infoCol}>
                <div className={styles.fileIconBig}>
                  <IconFileText />
                </div>
                
                <div className={styles.textWrapper}>
                  <div className={styles.title}>{form.title}</div>
                  <div className={styles.meta}>
                    {status === 'Rejected' ? (
                       <span className={styles.errorText}>{reason || 'Resubmission needed'}</span>
                    ) : status === 'Expired' ? (
                       <span className={styles.errorText}>Update Required</span>
                    ) : isMissing ? (
                       <span className={styles.errorText}>Required</span>
                    ) : (
                       <>
                         <span>{form.frequency === 'Once' ? 'One-time' : 'Annual'}</span>
                         {isOptional && <span className={styles.optionalText}> (Optional)</span>}
                       </>
                    )}
                  </div>
                </div>
              </div>

              {/* COLUMN 3: ACTIONS */}
              <div className={styles.actionCol} style={{justifyContent: 'flex-end'}}>
                {isComplete ? (
                  /* SCENARIO 1: COMPLETE - Show NOTHING (Hide download icon) */
                  null
                ) : (
                  /* SCENARIO 2: NOT COMPLETE - Show Template Download + Upload */
                  <>
                    <a 
                      href={form.fileUrl} 
                      download={form.fileName}
                      className={`${styles.actionBtn} ${styles.download}`}
                      style={{marginRight: '0.5rem'}}
                      title="Download Template"
                    >
                      <IconDownload size={18} />
                    </a>

                    <button 
                      className={`${styles.actionBtn} ${styles.upload}`}
                      onClick={() => handleUploadClick(form)}
                      disabled={loading}
                      title="Upload Document"
                    >
                      <IconUploadCloud 
                        width="20" 
                        height="20" 
                        style={{ minWidth: '20px', color: 'currentColor' }} 
                      />
                    </button>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="application/pdf,image/jpeg,image/png"
      />
    </section>
  );
};

export default DownloadableForms;