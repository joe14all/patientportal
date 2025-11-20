// src/contexts/AppProvider.jsx
import React from 'react';
import { AccountProvider } from './AccountContext';
import { PatientProvider } from './PatientContext'; 
import { ClinicalProvider } from './ClinicalContext'; 
import { BillingProvider } from './BillingContext'; 
import { EngagementProvider } from './EngagementContext'; 
import { CoreProvider } from './CoreContext';
import { ThemeProvider } from './ThemeContext';

export const AppProvider = ({ children }) => {
  return (
    <AccountProvider>
      <ThemeProvider> 
        <PatientProvider>
          <EngagementProvider>
            <CoreProvider> 
              <ClinicalProvider>
                <BillingProvider> 
                  {children}
                </BillingProvider>
              </ClinicalProvider>
            </CoreProvider>
          </EngagementProvider>
        </PatientProvider> 
      </ThemeProvider>
    </AccountProvider>
  );
};