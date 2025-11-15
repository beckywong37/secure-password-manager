import { useState, type FC, type FormEvent } from "react";
import type { Record } from "../types/Record";
import {Button} from "./Button";
import {Input, Textarea} from "./Input";
import styles from "./RecordForm.module.css";

export const RecordForm:FC<{record: Record | null, onSubmit: (record: Record) => void, onCancel: () => void}> = ({record, onSubmit, onCancel}) => {

    const [formState, setFormState] = useState<Pick<Record, 'title' | 'username' | 'password' | 'email' | 'url' | 'notes'>>({
        title: record?.title ?? '',
        username: record?.username ?? '',
        password: record?.password ?? '',
        email: record?.email ?? '',
        url: record?.url ?? '',
        notes: record?.notes ?? '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({
            ...formState,
            id: record?.id ?? 0,
            created_at: record?.created_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    }

    const isNewRecord = record === null;

    const formContent = (
        <form className={styles.recordForm} onSubmit={handleSubmit}>
            <h3>{isNewRecord ? 'Add New Record' : 'Edit Record'}</h3>
            <Input
                label="Title:"
                type="text"
                value={formState.title}
                required
                onChange={(e) => setFormState({...formState, title: e.target.value})}
            />
            <Input
                label="Username:"
                type="text"
                value={formState.username}
                required
                onChange={(e) => setFormState({...formState, username: e.target.value})}
            />
            <Input
                label="Password:"
                type="password"
                value={formState.password}
                required
                onChange={(e) => setFormState({...formState, password: e.target.value})}
            />
            <Input
                label="Email:"
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({...formState, email: e.target.value})}
                helperText="Optional - Associated email address"
            />
            <Input
                label="URL:"
                type="url"
                value={formState.url}
                onChange={(e) => setFormState({...formState, url: e.target.value})}
                helperText="Optional - Website URL"
            />
            <Textarea
                label="Notes:"
                value={formState.notes}
                onChange={(e) => setFormState({...formState, notes: e.target.value})}
                helperText="Optional - Additional information"
            />
            <div className={styles.buttonGroup}>
                <Button type="submit" variant="primary">{isNewRecord ? 'Add' : 'Save'}</Button>
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );

    if (isNewRecord) {
        return (
            <div className={styles.dialogOverlay} onClick={onCancel}>
                <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
                    {formContent}
                </div>
            </div>
        );
    }

    return formContent;
}