// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md 
// ../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md

import { useState, type FC } from 'react';
import type { Record } from '../types/Record';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Input, Textarea } from './Input';
import { Button } from './Button';
import { Spacer } from './Spacer';
import styles from './RecordDetails.module.css';

interface CopyButtonProps {
    text: string;
    field: string;
    isCopied: boolean;
    onCopy: (text: string, field: string) => void;
}

const CopyButton: FC<CopyButtonProps> = ({ text, field, isCopied, onCopy }) => (
    <button
        type="button"
        className={styles.copyButton}
        onClick={() => onCopy(text, field)}
        aria-label={`Copy ${field}`}
    >
        <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
    </button>
);

interface PasswordToggleButtonProps {
    showPassword: boolean;
    onToggle: () => void;
}

const PasswordToggleButton: FC<PasswordToggleButtonProps> = ({ showPassword, onToggle }) => (
    <button
        type="button"
        className={styles.copyButton}
        onClick={onToggle}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
    </button>
);

export const RecordDetails:FC<{record: Record, onClose: () => void, onDelete: (record: Record) => void}> = ({record, onClose, onDelete}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleCopy = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={styles.recordDetails}>
            <div className={styles.header}>
                <h3>{record.title}</h3>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    ×
                </button>
            </div>
            <Input
                label="Username"
                type="text"
                value={record.username}
                readOnly
                rightAdornment={
                    <CopyButton 
                        text={record.username} 
                        field="username" 
                        isCopied={copiedField === "username"}
                        onCopy={handleCopy}
                    />
                }
            />
            <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={record.password}
                readOnly
                rightAdornment={
                    <CopyButton 
                        text={record.password} 
                        field="password" 
                        isCopied={copiedField === "password"}
                        onCopy={handleCopy}
                    />
                }
                secondaryRightAdornment={
                    <PasswordToggleButton 
                        showPassword={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                    />
                }
            />
            {record.email && (
                <Input
                    label="Email"
                    type="email"
                    value={record.email}
                    readOnly
                    rightAdornment={
                        <CopyButton 
                            text={record.email} 
                            field="email" 
                            isCopied={copiedField === "email"}
                            onCopy={handleCopy}
                        />
                    }
                />
            )}
            {record.url && (
                <Input
                    label="URL"
                    type="url"
                    value={record.url}
                    readOnly
                    rightAdornment={
                        <CopyButton 
                            text={record.url} 
                            field="url" 
                            isCopied={copiedField === "url"}
                            onCopy={handleCopy}
                        />
                    }
                />
            )}
            {record.notes && (
                <Textarea
                    label="Notes"
                    value={record.notes}
                    readOnly
                />
            )}
            <div className={styles.metadata}>
                <p><strong>Created:</strong> {new Date(record.created_at).toLocaleDateString()}</p>
                <p><strong>Updated:</strong> {new Date(record.updated_at).toLocaleDateString()}</p>
            </div>
            <Spacer marginTop="md">
                <Button 
                    variant="danger"
                    fluid
                    onClick={() => onDelete(record)}
                >
                    Delete Record
                </Button>
            </Spacer>
        </div>
    )
}