// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
// ../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md

import {RecordItem} from './RecordItem';
import {Button} from './Button';
import type { FC } from 'react';
import type { VaultRecord } from '../types/VaultRecord';
import styles from './VaultList.module.css';

export const VaultList:FC<{records: VaultRecord[], onAddRecord: () => void, onEditRecord: (record: VaultRecord) => void, onSelectRecord: (record: VaultRecord) => void}> = ({records, onAddRecord, onEditRecord, onSelectRecord}) => {
    return (
        <div className={styles.vaultList}>
            <Button onClick={onAddRecord} variant="primary">Add Record</Button>

            { (records === null || records.length === 0) && <p>No records found. Add a record to get started.</p>}
            { records !== null && records !== undefined && records.length > 0 && records.map((record) => (
                <RecordItem key={record.id} record={record} onEditRecord={onEditRecord} onSelectRecord={onSelectRecord} />
            ))}
        </div>
    )
}