// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
// ../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md

import type { FC, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fluid?: boolean;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({ 
  variant = 'primary', 
  fluid = false,
  className = '', 
  children, 
  ...props 
}) => {
  const variantClass = styles[variant];
  const fluidClass = fluid ? styles.fluid : '';
  const combinedClassName = `${styles.button} ${variantClass} ${fluidClass} ${className}`.trim();
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

