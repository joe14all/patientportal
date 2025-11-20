import React from 'react';
import DocumentItem from './DocumentItem';
import styles from './DocumentList.module.css';

/**
 * Renders the categorized lists of documents.
 */
const DocumentList = ({ 
  categorizedDocuments, 
  onArchive, 
  onRestore, // <-- NEW
  onPreview, 
  onRename,  // <-- NEW
  loading,
  isShowingArchived // <-- NEW: To decide which actions to show
}) => {
  const categories = Object.keys(categorizedDocuments);

  if (categories.length === 0 && !loading) {
    return (
      <div className={styles.emptyState}>
        <p>You have no {isShowingArchived ? 'archived' : ''} documents.</p>
      </div>
    );
  }

  return (
    <>
      {categories.map(category => (
        <section className={styles.docSection} key={category}>
          <h2>{category}</h2>
          <ul className={styles.docList}>
            {categorizedDocuments[category].map(doc => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                onArchive={onArchive}
                onRestore={onRestore} // Pass down
                onPreview={onPreview}
                onRename={onRename}   // Pass down
                loading={loading}
                isArchived={isShowingArchived} // Pass down status
              />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
};

export default DocumentList;