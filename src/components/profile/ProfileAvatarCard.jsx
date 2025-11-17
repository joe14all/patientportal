import React, { useState, useRef } from 'react';
import { usePatientData } from '../../contexts';
import { IconProfile, IconCamera, IconTrash, IconUploadCloud } from '../../layouts/components/Icons';
import ProfilePictureModal from './ProfilePictureModal';
import Modal from '../common/Modal'; // <-- Import the generic Modal
import styles from './ProfileAvatarCard.module.css';

// Helper function to get initials
const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || '').toUpperCase();
};

const ProfileAvatarCard = () => {
  const { patient, updateProfilePicture, loading } = usePatientData();

  // --- State for modals and file ---
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false); // <-- NEW
  const fileInputRef = useRef(null);
  // ------------------------------------

  if (!patient) {
    return null;
  }

  const profileImage = patient.systemInfo?.profileImageUrl;
  const initials = getInitials(patient.preferredName);

  // --- Handlers ---

  // Triggered by the hidden file input
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setIsCropModalOpen(true); // Open the cropper with the new image
      };
      reader.readAsDataURL(file);
      e.target.value = null; // Reset input
    }
  };

  // --- THIS LOGIC IS NEW ---
  // Called by the Camera Icon
  const handleEditClick = () => {
    if (profileImage) {
      // If image exists, open cropper with that image
      setImageToCrop(profileImage);
      setIsCropModalOpen(true);
    } else {
      // If no image, trigger file upload
      fileInputRef.current.click();
    }
  };
  
  // Called by the new "Upload New" button
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  // --------------------------

  // Called from the CROP modal on save
  const handleSaveCrop = async (croppedImageDataUrl) => {
    await updateProfilePicture(croppedImageDataUrl);
    setIsCropModalOpen(false);
    setImageToCrop(null);
  };

  // Closes the CROP modal
  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);
    setImageToCrop(null);
  };

  // --- NEW: Handlers for Remove Modal ---
  // Called by "Remove Picture" button
  const handleRemoveClick = () => {
    setIsRemoveModalOpen(true); // Just open the modal
  };

  // Called by the Remove Modal's primary action
  const handleConfirmRemove = async () => {
    try {
      await updateProfilePicture(null);
      setIsRemoveModalOpen(false); // Close on success
    } catch (err) {
      console.error("Failed to remove picture", err);
      // Let the modal's internal error handling work
      throw err; 
    }
  };
  // ------------------------------------

  return (
    <>
      <div className={`card ${styles.avatarCard}`}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className={styles.avatarImage} 
              />
            ) : (
              initials ? initials : <IconProfile />
            )}
          </div>
            
          {/* Edit Button (Camera) */}
          <button
            className={styles.editButton}
            onClick={handleEditClick} // <-- UPDATED
            title={profileImage ? "Edit/Recrop picture" : "Add profile picture"}
            disabled={loading}
          >
            <IconCamera />
          </button>
        </div>

        <h2>{patient.legalName.fullText}</h2>
        <p>DOB: {patient.dateOfBirth}</p>

        {/* --- NEW: Button Group --- */}
        <div className={styles.buttonGroup}>
          {profileImage && (
            <>
              {/* This button replaces the old "Remove" button */}
              <button
                className={`secondary danger ${styles.actionButton}`}
                onClick={handleRemoveClick} // <-- UPDATED
                disabled={loading}
              >
                <IconTrash /> Remove
              </button>
              {/* This new button lets user upload a replacement */}
              <button
                className={`secondary ${styles.actionButton}`}
                onClick={handleUploadClick}
                disabled={loading}
              >
                <IconUploadCloud /> Upload New
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- Hidden file input --- */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className={styles.hiddenInput}
        accept="image/png, image/jpeg, image/webp"
      />

      {/* --- Render the CROP modal --- */}
      {isCropModalOpen && imageToCrop && (
        <ProfilePictureModal
          imageSrc={imageToCrop}
          onClose={handleCloseCropModal}
          onSave={handleSaveCrop}
        />
      )}

      {/* --- NEW: Render the REMOVE modal --- */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Profile Picture"
        primaryActionText="Remove"
        primaryActionVariant="danger"
        onPrimaryAction={handleConfirmRemove}
        secondaryActionText="Cancel"
        isLoading={loading}
      >
        <p>Are you sure you want to remove your profile picture?</p>
      </Modal>
    </>
  );
};

export default ProfileAvatarCard;