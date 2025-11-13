/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import styles from './DemographicsRaceForm.module.css';
import { RACE_OPTIONS } from '../../../constants';

/**
 * This component renders a list of checkboxes for Race.
 * It's more complex because it manages an array.
 *
 * Note on Logic:
 * It receives the `race` array as a prop.
 * It uses its own state (`selection`) to manage the UI.
 * When the user checks/unchecks a box, it calls the `onRaceChange`
 * function with the new, updated array.
 */
const DemographicsRaceForm = ({ race = [], onRaceChange }) => {
  // We need to separate the "known" options from the "other" text.
  const [selectedRaces, setSelectedRaces] = useState(new Set(
    race.filter(r => RACE_OPTIONS.includes(r))
  ));
  
  const [otherRace, setOtherRace] = useState(
    race.find(r => !RACE_OPTIONS.includes(r) && r !== "Prefer not to say") || ''
  );

  // This ensures the local state updates if the parent's data changes
  // (e.g., after a save)
  useEffect(() => {
    setSelectedRaces(new Set(race.filter(r => RACE_OPTIONS.includes(r))));
    setOtherRace(race.find(r => !RACE_OPTIONS.includes(r) && r !== "Prefer not to say") || '');
  }, [race]);

  // Handle changes to the CHECKBOXES
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const newSelection = new Set(selectedRaces);

    if (checked) {
      newSelection.add(name);
    } else {
      newSelection.delete(name);
    }

    setSelectedRaces(newSelection);
    // Call the parent's update function
    onRaceChange([...newSelection], otherRace);
  };

  // Handle changes to the "Other" TEXT INPUT
  const handleOtherChange = (e) => {
    const { value } = e.target;
    setOtherRace(value);
    // Call the parent's update function
    onRaceChange([...selectedRaces], value);
  };

  return (
    <div className={styles.raceForm}>
      <label className={styles.groupLabel}>Race</label>
      <p className={styles.helpText}>Select all that apply.</p>
      
      {/* --- Render standard checkboxes --- */}
      {RACE_OPTIONS.map(option => (
        <div className={styles.checkboxGroup} key={option}>
          <input
            type="checkbox"
            id={`race_${option}`}
            name={option}
            checked={selectedRaces.has(option)}
            onChange={handleCheckboxChange}
          />
          <label htmlFor={`race_${option}`}>{option}</label>
        </div>
      ))}

      {/* --- Render "Other" text input --- */}
      <div className={styles.otherInputWrapper}>
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="race_Other"
            // This checkbox is checked if the `otherRace` text field has content
            checked={!!otherRace}
            // A bit complex: if the user unchecks this, it should clear the text field
            onChange={(e) => {
              if (!e.target.checked) {
                setOtherRace('');
                onRaceChange([...selectedRaces], '');
              }
            }}
          />
          <label htmlFor="race_Other" className={styles.otherLabel}>Other</label>
        </div>
        <input
          type="text"
          id="race_Other_text"
          name="race_Other_text"
          value={otherRace}
          onChange={handleOtherChange}
          // The input is only active if the "Other" box is conceptually checked
          onFocus={(e) => {
            // If the user focuses the text field, "check" the box for them
            if (!otherRace) {
              handleCheckboxChange({ target: { name: 'Other', checked: true }});
            }
          }}
          placeholder="Please specify"
          className={styles.otherInput}
        />
      </div>
    </div>
  );
};

export default DemographicsRaceForm;