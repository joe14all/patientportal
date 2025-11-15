import React, { useState } from 'react';
import HistoryItem from './HistoryItem';
import HistoryItemModal from './HistoryItemModal';
import styles from './ConditionSection.module.css';

/**
 * Manages the "Medical Conditions" section of the Medical History page.
 */
const ConditionSection = ({
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

  const itemType = 'conditions';

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
    if (window.confirm('Are you sure you want to remove this condition?')) {
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
      <h2>Medical Conditions</h2>
      
      {/* --- Checkbox --- */}
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="noKnownConditions"
          name="noKnownConditions"
          checked={data.noKnownConditions}
          onChange={handleCheckboxChange}
          disabled={loading}
        />
        <label htmlFor="noKnownConditions">No Known Medical Conditions</label>
      </div>

      {/* --- Item List --- */}
      {!data.noKnownConditions && (
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
              <p className={styles.noItemsText}>No conditions listed. Click "Add Condition" to add one.</p>
            )}
          </ul>
          
          <button
            type="button"
            className={`secondary ${styles.addButton}`}
            onClick={handleOpenAdd}
            disabled={loading}
          >
            + Add Condition
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

export default ConditionSection;