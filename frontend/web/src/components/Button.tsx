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

