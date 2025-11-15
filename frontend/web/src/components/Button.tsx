import type { FC, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) => {
  const variantClass = styles[variant];
  const combinedClassName = `${styles.button} ${variantClass} ${className}`.trim();
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

