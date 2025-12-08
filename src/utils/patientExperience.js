import React from "react";

/**
 * Get personalized greeting based on time of day
 */
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Get encouraging message based on patient's engagement
 */
export const getEncouragingMessage = (progressPercentage, hasUpcomingAppt) => {
  if (progressPercentage === 100) {
    return "You're all caught up! Your proactive care makes all the difference. 🌟";
  }

  if (progressPercentage >= 80) {
    return "You're doing great! Just a few small things to wrap up. 💪";
  }

  if (progressPercentage >= 50) {
    return "You're making good progress! We're here to help if you need anything. 😊";
  }

  if (hasUpcomingAppt) {
    return "Let's get ready for your upcoming visit together! 📋";
  }

  return "Welcome! Let's work together to keep your smile healthy. 🦷";
};

/**
 * Get appropriate emoji for appointment type
 */
export const getAppointmentEmoji = (appointmentType) => {
  const type = appointmentType?.toLowerCase() || "";

  if (type.includes("cleaning") || type.includes("hygiene")) return "✨";
  if (type.includes("exam") || type.includes("checkup")) return "🔍";
  if (type.includes("consultation")) return "💬";
  if (type.includes("surgery") || type.includes("extraction")) return "🏥";
  if (type.includes("filling")) return "🦷";
  if (type.includes("crown") || type.includes("bridge")) return "👑";
  if (type.includes("whitening")) return "😁";

  return "📅";
};

/**
 * Format friendly date (e.g., "Today", "Tomorrow", "Monday")
 */
export const getFriendlyDate = (date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(date);

  // Reset times for comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) return "Today";
  if (targetDate.getTime() === tomorrow.getTime()) return "Tomorrow";

  // Within a week, show day name
  const daysUntil = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntil >= 0 && daysUntil <= 7) {
    return targetDate.toLocaleDateString(undefined, { weekday: "long" });
  }

  // Otherwise show full date
  return targetDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year:
      targetDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Get patient-friendly status text
 */
export const getFriendlyStatus = (status) => {
  const statusMap = {
    Confirmed: "All set",
    Pending: "Awaiting confirmation",
    Cancelled: "Cancelled",
    Completed: "Completed",
    "Checked-In": "Checked in",
    "No-Show": "Missed",
    Proposed: "For your review",
    Accepted: "Approved",
    Rejected: "Declined",
    Active: "Current",
    Inactive: "Inactive",
    Verified: "Verified ✓",
    Pending: "Under review",
  };

  return statusMap[status] || status;
};

/**
 * Get contextual help text for actions
 */
export const getHelpText = (action) => {
  const helpMap = {
    "book-appointment":
      "Choose a time that works best for you. We offer flexible scheduling!",
    "update-insurance":
      "Keep your insurance current so we can maximize your benefits.",
    "upload-documents":
      "Having your documents ready helps us serve you better.",
    "pay-bill":
      "Questions about your bill? We're happy to explain any charges.",
    "message-provider": "Your care team typically responds within 24 hours.",
    "update-history":
      "Your health history helps us provide the safest care possible.",
  };

  return helpMap[action] || "We're here to help if you have any questions!";
};

/**
 * Calculate estimated wait time message
 */
export const getWaitTimeMessage = (minutesBehind) => {
  if (minutesBehind <= 0) return "We're running on time! 😊";
  if (minutesBehind <= 10) return "Just a few minutes behind schedule";
  if (minutesBehind <= 20)
    return `Running about ${minutesBehind} minutes behind. Thank you for your patience!`;
  return `Running ${minutesBehind} minutes behind. We apologize for the wait and appreciate your understanding! `;
};

/**
 * Get motivational message for completing health tasks
 */
export const getCompletionMessage = (taskType) => {
  const messages = {
    "form-complete": "Great! One less thing to worry about. ✅",
    "payment-made": "Thank you! Your payment has been received. 💚",
    "appointment-booked": "Perfect! We're looking forward to seeing you. 📅",
    "history-updated":
      "Thanks for keeping us informed. This helps us care for you better! 🩺",
    "message-sent": "Message sent! We'll get back to you soon. ✉️",
    "insurance-added": "Insurance saved! We'll verify your benefits. 🏥",
  };

  return messages[taskType] || "All done! Thanks for taking care of this. ✨";
};
