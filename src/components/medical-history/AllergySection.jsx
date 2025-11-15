import React, { useState } from 'react';
import HistoryItem from './HistoryItem';
import HistoryItemModal from './HistoryItemModal';
import styles from './AllergySection.module.css';

/**
 * Manages the "Allergies" section of the Medical History page.
 * Handles adding, editing, and removing allergies.
 */
const AllergySection = ({
  data,
  historyId,
  loading,
  onChange, // The generic handleDataChange from the parent
  addMedicalHistoryItem,
  updateMedicalHistoryItem,
  removeMedicalHistoryItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const itemType = 'allergies';

  // --- Event Handlers ---

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    // Call the parent's generic change handler
    onChange(itemType, {
      ...data,
      [name]: checked,
    });
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (itemData.id) {
        // We are editing
        await updateMedicalHistoryItem(historyId, itemType, itemData);
      } else {
        // We are adding
        await addMedicalHistoryItem(historyId, itemType, itemData);
      }
      handleCloseModal();
    } catch (err) {
      console.error(`Failed to save ${itemType}`, err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this allergy?')) {
      try {
        await removeMedicalHistoryItem(historyId, itemType, itemId);
      } catch (err) {
        console.error(`Failed to remove ${itemType}`, err);
      }
    }
  };

  // --- Render Logic ---

  // This is the fix from our analysis:
  // We show ALL allergies, not just drug-related ones.
  const allAllergies = data.items || [];

  return (
    <section className="card">
      <h2>Allergies</h2>
      
      {/* --- Checkboxes --- */}
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="noKnownDrugAllergies"
          name="noKnownDrugAllergies"
          checked={data.noKnownDrugAllergies}
          onChange={handleCheckboxChange}
          disabled={loading}
        />
        <label htmlFor="noKnownDrugAllergies">No Known Drug Allergies</label>
      </div>
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="noKnownEnvironmentalAllergies"
          name="noKnownEnvironmentalAllergies"
          checked={data.noKnownEnvironmentalAllergies}
          onChange={handleCheckboxChange}
          disabled={loading}
        />
        <label htmlFor="noKnownEnvironmentalAllergies">No Known Environmental/Food Allergies</label>
      </div>

      {/* --- Item List --- */}
      {/* Show the list if EITHER checkbox is unchecked */}
      {(!data.noKnownDrugAllergies || !data.noKnownEnvironmentalAllergies) && (
        <>
          <ul className={styles.historyList}>
            {allAllergies.length > 0 ? (
              allAllergies.map(item => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onEdit={handleOpenEdit}
                  onRemove={handleRemoveItem}
                  loading={loading}
                />
              ))
            ) : (
              <p className={styles.noItemsText}>No allergies listed. Click "Add Allergy" to add one.</p>
            )}
          </ul>
          
          <button
            type="button"
            className={`secondary ${styles.addButton}`}
            onClick={handleOpenAdd}
            disabled={loading}
          >
            + Add Allergy
          </button>
        </>
      )}

      {/* --- Modal --- */}
      <HistoryItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        itemType={itemType}
        loading={loading}
      />
    </section>
  );
};

export default AllergySection;