# Generate dummy data for serializer
_Exported on 11/14/2025 at 19:49:26 EST from Cursor (2.0.69)_

---

**User**

Create dummy data given the following serializer: @serializers.py 

---

**Cursor**

I'll create dummy data for the vault records. Let me first check the current state of the Vault.tsx file to understand the context.

I'll add dummy data that matches the serializer structure. This will be useful for development before connecting to the API.

```typescriptreact
/*
This creates the Vault page using React.

Note:
To start the Vite dev server, run: 'npm run dev' in the frontend/web directory.
*/

import { useState } from 'react';
import styles from './Page.module.css';
import loginLogo from '../assets/LoginLogo.jpeg';

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

export default function VaultPage() {
```

Done. Added 6 dummy vault records matching the serializer structure:
- All required fields included (id, title, username, password)
- Optional fields (email, url, notes) have a mix of populated and empty values
- Passwords use encrypted placeholder strings following the zero-knowledge approach
- Realistic timestamps for created_at/updated_at

