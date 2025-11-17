import React from 'react';
import DocumentItem from './DocumentItem';
import styles from './DocumentList.module.css';

/**
 * Renders the categorized lists of documents.
 */
const DocumentList = ({ categorizedDocuments, onArchive, onPreview, loading }) => {
  const categories = Object.keys(categorizedDocuments);

  if (categories.length === 0 && !loading) {
    return <p>You have no documents.</p>;
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
                onPreview={onPreview}
                loading={loading}
              />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
};

export default DocumentList;