import React, { useState } from 'react';
import { usePatientData } from '../../contexts';
import { IconTrash, IconProfile } from '../../layouts/components/Icons';
import styles from './ProfileEmergencyContacts.module.css';

const ProfileEmergencyContacts = () => {
  const { patient, updatePatientDetails, loading } = usePatientData();
  
  // Local state to manage the "add/edit" form
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    relationship: '',
    phone: '',
  });

  // Start adding a new contact
  const handleAddNew = () => {
    setEditForm({ id: null, name: '', relationship: '', phone: '' });
    setIsEditing(true);
  };

  // Start editing an existing contact
  const handleEdit = (contact) => {
    setEditForm(contact);
    setIsEditing(true);
  };

  // Cancel the add/edit form
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Handle changes in the form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle saving the contact (either new or existing)
  const handleSave = async () => {
    let updatedContacts;

    if (editForm.id) {
      // Update existing contact
      updatedContacts = patient.emergencyContacts.map(c =>
        c.id === editForm.id ? editForm : c
      );
    } else {
      // Add new contact
      const newContact = { ...editForm, id: `ec-uuid-${Date.now()}` };
      updatedContacts = [...patient.emergencyContacts, newContact];
    }

    try {
      // We call the context function directly to update the patient object
      await updatePatientDetails({ emergencyContacts: updatedContacts });
      setIsEditing(false); // Close the form on success
    } catch (err) {
      console.error("Failed to save emergency contact", err);
    }
  };

  // Handle removing a contact
  const handleRemove = async (contactId) => {
    if (window.confirm("Are you sure you want to remove this contact?")) {
      const updatedContacts = patient.emergencyContacts.filter(
        c => c.id !== contactId
      );
      try {
        await updatePatientDetails({ emergencyContacts: updatedContacts });
      } catch (err)
 {
        console.error("Failed to remove emergency contact", err);
      }
    }
  };

  return (
    <section className={`card ${styles.contactsCard}`}>
      <h2>Emergency Contacts</h2>

      {/* --- This is the list of existing contacts --- */}
      {!isEditing && (
        <div className={styles.contactList}>
          {patient.emergencyContacts.length > 0 ? (
            patient.emergencyContacts.map(contact => (
              <div className={styles.contactItem} key={contact.id}>
                <div className={styles.contactAvatar}>
                  <IconProfile />
                </div>
                <div className={styles.contactInfo}>
                  <strong>{contact.name}</strong>
                  <span>{contact.relationship} • {contact.phone}</span>
                </div>
                <div className={styles.contactActions}>
                  <button 
                    onClick={() => handleEdit(contact)} 
                    className="secondary"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleRemove(contact.id)} 
                    className="icon-button danger"
                    disabled={loading}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No emergency contacts listed.</p>
          )}

          <button onClick={handleAddNew} className={styles.addButton} disabled={loading}>
            + Add New Contact
          </button>
        </div>
      )}

      {/* --- This is the Add/Edit Form (shown conditionally) --- */}
      {isEditing && (
        <form className={styles.editForm}>
          <h3>{editForm.id ? 'Edit Contact' : 'Add New Contact'}</h3>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editForm.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="relationship">Relationship</label>
            <input
              type="text"
              id="relationship"
              name="relationship"
              value={editForm.relationship}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={editForm.phone}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" className="secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default ProfileEmergencyContacts;