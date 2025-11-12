
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; // Import the initial mock data

// 1. Create the context
export const BillingContext = createContext(null);

// 3. Create the Provider component
export const BillingProvider = ({ children }) => {
  // --- State ---
  // Initialize state from the mock API
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
   * This updates both the invoice and adds a new payment record.
   */
  const makePayment = useCallback(async (invoiceId, paymentAmount, paymentMethod = 'Credit Card (Online)') => {
    await simulateApi(() => {
      let targetInvoice;

      setInvoices(prevInvoices =>
        prevInvoices.map(invoice => {
          if (invoice.id === invoiceId) {
            const amountDue = parseFloat(invoice.financialSummary.amountDue) || 0;
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
            return targetInvoice;
          }
          return invoice;
        })
      );

      if (!targetInvoice) {
        throw new Error("Invoice not found.");
      }

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
    });
  }, []);

  /**
   * (UPDATE) Applies an unapplied payment to an open invoice.
   */
  const applyUnappliedPayment = useCallback(async (paymentId, invoiceId) => {
    await simulateApi(() => {
      let targetPayment = payments.find(p => p.id === paymentId);
      let targetInvoice = invoices.find(i => i.id === invoiceId);

      if (!targetPayment || targetPayment.unappliedAmount <= 0) {
        throw new Error("No unapplied funds available for this payment.");
      }
      if (!targetInvoice || targetInvoice.financialSummary.amountDue <= 0) {
        throw new Error("Invoice not found or is already paid.");
      }

      const amountToApply = Math.min(targetPayment.unappliedAmount, targetInvoice.financialSummary.amountDue);

      // Update Invoice
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

      // Update Payment
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

  /**
   * (CREATE) Adds a new insurance policy.
   */
  const addInsurancePolicy = useCallback(async (newPolicyData) => {
    await simulateApi(() => {
      const newPolicy = {
        ...newPolicyData,
        id: `ins-uuid-${Date.now()}`,
        patientId: "patient-uuid-001", // Hardcoded for mock
      };
      setPolicies(prevPolicies => [newPolicy, ...prevPolicies]);
    });
  }, []);

  /**
   * (UPDATE) Updates an existing insurance policy.
   */
  const updateInsurancePolicy = useCallback(async (policyId, updatedPolicyData) => {
    await simulateApi(() => {
      setPolicies(prevPolicies =>
        prevPolicies.map(policy =>
          policy.id === policyId ? { ...policy, ...updatedPolicyData } : policy
        )
      );
    });
  }, []);

  /**
   * (DELETE) Sets an insurance policy to "Inactive".
   */
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

  /**
   * (UPDATE) Simulates disputing a claim, changing its status.
   */
  const disputeClaim = useCallback(async (claimId, reason) => {
    await simulateApi(() => {
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === claimId ? {
            ...claim,
            status: "Disputed",
            notes: `Patient Dispute: ${reason}` // Add a note
          } : claim
        )
      );
      // In a real app, this would also create an engagement/message
    });
  }, []);

  /**
   * (CREATE) Requests a refund for an unapplied payment.
   */
  const requestRefund = useCallback(async (paymentId, reason) => {
    await simulateApi(() => {
      let targetPayment;
      
      // Update the payment to show 0 unapplied
      setPayments(prevPayments =>
        prevPayments.map(pay => {
          if (pay.id === paymentId) {
            if (pay.unappliedAmount <= 0) {
              throw new Error("No unapplied balance to refund.");
            }
            targetPayment = { ...pay, unappliedAmount: 0 };
            return targetPayment;
          }
          return pay;
        })
      );

      if (!targetPayment) {
        throw new Error("Payment not found.");
      }

      // Create a new refund record
      const newRefund = {
        id: `ref-uuid-${Date.now()}`,
        patientId: targetPayment.patientId,
        originalPaymentId: paymentId,
        refundDate: new Date().toISOString().split('T')[0],
        amount: targetPayment.unappliedAmount,
        method: targetPayment.method, // Refund to original method
        reason: `Patient Request: ${reason}`,
        transactionDetails: { /* ...mock refund details... */ },
        systemInfo: { createdAt: new Date().toISOString(), createdBy: "System-Refund-Request" }
      };

      setRefunds(prevRefunds => [newRefund, ...prevRefunds]);
    });
  }, []);


  // --- Value ---
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State (READ)
    insurancePolicies: policies,
    insuranceClaims: claims,
    billingInvoices: invoices,
    billingPayments: payments,
    billingRefunds: refunds,
    loading,
    error,
    
    // Functions (CREATE, UPDATE, DELETE)
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