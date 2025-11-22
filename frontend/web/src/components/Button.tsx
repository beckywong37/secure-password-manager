// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
// ../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md

import type { FC, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';
import { LoadingSpinner } from './LoadingSpinner';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fluid?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({ 
  variant = 'primary', 
  fluid = false,
  isLoading = false,
  disabled = false,
  className = '', 
  children, 
  ...props 
}) => {
  const variantClass = styles[variant];
  const fluidClass = fluid ? styles.fluid : '';
  const loadingClass = isLoading ? styles.loading : '';
  const combinedClassName = `${styles.button} ${variantClass} ${fluidClass} ${loadingClass} ${className}`.trim();
  
  return (
    <button 
      className={combinedClassName} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinnerWrapper}>
          <LoadingSpinner size="small" />
        </span>
      )}
      <span className={isLoading ? styles.loadingText : ''}>
        {children}
      </span>
    </button>
  );
};

