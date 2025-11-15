import React, { useMemo, useState } from 'react';
import styles from './TimeSlotPicker.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- DEFINE OUR MOCK "TODAY" ---
// This is the "current date" for the user, matching our mock data.
const MOCK_TODAY_STRING = '2025-11-15T12:00:00Z';

/**
 * Gets the start of our mock "today" in UTC.
 */
const getMockToday = () => {
  const today = new Date(MOCK_TODAY_STRING);
  today.setUTCHours(0, 0, 0, 0); // Set to start of day in UTC
  return today;
};

/**
 * --- NEW HELPER FUNCTION ---
 * Calculates slot duration in minutes
 */
const getSlotDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60);
};

/**
 * A component that displays a calendar and available time slots.
 */
const TimeSlotPicker = ({ 
  allSlots, 
  selectedApptType, // <-- CHANGED from selectedApptTypeId
  selectedSlot, 
  onSelectSlot 
}) => {
  // --- State for Calendar ---
  const [currentDate, setCurrentDate] = useState(new Date(MOCK_TODAY_STRING));
  const [selectedDate, setSelectedDate] = useState(null); // YYYY-MM-DD string

  // --- 1. Get a set of all available dates for the selected appt type ---
  const availableDates = useMemo(() => {
    const today = getMockToday();
    const dateSet = new Set();
    
    // --- Guard clause ---
    if (!selectedApptType) return dateSet;
    
    // --- THIS IS THE NEW LOGIC ---
    const requiredDuration = selectedApptType.duration;
    const typeId = selectedApptType.id;

    Object.keys(allSlots).forEach(dateKey => {
      const date = new Date(`${dateKey}T00:00:00Z`);
      if (date < today) return;

      // Check if any slot on this day matches BOTH duration and type
      const hasSlot = allSlots[dateKey].some(slot => {
        const slotDuration = getSlotDuration(slot.startTime, slot.endTime);
        return slotDuration >= requiredDuration &&
               slot.availableForAppointmentTypeIds.includes(typeId);
      });

      if (hasSlot) {
        dateSet.add(dateKey);
      }
    });
    return dateSet;
  }, [allSlots, selectedApptType]); // <-- CHANGED dependency

  // --- 2. Generate Calendar Grid ---
  const calendarGrid = useMemo(() => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const startDayOfWeek = firstDayOfMonth.getUTCDay(); // 0 = Sunday, 1 = Monday

    const grid = [];
    let day = 1;

    for (let i = 0; i < 6; i++) { // 6 weeks
      const week = [];
      for (let j = 0; j < 7; j++) { // 7 days
        if (i === 0 && j < startDayOfWeek) {
          week.push(null); // Empty cell
        } else if (day > daysInMonth) {
          week.push(null); // Empty cell
        } else {
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          week.push({
            day: day,
            dateString: dateString,
          });
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break; // Stop if we've run out of days
    }
    return grid;
  }, [currentDate]);
  
  // --- 3. Get slots for the selected date ---
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate || !selectedApptType) return [];
    
    // --- THIS IS THE NEW LOGIC ---
    const requiredDuration = selectedApptType.duration;
    const typeId = selectedApptType.id;
    
    return (allSlots[selectedDate] || []).filter(slot => {
        const slotDuration = getSlotDuration(slot.startTime, slot.endTime);
        return slotDuration >= requiredDuration &&
               slot.availableForAppointmentTypeIds.includes(typeId);
    });
  }, [selectedDate, allSlots, selectedApptType]); // <-- CHANGED dependency

  // --- Event Handlers ---
  
  const handleDateClick = (dateString) => {
    // If clicking the same date, deselect it
    if (selectedDate === dateString) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateString);
    }
    onSelectSlot(null); // Clear any previously selected time
  };

  const changeMonth = (amount) => {
    setSelectedDate(null); // Clear selection
    onSelectSlot(null);
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setUTCMonth(newDate.getUTCMonth() + amount);
      return newDate;
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
      // Note: We don't specify timeZone here, so it uses the user's local time,
      // which is correct for displaying slot times.
  };
  
  const isPast = (dateString) => {
    const today = getMockToday(); // <-- Use mock today
    // Use UTC to compare date strings directly
    return new Date(`${dateString}T00:00:00Z`) < today;
  }

  // --- Render Logic ---

  if (!selectedApptType) {
    // This should not happen if form logic is correct, but good to have.
    return (
      <div className={styles.noSlots}>
        <p>Please select an appointment type first.</p>
      </div>
    );
  }

  if (availableDates.size === 0) {
    return (
      <div className={styles.noSlots}>
        <p>No available appointments found for this type.</p>
        <p>Please try a different appointment type or call our office.</p>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      {/* --- Calendar Header --- */}
      <div className={styles.calendarHeader}>
        <button type="button" onClick={() => changeMonth(-1)}>&lt;</button>
        <h3>{MONTH_NAMES[currentDate.getUTCMonth()]} {currentDate.getUTCFullYear()}</h3>
        <button type="button" onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      {/* --- Calendar Grid --- */}
      <div className={styles.calendarGrid}>
        {DAY_NAMES.map(name => (
          <div key={name} className={styles.dayName}>{name}</div>
        ))}
        {calendarGrid.flat().map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className={styles.dayCell}></div>;
          }

          const isAvailable = availableDates.has(day.dateString);
          const isSelected = selectedDate === day.dateString;
          const isDayPast = isPast(day.dateString); // <-- Use our fixed function

          return (
            <button
              key={day.dateString}
              type="button"
              className={`
                ${styles.dayCell}
                ${isDayPast ? styles.disabled : ''}
                ${isAvailable ? styles.available : ''}
                ${isSelected ? styles.selected : ''}
              `}
              onClick={() => handleDateClick(day.dateString)}
              disabled={!isAvailable || isDayPast}
            >
              {day.day}
            </button>
          );
        })}
      </div>

      {/* --- Time Slot Picker (for selected date) --- */}
      {selectedDate && (
        <div className={styles.slotContainer}>
          <h3 className={styles.slotHeader}>
            Available Times for {new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC'
            })}
          </h3>
          <div className={styles.slotGrid}>
            {slotsForSelectedDate.length > 0 ? (
              slotsForSelectedDate.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <button
                    key={slot.startTime}
                    className={`${styles.slotButton} ${isSelected ? styles.selected : ''}`}
                    onClick={() => onSelectSlot(slot)}
                    type="button"
                  >
                    {formatTime(slot.startTime)}
                  </button>
                );
              })
            ) : (
              // This should no longer happen, but it's a good fallback
              <p className={styles.noSlots}>No times found for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;