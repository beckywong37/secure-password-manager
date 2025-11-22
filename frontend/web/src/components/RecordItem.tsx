// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
// ../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md

import type { FC } from 'react';
import type { VaultRecord } from '../types/VaultRecord';
import {Button} from './Button';
import styles from './RecordItem.module.css';

export const RecordItem:FC<{record: VaultRecord, onEditRecord: (record: VaultRecord) => void, onSelectRecord: (record: VaultRecord) => void}> = ({record, onEditRecord, onSelectRecord}) => {
    return (
        <div className={styles.recordItem} onClick={() => onSelectRecord(record)}>
            <div>
                <h3>{record.title}</h3>
                <p>Updated: {new Date(record.updated_at).toLocaleDateString()}</p>
            </div>
            <Button 
                variant="tertiary" 
                onClick={(e) => {
                    e.stopPropagation();
                    onEditRecord(record);
                }}
            >
                Edit
            </Button>
        </div>
    )
}