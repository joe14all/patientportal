/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; 
import { useEngagementData } from './EngagementContext'; 

// 1. Create the context
export const BillingContext = createContext(null);


// 3. Create the Provider component
export const BillingProvider = ({ children }) => {
  // --- 1. GET createNewThread AND systemAuthor ---
  const { createNewThread, systemAuthor } = useEngagementData();

  // --- State ---
  const [policies, setPolicies] = useState(mockApi.billing.insurancePolicies);
  const [claims, setClaims] = useState(mockApi.billing.insuranceClaims);
  const [invoices, setInvoices] = useState(mockApi.billing.billingInvoices);
  const [payments, setPayments] = useState(mockApi.billing.billingPayments);
  const [refunds, setRefunds] = useState(mockApi.billing.billingRefunds);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Helper for simulated API calls ---
  const simulateApi = (callback, delay = 700) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        try {
          const result = callback();
          resolve(result);
        } catch (err) {
          console.error("Mock API Error:", err.message);
          setError(err.message);
          reject(err);
        } finally {
          setLoading(false);
        }
      }, delay);
    });
  };

  // --- Payment Functions ---

  /**
   * (CREATE) Simulates making a payment for an invoice.
   */
  const makePayment = useCallback(async (invoiceId, paymentAmount, paymentMethod = 'Credit Card (Online)') => {
    
    // --- THIS IS THE COMBINED FIX ---
    const { newPayment, invoiceNumber } = await simulateApi(() => {
      let targetInvoice;
      let foundInvoiceNumber; 

      // 1. Map over the *current state* 'invoices'
      const newInvoices = invoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const amountDue = parseFloat(invoice.financialSummary.amountDue) || 0;
          if (amountDue <= 0) {
            throw new Error("Invoice not found or no amount due.");
          }
          if (paymentAmount > amountDue) {
            throw new Error("Payment exceeds amount due.");
          }
          const newPaymentsMade = (parseFloat(invoice.financialSummary.totalPaymentsMade) || 0) + paymentAmount;
          const newAmountDue = (parseFloat(invoice.financialSummary.patientResponsibility) || 0) - newPaymentsMade;
          
          targetInvoice = {
            ...invoice,
            status: newAmountDue <= 0 ? "PaidInFull" : "PartiallyPaid",
            financialSummary: {
              ...invoice.financialSummary,
              totalPaymentsMade: newPaymentsMade,
              amountDue: newAmountDue,
            },
          };
          foundInvoiceNumber = invoice.invoiceNumber; // Store the number
          return targetInvoice;
        }
        return invoice;
      });

      // 2. Check *after* the map
      if (!targetInvoice) {
        throw new Error("Invoice not found or no amount due.");
      }

      // 3. *Then* set state
      setInvoices(newInvoices);

      const newPayment = {
        id: `pay-uuid-${Date.now()}`,
        patientId: targetInvoice.patientId,
        paymentDate: new Date().toISOString().split('T')[0],
        amount: paymentAmount,
        method: paymentMethod,
        status: "Succeeded",
        transactionDetails: { /* ...mock details... */ },
        allocations: [{ invoiceId: invoiceId, amountApplied: paymentAmount }],
        unappliedAmount: 0.00,
        systemInfo: { createdAt: new Date().toISOString(), createdBy: "System-Online-Payment" }
      };
      
      setPayments(prevPayments => [newPayment, ...prevPayments]);
      
      // 4. Return both objects
      return { newPayment, invoiceNumber: foundInvoiceNumber };
    });

    try {
      await createNewThread(
        `Payment Received: $${newPayment.amount.toFixed(2)}`,
        'Billing',
        `Thank you for your payment of $${newPayment.amount.toFixed(2)} for Invoice #${invoiceNumber}.`,
        [], // attachments
        systemAuthor // <-- 5. PASS AUTHOR
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  // --- 6. ADD DEPENDENCIES ---
  }, [createNewThread, invoices, systemAuthor]);

  
  /**
   * (UPDATE) Applies an unapplied payment to an open invoice.
   */
  const applyUnappliedPayment = useCallback(async (paymentId, invoiceId) => {
    await simulateApi(() => {
      // This function doesn't create a message, so the original logic is fine.
      let targetPayment = payments.find(p => p.id === paymentId);
      let targetInvoice = invoices.find(i => i.id === invoiceId);

      if (!targetPayment || targetPayment.unappliedAmount <= 0) {
        throw new Error("No unapplied funds available for this payment.");
      }
      if (!targetInvoice || targetInvoice.financialSummary.amountDue <= 0) {
        throw new Error("Invoice not found or is already paid.");
      }

      const amountToApply = Math.min(targetPayment.unappliedAmount, targetInvoice.financialSummary.amountDue);

      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoiceId ? {
            ...inv,
            status: (inv.financialSummary.amountDue - amountToApply) <= 0 ? "PaidInFull" : "PartiallyPaid",
            financialSummary: {
              ...inv.financialSummary,
              totalPaymentsMade: inv.financialSummary.totalPaymentsMade + amountToApply,
              amountDue: inv.financialSummary.amountDue - amountToApply
            }
          } : inv
        )
      );
      setPayments(prevPayments => 
        prevPayments.map(pay => 
          pay.id === paymentId ? {
            ...pay,
            allocations: [
              ...pay.allocations,
              { invoiceId: invoiceId, amountApplied: amountToApply }
            ],
            unappliedAmount: pay.unappliedAmount - amountToApply
          } : pay
        )
      );
    });
  }, [payments, invoices]);

  // --- Policy Functions ---

  const addInsurancePolicy = useCallback(async (newPolicyData) => {
    const newPolicy = await simulateApi(() => {
      const newPolicy = {
        ...newPolicyData,
        id: `ins-uuid-${Date.now()}`,
        patientId: "patient-uuid-001", // Hardcoded for mock
      };
      setPolicies(prevPolicies => [newPolicy, ...prevPolicies]);
      return newPolicy;
    });

    try {
      await createNewThread(
        `Insurance Added: ${newPolicy.carrier.name}`,
        'Billing',
        `Your new insurance policy for ${newPolicy.carrier.name} (Policy #${newPolicy.plan.policyNumber}) has been successfully added to your account.`,
        [], // attachments
        systemAuthor // <-- PASS AUTHOR
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, systemAuthor]); // <-- ADD DEPENDENCY

  const updateInsurancePolicy = useCallback(async (policyId, updatedPolicyData) => {
    const updatedPolicy = await simulateApi(() => {
      let policyToReturn = null;
      // FIX: Map over 'policies' state, not 'prevPolicies'
      const newPolicies = policies.map(policy => {
          if (policy.id === policyId) {
            policyToReturn = { ...policy, ...updatedPolicyData };
            return policyToReturn;
          }
          return policy;
        });

      if (!policyToReturn) throw new Error("Policy not found.");
      setPolicies(newPolicies); // Set new state
      return policyToReturn;
    });

    try {
      await createNewThread(
        `Insurance Updated: ${updatedPolicy.carrier.name}`,
        'Billing',
        `Your insurance policy for ${updatedPolicy.carrier.name} (Policy #${updatedPolicy.plan.policyNumber}) has been updated.`,
        [], // attachments
        systemAuthor // <-- PASS AUTHOR
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, policies, systemAuthor]); // <-- ADD DEPENDENCIES

  const deleteInsurancePolicy = useCallback(async (policyId) => {
    await simulateApi(() => {
      setPolicies(prevPolicies =>
        prevPolicies.map(policy =>
          policy.id === policyId ? { ...policy, status: "Inactive" } : policy
        )
      );
    });
  }, []);

  // --- Claim & Refund Functions ---

  const disputeClaim = useCallback(async (claimId, reason) => {
    const disputedClaim = await simulateApi(() => {
      let claimToReturn = null;
      // FIX: Map over 'claims' state
      const newClaims = claims.map(claim => {
          if (claim.id === claimId) {
            claimToReturn = {
              ...claim,
              status: "Disputed",
              notes: `Patient Dispute: ${reason}`
            };
            return claimToReturn;
          }
          return claim;
        });

      if (!claimToReturn) throw new Error("Claim not found.");
      setClaims(newClaims); // Set new state
      return claimToReturn;
    });
    
    try {
      await createNewThread(
        `Claim Disputed: ${disputedClaim.carrierClaimId}`,
        'Billing',
        `We have received your dispute for claim ${disputedClaim.carrierClaimId} (Our ID: ${disputedClaim.id}). Our billing team will review your reason: "${reason}".`,
        [], // attachments
        systemAuthor // <-- PASS AUTHOR
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, claims, systemAuthor]); // <-- ADD DEPENDENCIES

  const requestRefund = useCallback(async (paymentId, reason) => {
    const newRefund = await simulateApi(() => {
      let targetPayment;
      
      // FIX: Map over 'payments' state
      const newPayments = payments.map(pay => {
          if (pay.id === paymentId) {
            if (pay.unappliedAmount <= 0) {
              throw new Error("No unapplied balance to refund.");
            }
            targetPayment = { ...pay, unappliedAmount: 0 };
            return targetPayment;
          }
          return pay;
        });

      if (!targetPayment) {
        throw new Error("Payment not found.");
      }

      setPayments(newPayments); // Set new state

      const newRefund = {
        id: `ref-uuid-${Date.now()}`,
        patientId: targetPayment.patientId,
        originalPaymentId: paymentId,
        refundDate: new Date().toISOString().split('T')[0],
        amount: targetPayment.unappliedAmount,
        method: targetPayment.method,
        reason: `Patient Request: ${reason}`,
        transactionDetails: { /* ...mock refund details... */ },
        systemInfo: { createdAt: new Date().toISOString(), createdBy: "System-Refund-Request" }
      };

      setRefunds(prevRefunds => [newRefund, ...prevRefunds]);
      return newRefund;
    });

    try {
      await createNewThread(
        `Refund Request Submitted: $${newRefund.amount.toFixed(2)}`,
        'Billing',
        `We have received your refund request for $${newRefund.amount.toFixed(2)} from payment ${newRefund.originalPaymentId}. This will be processed by our team.`,
        [], // attachments
        systemAuthor // <-- PASS AUTHOR
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, payments, systemAuthor]); // <-- ADD DEPENDENCIES


  // --- Value ---
  const value = useMemo(() => ({
    insurancePolicies: policies,
    insuranceClaims: claims,
    billingInvoices: invoices,
    billingPayments: payments,
    billingRefunds: refunds,
    loading,
    error,
    makePayment,
    applyUnappliedPayment,
    addInsurancePolicy,
    updateInsurancePolicy,
    deleteInsurancePolicy,
    disputeClaim,
    requestRefund,
    
  }), [
    policies, 
    claims, 
    invoices, 
    payments, 
    refunds, 
    loading, 
    error,
    makePayment,
    applyUnappliedPayment,
    addInsurancePolicy,
    updateInsurancePolicy,
    deleteInsurancePolicy,
    disputeClaim,
    requestRefund
  ]);

  // --- Render ---
  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};

// 2. Create the custom hook
export const useBillingData = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBillingData must be used within a BillingProvider');
  }
  return context;
};