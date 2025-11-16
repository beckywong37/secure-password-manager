// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
// ../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md

import {RecordItem} from './RecordItem';
import {Button} from './Button';
import type { FC } from 'react';
import type { Record } from '../types/Record';
import styles from './VaultList.module.css';

export const VaultList:FC<{records: Record[], onAddRecord: () => void, onEditRecord: (record: Record) => void, onSelectRecord: (record: Record) => void}> = ({records, onAddRecord, onEditRecord, onSelectRecord}) => {
    return (
        <div className={styles.vaultList}>
            <Button onClick={onAddRecord} variant="primary">Add Record</Button>
            {records.map((record) => (
                <RecordItem key={record.id} record={record} onEditRecord={onEditRecord} onSelectRecord={onSelectRecord} />
            ))}
        </div>
    )
}