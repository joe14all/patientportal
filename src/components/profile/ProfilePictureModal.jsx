import React, { useState, useCallback } from 'react';
import Modal from '../common/Modal';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import styles from './ProfilePictureModal.module.css';

/**
 * A modal for cropping and zooming a new profile picture.
 *
 * @param {object} props
 * @param {string} props.imageSrc - The data URL of the image to crop.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function(string)} props.onSave - Function to call with the new cropped data URL.
 */
const ProfilePictureModal = ({ imageSrc, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setIsLoading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(croppedImage); // Pass the new data URL to the parent
      onClose(); // Close the modal
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Profile Picture"
      primaryActionText="Save"
      onPrimaryAction={handleSaveCrop}
      secondaryActionText="Cancel"
      isLoading={isLoading}
    >
      <div className={styles.cropperContainer}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape="round" // This gives the WhatsApp-style circle
          showGrid={false}
        />
      </div>
      <div className={styles.sliderContainer}>
        <label htmlFor="zoom">Zoom</label>
        <input
          id="zoom"
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(e.target.value)}
          className={styles.zoomSlider}
        />
      </div>
    </Modal>
  );
};

export default ProfilePictureModal;