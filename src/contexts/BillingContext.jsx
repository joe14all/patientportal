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
  // --- ADD NEW PAYMENT METHODS STATE ---
  const [paymentMethods, setPaymentMethods] = useState(mockApi.billing.paymentMethods);

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

  // --- Payment Method Functions (NEW) ---

  /**
   * (CREATE) Adds a new payment method to the user's account.
   */
  const addPaymentMethod = useCallback(async (newCardData) => {
    await simulateApi(() => {
      const newPaymentMethod = {
        ...newCardData, // This would be the tokenized card data in a real app
        id: `pm-uuid-${Date.now()}`,
        patientId: "patient-uuid-001", // Hardcoded for mock
      };

      setPaymentMethods(prev => {
        // If this is the first card, make it the default
        if (prev.length === 0) {
          newPaymentMethod.isDefault = true;
          return [newPaymentMethod];
        }
        // If it's set as default, unset all others
        if (newPaymentMethod.isDefault) {
          const unDefaulted = prev.map(pm => ({ ...pm, isDefault: false }));
          return [...unDefaulted, newPaymentMethod];
        }
        return [...prev, newPaymentMethod];
      });
    });
  }, []);

  /**
   * (DELETE) Removes a payment method from the user's account.
   */
  const removePaymentMethod = useCallback(async (paymentMethodId) => {
    await simulateApi(() => {
      setPaymentMethods(prev => 
        prev.filter(pm => pm.id !== paymentMethodId)
      );
      // Note: This could leave the user with no default card.
      // A real app would need logic to assign a new default if the default was removed.
    });
  }, []);

  /**
   * (UPDATE) Sets a specific payment method as the default.
   */
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId) => {
    await simulateApi(() => {
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId
        }))
      );
    });
  }, []);


  // --- Payment Functions ---

  /**
   * (CREATE) Simulates making a payment for an invoice.
   * --- UPDATED to accept a paymentMethodId ---
   */
  const makePayment = useCallback(async (invoiceId, paymentAmount, paymentMethodId) => {
    
    const { newPayment, invoiceNumber } = await simulateApi(() => {
      // 1. Find the payment method to get its details
      const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error("Payment method not found.");
      }
      
      // 2. Find and update the invoice
      let targetInvoice;
      let foundInvoiceNumber; 

      const newInvoices = invoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const amountDue = parseFloat(invoice.financialSummary.amountDue) || 0;
          if (amountDue <= 0) {
            throw new Error("Invoice not found or no amount due.");
          }
          // --- UPDATED: Allow partial payment ---
          if (paymentAmount > amountDue) {
            // Allow a small tolerance for floating point issues
            if (paymentAmount - amountDue > 0.01) {
              throw new Error("Payment exceeds amount due.");
            }
            paymentAmount = amountDue; // Correct to the exact amount due
          }

          const newPaymentsMade = (parseFloat(invoice.financialSummary.totalPaymentsMade) || 0) + paymentAmount;
          const newAmountDue = (parseFloat(invoice.financialSummary.patientResponsibility) || 0) - newPaymentsMade;
          
          targetInvoice = {
            ...invoice,
            // --- UPDATED: Use a small epsilon for float comparison ---
            status: newAmountDue <= 0.001 ? "PaidInFull" : "PartiallyPaid",
            financialSummary: {
              ...invoice.financialSummary,
              totalPaymentsMade: newPaymentsMade,
              amountDue: newAmountDue,
            },
          };
          foundInvoiceNumber = invoice.invoiceNumber;
          return targetInvoice;
        }
        return invoice;
      });

      if (!targetInvoice) {
        throw new Error("Invoice not found or no amount due.");
      }

      setInvoices(newInvoices);

      // 3. Create the new payment record
      const paymentMethodString = `${paymentMethod.cardType} **** ${paymentMethod.lastFour}`;
      const newPayment = {
        id: `pay-uuid-${Date.now()}`,
        patientId: targetInvoice.patientId,
        paymentDate: new Date().toISOString().split('T')[0],
        amount: paymentAmount,
        method: paymentMethodString, // Use the formatted string
        status: "Succeeded",
        transactionDetails: {
          transactionId: `ch_3Pq...${Date.now().toString().slice(-4)}`,
          cardType: paymentMethod.cardType,
          lastFour: paymentMethod.lastFour,
          gateway: "Stripe"
        },
        allocations: [{ invoiceId: invoiceId, amountApplied: paymentAmount }],
        unappliedAmount: 0.00,
        systemInfo: { createdAt: new Date().toISOString(), createdBy: "System-Online-Payment" }
      };
      
      setPayments(prevPayments => [newPayment, ...prevPayments]);
      
      return { newPayment, invoiceNumber: foundInvoiceNumber };
    });

    // 4. Send the confirmation message (no change here)
    try {
      await createNewThread(
        `Payment Received: $${newPayment.amount.toFixed(2)}`,
        'Billing',
        `Thank you for your payment of $${newPayment.amount.toFixed(2)} for Invoice #${invoiceNumber}.`,
        [], // attachments
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, invoices, systemAuthor, paymentMethods]); // <-- ADD paymentMethods

  
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

      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoiceId ? {
            ...inv,
            status: (inv.financialSummary.amountDue - amountToApply) <= 0.001 ? "PaidInFull" : "PartiallyPaid",
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
  // (No changes to policy, claim, or refund functions)

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
    paymentMethods: paymentMethods, // <-- ADD NEW STATE
    loading,
    error,
    makePayment,
    applyUnappliedPayment,
    addInsurancePolicy,
    updateInsurancePolicy,
    deleteInsurancePolicy,
    disputeClaim,
    requestRefund,
    addPaymentMethod, // <-- ADD NEW FUNCTION
    removePaymentMethod, // <-- ADD NEW FUNCTION
    setDefaultPaymentMethod, // <-- ADD NEW FUNCTION
    
  }), [
    policies, 
    claims, 
    invoices, 
    payments, 
    refunds, 
    paymentMethods, // <-- ADD NEW DEPENDENCY
    loading, 
    error,
    makePayment,
    applyUnappliedPayment,
    addInsurancePolicy,
    updateInsurancePolicy,
    deleteInsurancePolicy,
    disputeClaim,
    requestRefund,
    addPaymentMethod, // <-- ADD NEW DEPENDENCY
    removePaymentMethod, // <-- ADD NEW DEPENDENCY
    setDefaultPaymentMethod // <-- ADD NEW DEPENDENCY
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