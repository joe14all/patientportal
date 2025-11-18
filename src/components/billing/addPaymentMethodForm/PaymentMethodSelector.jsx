import React from 'react';
import { PAYMENT_METHOD_CONFIG } from '../../../constants';
import styles from './PaymentMethodSelector.module.css';

/**
 * Renders the list of payment method options (Card, Bank, etc.)
 */
const PaymentMethodSelector = ({ onSelectMethod }) => {
  return (
    <div className={styles.methodSelector}>
      {PAYMENT_METHOD_CONFIG.map(method => {
        const Icon = method.icon; // Get the icon component from the config
        return (
          <button
            type="button"
            className={styles.methodButton}
            onClick={() => onSelectMethod(method.id)}
            key={method.id}
          >
            <Icon />
            <span>{method.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;