import { useState, type FC, type FormEvent } from "react";
import type { Record } from "../types/Record";
import {Button} from "./Button";
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

    return(
        <form className={styles.recordForm} onSubmit={handleSubmit}>
            <label>
                Title:
                <input type="text" value={formState.title} required onChange={(e) => setFormState({...formState, title: e.target.value})} />
            </label>
            <label>
                Username:
                <input type="text" value={formState.username} required onChange={(e) => setFormState({...formState, username: e.target.value})} />
            </label>
            <label>
                Password:
                <input type="password" value={formState.password} required onChange={(e) => setFormState({...formState, password: e.target.value})} />
            </label>
            <label>
                Email:
                <input type="email" value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} />
            </label>
            <label>
                URL:
                <input type="url" value={formState.url} onChange={(e) => setFormState({...formState, url: e.target.value})} />
            </label>
            <label>
                Notes:
                <textarea value={formState.notes} onChange={(e) => setFormState({...formState, notes: e.target.value})} />
            </label>
            <div className={styles.buttonGroup}>
                <Button type="submit" variant="primary">Submit</Button>
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    )


}