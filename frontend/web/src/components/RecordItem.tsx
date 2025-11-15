import type { FC } from 'react';
import type { Record } from '../types/Record';
import {Button} from './Button';
import styles from './RecordItem.module.css';

export const RecordItem:FC<{record: Record, onEditRecord: (record: Record) => void, onSelectRecord: (record: Record) => void}> = ({record, onEditRecord, onSelectRecord}) => {
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