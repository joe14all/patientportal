// src/contexts/AppProvider.jsx
import React from 'react';
import { AccountProvider } from './AccountContext';
import { PatientProvider } from './PatientContext'; 
import { ClinicalProvider } from './ClinicalContext'; 
import { BillingProvider } from './BillingContext'; 
import { EngagementProvider } from './EngagementContext'; 
import { CoreProvider } from './CoreContext';
import { ThemeProvider } from './ThemeContext'; // 1. Import

export const AppProvider = ({ children }) => {
  return (
    <AccountProvider>
      <ThemeProvider> 
        <PatientProvider>
          <ClinicalProvider>
            <BillingProvider>
              <EngagementProvider>
                <CoreProvider> 
                  {children}
                </CoreProvider>
              </EngagementProvider>
            </BillingProvider>
          </ClinicalProvider>
        </PatientProvider> 
      </ThemeProvider>
    </AccountProvider>
  );
};