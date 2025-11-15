// TODO: Figure out user flow to view the record details once a record is selected
import type { FC } from 'react';
import type { Record } from '../types/Record';
import styles from './RecordDetails.module.css';

export const RecordDetails:FC<{record: Record}> = ({record}) => {
    return (
        <div className={styles.recordDetails}>
            <h3>{record.title}</h3>
            <p><strong>Username:</strong> {record.username}</p>
            <p><strong>Password:</strong> {record.password}</p>
            {record.email && <p><strong>Email:</strong> {record.email}</p>}
            {record.url && <p><strong>URL:</strong> {record.url}</p>}
            {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
            <p><strong>Created:</strong> {new Date(record.created_at).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(record.updated_at).toLocaleDateString()}</p>
        </div>
    )
}