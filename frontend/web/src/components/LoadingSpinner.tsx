// GenAI Citation for April:
// Portions of this code relating to implementing a loading spinner was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_21_Cursor_implement_reusable_loading_icon.md

import type { FC } from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  color?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  text,
  color
}) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div 
          className={styles.spinnerCircle} 
          style={color ? { borderTopColor: color } : undefined}
        />
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

