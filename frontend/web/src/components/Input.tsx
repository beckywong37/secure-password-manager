import type { FC, InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
    rightAdornment?: ReactNode;
    secondaryRightAdornment?: ReactNode;
    error?: string;
    helperText?: string;
}

export const Input: FC<InputProps> = ({ 
    label, 
    rightAdornment, 
    secondaryRightAdornment,
    error,
    helperText,
    className, 
    ...inputProps 
}) => {
    const hasError = !!error;
    const showMessage = error || helperText;
    
    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.inputContainer}>
                <input 
                    className={`${styles.input} ${hasError ? styles.inputError : ''} ${className || ''}`}
                    {...inputProps}
                />
                {(rightAdornment || secondaryRightAdornment) && (
                    <div className={styles.rightAdornment}>
                        {secondaryRightAdornment}
                        {rightAdornment}
                    </div>
                )}
            </div>
            {showMessage && (
                <div className={hasError ? styles.errorMessage : styles.helperText}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
    label?: ReactNode;
    rows?: number;
    error?: string;
    helperText?: string;
}

export const Textarea: FC<TextareaProps> = ({ 
    label, 
    className, 
    rows = 3,
    error,
    helperText,
    ...textareaProps 
}) => {
    const hasError = !!error;
    const showMessage = error || helperText;
    
    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <textarea 
                className={`${styles.textarea} ${hasError ? styles.inputError : ''} ${className || ''}`}
                rows={rows}
                {...textareaProps as any}
            />
            {showMessage && (
                <div className={hasError ? styles.errorMessage : styles.helperText}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

