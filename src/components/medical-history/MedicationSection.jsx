import React, { useState } from 'react';
import HistoryItem from './HistoryItem';
import HistoryItemModal from './HistoryItemModal';
import styles from './MedicationSection.module.css';

/**
 * Manages the "Medications" section of the Medical History page.
 */
const MedicationSection = ({
  data,
  historyId,
  loading,
  onChange,
  addMedicalHistoryItem,
  updateMedicalHistoryItem,
  removeMedicalHistoryItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const itemType = 'medications';

  // --- Event Handlers ---

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
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
        await updateMedicalHistoryItem(historyId, itemType, itemData);
      } else {
        await addMedicalHistoryItem(historyId, itemType, itemData);
      }
      handleCloseModal();
    } catch (err) {
      console.error(`Failed to save ${itemType}`, err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this medication?')) {
      try {
        await removeMedicalHistoryItem(historyId, itemType, itemId);
      } catch (err) {
        console.error(`Failed to remove ${itemType}`, err);
      }
    }
  };

  // --- Render Logic ---
  const allItems = data.items || [];

  return (
    <section className="card">
      <h2>Medications</h2>
      
      {/* --- Checkbox --- */}
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="noCurrentMedications"
          name="noCurrentMedications"
          checked={data.noCurrentMedications}
          onChange={handleCheckboxChange}
          disabled={loading}
        />
        <label htmlFor="noCurrentMedications">No Current Medications</label>
      </div>

      {/* --- Item List --- */}
      {!data.noCurrentMedications && (
        <>
          <ul className={styles.historyList}>
            {allItems.length > 0 ? (
              allItems.map(item => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onEdit={handleOpenEdit}
                  onRemove={handleRemoveItem}
                  loading={loading}
                />
              ))
            ) : (
              <p className={styles.noItemsText}>No medications listed. Click "Add Medication" to add one.</p>
            )}
          </ul>
          
          <button
            type="button"
            className={`secondary ${styles.addButton}`}
            onClick={handleOpenAdd}
            disabled={loading}
          >
            + Add Medication
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

export default MedicationSection;