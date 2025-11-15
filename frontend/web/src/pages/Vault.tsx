/*
This creates the Vault page using React.

Note:
To start the Vite dev server, run: 'npm run dev' in the frontend/web directory.
*/

import { useState } from 'react';
import type { Record } from '../types/Record';
import styles from './Vault.module.css';
import { VaultList } from '../components/VaultList';
import { RecordForm } from '../components/RecordForm';
import { RecordDetails } from '../components/RecordDetails';


// TODO: Hard coded data for now, will be replaced with API data later
const dummyRecords = [
  {
    id: 1,
    title: 'GitHub',
    username: 'johndoe',
    password: 'U2FsdGVkX1+encrypted_password_hash_1',
    email: 'john.doe@example.com',
    url: 'https://github.com',
    notes: 'Work account',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-03-20T14:22:00Z',
  },
  {
    id: 2,
    title: 'Gmail',
    username: 'john.doe',
    password: 'U2FsdGVkX1+encrypted_password_hash_2',
    email: 'john.doe@gmail.com',
    url: 'https://mail.google.com',
    notes: 'Personal email account',
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-02-10T11:45:00Z',
  },
  {
    id: 3,
    title: 'Netflix',
    username: 'johndoe@example.com',
    password: 'U2FsdGVkX1+encrypted_password_hash_3',
    email: 'johndoe@example.com',
    url: 'https://www.netflix.com',
    notes: '',
    created_at: '2024-02-01T18:00:00Z',
    updated_at: '2024-02-01T18:00:00Z',
  },
  {
    id: 4,
    title: 'AWS Console',
    username: 'admin',
    password: 'U2FsdGVkX1+encrypted_password_hash_4',
    email: 'admin@company.com',
    url: 'https://console.aws.amazon.com',
    notes: 'Production environment credentials - handle with care',
    created_at: '2024-03-05T08:20:00Z',
    updated_at: '2024-10-12T16:30:00Z',
  },
  {
    id: 5,
    title: 'LinkedIn',
    username: 'john-doe-123',
    password: 'U2FsdGVkX1+encrypted_password_hash_5',
    email: 'john.doe@example.com',
    url: 'https://www.linkedin.com',
    notes: 'Professional network',
    created_at: '2024-01-20T12:00:00Z',
    updated_at: '2024-05-18T09:12:00Z',
  },
  {
    id: 6,
    title: 'Bank Account',
    username: 'johndoe1985',
    password: 'U2FsdGVkX1+encrypted_password_hash_6',
    email: '',
    url: 'https://www.mybank.com',
    notes: 'Main checking account',
    created_at: '2024-02-14T14:30:00Z',
    updated_at: '2024-08-22T10:15:00Z',
  },
];

export const VaultPage = () => {
    const [records, setRecords] = useState<Record[]>(dummyRecords);

    const [editingRecord, setEditingRecord] = useState<Record | null | undefined>(undefined);
    const [selectedRecord, setSelectedRecord] = useState<Record | null >(null);

    const handleRecordSubmit = (record: Record) => {
        if (editingRecord) {
            setRecords(records.map(r => r.id === editingRecord.id ? record : r));
        } else {
            setRecords([...records, record]);
        }
        setEditingRecord(undefined);
    }

    const onAddRecord = () => {
        setEditingRecord(null);
        }
    
    const onEditRecord = (record: Record) => {
        setEditingRecord(record);
    }

    const onSelectRecord = (record: Record) => {
        setSelectedRecord(record);
    }

    const onCancel = () => {
        setEditingRecord(undefined);
    }

    const onCloseDetails = () => {
        setSelectedRecord(null);
    }

    const onDeleteRecord = (record: Record) => {
        setRecords(records.filter(r => r.id !== record.id));
        setSelectedRecord(null);
    }
    
    return (
        <div className={styles.vaultContainer}>
            <div className={styles.vaultContent}>
                <h1>Vault</h1>
                <div className={styles.vaultLayout}>
                    <div className={styles.leftColumn}>
                        <VaultList 
                            records={records} 
                            onAddRecord={onAddRecord} 
                            onEditRecord={onEditRecord} 
                            onSelectRecord={onSelectRecord}
                        />
                    </div>
                    <div className={styles.rightColumn}>
                        {editingRecord !== undefined && (
                            <RecordForm 
                                record={editingRecord} 
                                onSubmit={handleRecordSubmit} 
                                onCancel={onCancel} 
                            />
                        )}
                        {selectedRecord && editingRecord === undefined && (
                            <RecordDetails 
                                record={selectedRecord} 
                                onClose={onCloseDetails}
                                onDelete={onDeleteRecord}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}