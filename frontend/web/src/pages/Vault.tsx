/*
This creates the Vault page using React.

Note:
To start the Vite dev server, run: 'npm run dev' in the frontend/web directory.

GenAI Citation for April:
Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
The conversation in the file below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_14_Cursor_generate_dummy_data_for_Vault.md
../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md
*/

import { useState, useEffect, useCallback } from 'react';
import type { VaultRecord as VaultRecord } from '../types/VaultRecord';
import styles from './Vault.module.css';
import { VaultList } from '../components/VaultList';
import { RecordForm } from '../components/RecordForm';
import { RecordDetails } from '../components/RecordDetails';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Spacer } from '../components/Spacer';
import { apiRequest } from '../utils/http/apiRequest';
import { useVaultKey } from '../contexts/useVaultKey';
import { encryptVaultEntry } from '../utils/crypto/encryptVaultEntry';
import { decryptVaultEntry } from '../utils/crypto/decryptVaultEntry';


export const VaultPage = () => {
    const [records, setRecords] = useState<VaultRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingRecord, setEditingRecord] = useState<VaultRecord | null | undefined>(undefined);
    const [selectedRecord, setSelectedRecord] = useState<VaultRecord | null >(null);
    
    const { vaultKey } = useVaultKey();

    const getErrorMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        if (typeof err === 'object' && err !== null && 'message' in err) {
          return String(err.message);
        }
        return 'An error occurred';
      };

    const fetchRecords = useCallback(async () => {
        if (!vaultKey) {
            setError('Vault key not available. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const {data} = await apiRequest<VaultRecord[]>('/api/vault/records/', {
              method: 'GET',
              requiresAuth: true
            });
            
            // Decrypt sensitive fields
            const decryptedRecords = await Promise.all(
                data.map(async (record) => ({
                    ...record,
                    password: await decryptVaultEntry(vaultKey, record.password),
                    notes: record.notes ? await decryptVaultEntry(vaultKey, record.notes) : '',
                }))
            );
            
            setRecords(decryptedRecords);
          } catch (err) {
            setError(getErrorMessage(err));
            console.error('Error fetching records:', err);
          } finally {
            setLoading(false);
          }
    }, [vaultKey]);

    // Mutations without loading spinner
    const performMutation = async function<T>(
        apiCall: Promise<T>
    ): Promise<boolean> {
        try {
            setError(null);
            await apiCall;
            await fetchRecords(); // Re-fetch after any mutation
            return true;
        } catch (err) {
            setError(getErrorMessage(err));
            console.error('Error:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchRecords();
      }, [fetchRecords]);

    const onAddRecord = () => {
        setEditingRecord(null);
        }
    
    const onEditRecord = (record: VaultRecord) => {
        setEditingRecord(record);
    }

    const onSelectRecord = (record: VaultRecord) => {
        setSelectedRecord(record);
    }

    const onCancel = () => {
        setEditingRecord(undefined);
    }

    const onCloseDetails = () => {
        setSelectedRecord(null);
    }

    const onDeleteRecord = async (record: VaultRecord) => {
        const success = await performMutation(
        apiRequest(`/api/vault/records/${record.id}/`, {
            method: 'DELETE',
            requiresAuth: true
        }));
        if (success) {
            setSelectedRecord(null);
        }
    }

    const handleRecordSubmit = async (record: VaultRecord) => {
        if (!vaultKey) {
            setError('Vault key not available. Cannot save record.');
            return;
        }

        // Encrypt sensitive fields before sending
        const encryptedRecord = {
            ...record,
            password: await encryptVaultEntry(vaultKey, record.password),
            notes: record.notes ? await encryptVaultEntry(vaultKey, record.notes) : '',
        };

        const success = await performMutation(
            apiRequest(
                editingRecord ? `/api/vault/records/${editingRecord.id}/` : '/api/vault/records/',
                {
                    method: editingRecord ? 'PUT' : 'POST',
                    body: encryptedRecord,
                    requiresAuth: true
                }
            ));
        if (success) {
            setEditingRecord(undefined);
        }
    }
    
    
    return (
        <div className={styles.vaultContainer}>
            <div className={styles.vaultContent}>
                <h1>Vault</h1>

                {loading && (
                    <Spacer paddingY="xl">
                        <LoadingSpinner size="large" text="Loading your vault..." />
                    </Spacer>
                )}

                {error && <p style={{ color: 'var(--color-error)' }}>Error: {error}</p>}

                {!loading && !error && (
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
            )}
            </div>
        </div>
    )
}