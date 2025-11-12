/* A simple helper file for clean, inline SVG icons.
  This keeps our layout components cleaner.
*/
import React from 'react';

// Using a 24x24 viewbox is a common standard.
const iconProps = {
  viewBox: "0 0 24 24",
  width: "20",
  height: "20",
  strokeWidth: "2",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconHamburger = (props) => (
  <svg {...iconProps} {...props}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export const IconClose = (props) => (
  <svg {...iconProps} {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const IconDashboard = (props) => (
  <svg {...iconProps} {...props}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export const IconAppointments = (props) => (
  <svg {...iconProps} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);