/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; 
import { useEngagementData } from './EngagementContext'; 
import { formatCurrency } from '../utils/formatting'; // <-- IMPORT THE FORMATTER

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

  // --- Payment Method Functions ---

  /**
   * (CREATE) Adds a new payment method to the user's account.
   */
  const addPaymentMethod = useCallback(async (newMethodData) => {
    await simulateApi(() => {
      const newPaymentMethod = {
        ...newMethodData,
        id: `pm-uuid-${Date.now()}`,
        patientId: "patient-uuid-001",
      };
      setPaymentMethods(prev => {
        if (prev.length === 0) {
          newPaymentMethod.isDefault = true;
          return [newPaymentMethod];
        }
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
   */
  const makePayment = useCallback(async (invoiceId, paymentAmount, paymentMethodId, currency) => {    
    const { newPayment, invoiceNumber } = await simulateApi(() => {
      // 1. Find the payment method
      const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error("Payment method not found.");
      }
      
      // 2. Find and update the invoice (this logic is correct)
      let targetInvoice;
      let foundInvoiceNumber; 
      // ... (invoice mapping logic is correct)
      const newInvoices = invoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const amountDue = parseFloat(invoice.financialSummary.amountDue.amount) || 0;
          if (amountDue <= 0) { throw new Error("Invoice not found or no amount due."); }
          if (paymentAmount > amountDue) {
            if (paymentAmount - amountDue > 0.01) { throw new Error("Payment exceeds amount due."); }
            paymentAmount = amountDue;
          }
          const newPaymentsMade = (parseFloat(invoice.financialSummary.totalPaymentsMade.amount) || 0) + paymentAmount;
          const newAmountDue = (parseFloat(invoice.financialSummary.patientResponsibility.amount) || 0) - newPaymentsMade;
          targetInvoice = {
            ...invoice,
            status: newAmountDue <= 0.001 ? "PaidInFull" : "PartiallyPaid",
            financialSummary: {
              ...invoice.financialSummary,
              totalPaymentsMade: { amount: newPaymentsMade, currency: currency },
              amountDue: { amount: newAmountDue, currency: currency },
            },
          };
          foundInvoiceNumber = invoice.invoiceNumber;
          return targetInvoice;
        }
        return invoice;
      });
      if (!targetInvoice) { throw new Error("Invoice not found or no amount due."); }
      setInvoices(newInvoices);


      // --- 3. THIS IS THE UPDATE ---
      let paymentMethodString = "Unknown";
      let transactionDetails = {};

      if (paymentMethod.type === 'card') {
        paymentMethodString = `${paymentMethod.cardType} **** ${paymentMethod.lastFour}`;
        transactionDetails = {
          transactionId: `ch_${Date.now()}`,
          cardType: paymentMethod.cardType,
          lastFour: paymentMethod.lastFour,
          gateway: "Stripe"
        };
      } else if (paymentMethod.type === 'bank') {
        paymentMethodString = `${paymentMethod.bankName} (....${paymentMethod.lastFour})`;
        transactionDetails = {
          transactionId: `wire_${Date.now()}`,
          bankName: paymentMethod.bankName,
          lastFour: paymentMethod.lastFour,
          gateway: "Mock Bank Transfer"
        };
      } else if (paymentMethod.type === 'online') { // <-- ADDED THIS BLOCK
        paymentMethodString = `${paymentMethod.serviceName} (${paymentMethod.email || paymentMethod.phone})`;
        transactionDetails = {
          transactionId: `online_${Date.now()}`,
          service: paymentMethod.serviceName,
          identifier: paymentMethod.email || paymentMethod.phone,
          gateway: "Mock Online Payment"
        };
      }

      const newPayment = {
        id: `pay-uuid-${Date.now()}`,
        patientId: targetInvoice.patientId,
        paymentDate: new Date().toISOString().split('T')[0],
        amount: { amount: paymentAmount, currency: currency },        
        method: paymentMethodString, // <-- Uses new string
        status: "Succeeded",
        transactionDetails: transactionDetails, // <-- Uses new details
        allocations: [{ invoiceId: invoiceId, amountApplied: { amount: paymentAmount, currency: currency } }],
        unappliedAmount: { amount: 0.00, currency: currency },
        systemInfo: { createdAt: new Date().toISOString(), createdBy: "System-Online-Payment" }
      };
      
      setPayments(prevPayments => [newPayment, ...prevPayments]);
      
      return { newPayment, invoiceNumber: foundInvoiceNumber };
    });

    // 4. Send the confirmation message (this logic is correct)
    try {
      const formattedAmount = formatCurrency(newPayment.amount); // Use formatter
      await createNewThread(
        `Payment Received: ${formattedAmount}`,
        'Billing',
        `Thank you for your payment of ${formattedAmount} for Invoice #${invoiceNumber}.`,
        [], // attachments
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, invoices, systemAuthor, paymentMethods]);

  
  /**
   * (UPDATE) Applies an unapplied payment to an open invoice.
   */
  const applyUnappliedPayment = useCallback(async (paymentId, invoiceId) => {
    await simulateApi(() => {
      let targetPayment = payments.find(p => p.id === paymentId);
      let targetInvoice = invoices.find(i => i.id === invoiceId);

      // --- 1. READ FROM OBJECT ---
      const unappliedAmount = targetPayment?.unappliedAmount?.amount || 0;
      const amountDue = targetInvoice?.financialSummary?.amountDue?.amount || 0;
      const currency = targetPayment?.unappliedAmount?.currency || 'USD';

      if (!targetPayment || unappliedAmount <= 0) {
        throw new Error("No unapplied funds available for this payment.");
      }
      if (!targetInvoice || amountDue <= 0) {
        throw new Error("Invoice not found or is already paid.");
      }

      const amountToApply = Math.min(unappliedAmount, amountDue);

      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoiceId ? {
            ...inv,
            // --- 2. UPDATE INVOICE WITH OBJECTS ---
            status: (inv.financialSummary.amountDue.amount - amountToApply) <= 0.001 ? "PaidInFull" : "PartiallyPaid",
            financialSummary: {
              ...inv.financialSummary,
              totalPaymentsMade: {
                amount: inv.financialSummary.totalPaymentsMade.amount + amountToApply,
                currency: currency
              },
              amountDue: {
                amount: inv.financialSummary.amountDue.amount - amountToApply,
                currency: currency
              }
            }
          } : inv
        )
      );
      setPayments(prevPayments => 
        prevPayments.map(pay => 
          pay.id === paymentId ? {
            ...pay,
            // --- 3. UPDATE PAYMENT WITH OBJECTS ---
            allocations: [
              ...pay.allocations,
              { invoiceId: invoiceId, amountApplied: { amount: amountToApply, currency: currency } }
            ],
            unappliedAmount: {
              amount: pay.unappliedAmount.amount - amountToApply,
              currency: currency
            }
          } : pay
        )
      );
    });
  }, [payments, invoices]);

  // --- Policy Functions ---
  // (These do not handle money, so they are fine)

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
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, systemAuthor]); 

  const updateInsurancePolicy = useCallback(async (policyId, updatedPolicyData) => {
    const updatedPolicy = await simulateApi(() => {
      let policyToReturn = null;
      const newPolicies = policies.map(policy => { // <-- Use 'policies' from state
          if (policy.id === policyId) {
            policyToReturn = { ...policy, ...updatedPolicyData };
            return policyToReturn;
          }
          return policy;
        });

      if (!policyToReturn) throw new Error("Policy not found.");
      setPolicies(newPolicies);
      return policyToReturn;
    });

    try {
      await createNewThread(
        `Insurance Updated: ${updatedPolicy.carrier.name}`,
        'Billing',
        `Your insurance policy for ${updatedPolicy.carrier.name} (Policy #${updatedPolicy.plan.policyNumber}) has been updated.`,
        [], // attachments
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, policies, systemAuthor]); // <-- Added 'policies'

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
      const newClaims = claims.map(claim => { // <-- Use 'claims' from state
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
      setClaims(newClaims); 
      return claimToReturn;
    });
    
    try {
      await createNewThread(
        `Claim Disputed: ${disputedClaim.carrierClaimId}`,
        'Billing',
        `We have received your dispute for claim ${disputedClaim.carrierClaimId} (Our ID: ${disputedClaim.id}). Our billing team will review your reason: "${reason}".`,
        [], // attachments
        systemAuthor
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, claims, systemAuthor]); // <-- Added 'claims'

  const requestRefund = useCallback(async (paymentId, reason) => {
    const newRefund = await simulateApi(() => {
      let targetPayment;
      let currency = 'USD'; // Default currency
      
      const newPayments = payments.map(pay => { // <-- Use 'payments' from state
          if (pay.id === paymentId) {
            // --- 1. READ FROM OBJECT ---
            const unappliedAmount = pay.unappliedAmount?.amount || 0;
            if (unappliedAmount <= 0) {
              throw new Error("No unapplied balance to refund.");
            }
            currency = pay.unappliedAmount.currency; // Get currency
            targetPayment = { 
              ...pay, 
              // --- 2. UPDATE OBJECT ---
              unappliedAmount: { amount: 0, currency: currency } 
            };
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
        // --- 3. STORE OBJECT ---
        amount: { 
          amount: targetPayment.unappliedAmount.amount, // Get old amount
          currency: currency 
        },
        method: targetPayment.method,
        reason: `Patient Request: ${reason}`,
        transactionDetails: { /* ...mock refund details... */ },
        systemInfo: { createdAt: new Date().toISOString(), createdBy: "System-Refund-Request" }
      };

      setRefunds(prevRefunds => [newRefund, ...prevRefunds]);
      return newRefund;
    });

    try {
      // --- 4. USE FORMATTER ---
      const formattedAmount = formatCurrency(newRefund.amount);
      await createNewThread(
        `Refund Request Submitted: ${formattedAmount}`,
        'Billing',
        `We have received your refund request for ${formattedAmount} from payment ${newRefund.originalPaymentId}. This will be processed by our team.`,
        [], // attachments
        systemAuthor
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, payments, systemAuthor]); // <-- Added 'payments'


  // --- Value ---
  const value = useMemo(() => ({
    insurancePolicies: policies,
    insuranceClaims: claims,
    billingInvoices: invoices,
    billingPayments: payments,
    billingRefunds: refunds,
    paymentMethods: paymentMethods,
    loading,
    error,
    makePayment,
    applyUnappliedPayment,
    addInsurancePolicy,
    updateInsurancePolicy,
    deleteInsurancePolicy,
    disputeClaim,
    requestRefund,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    
  }), [
    policies, 
    claims, 
    invoices, 
    payments, 
    refunds, 
    paymentMethods,
    loading, 
    error,
    makePayment,
    applyUnappliedPayment,
    addInsurancePolicy,
    updateInsurancePolicy,
    deleteInsurancePolicy,
    disputeClaim,
    requestRefund,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
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