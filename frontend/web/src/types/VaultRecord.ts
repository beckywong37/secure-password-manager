// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md

export interface VaultRecord {
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