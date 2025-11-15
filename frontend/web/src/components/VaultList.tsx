import {RecordItem} from './RecordItem';
import {Button} from './Button';
import type { FC } from 'react';
import type { Record } from '../types/Record';
import styles from './VaultList.module.css';

export const VaultList:FC<{records: Record[], onAddRecord: () => void, onEditRecord: (record: Record) => void}> = ({records, onAddRecord, onEditRecord}) => {
    return (
        <div className={styles.vaultList}>
            <Button onClick={onAddRecord} variant="primary">Add Record</Button>
            {records.map((record) => (
                <RecordItem key={record.id} record={record} onEditRecord={onEditRecord} />
            ))}
        </div>
    )
}