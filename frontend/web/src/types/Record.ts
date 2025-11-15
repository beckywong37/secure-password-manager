export interface Record {
    id: number;
    title: string;
    username: string;
    password: string;
    email?: string;     // optional and may be blank
    url?: string;       // optional and may be blank
    notes?: string;     // optional and may be blank
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}