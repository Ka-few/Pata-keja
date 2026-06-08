/**
 * Centralised API client — injects the auth token from Zustand automatically.
 * Import individual helpers instead of calling fetch() directly.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data as T;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Agent {
    id: string;
    email: string;
    phoneNumber?: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    _count: { properties: number };
}

export interface PropertyMedia {
    id: string;
    url: string;
    isThumbnail: boolean;
}

export interface Property {
    id: string;
    title: string;
    description: string;
    price: string | number;
    deposit: string | number;
    bedrooms: number;
    bathrooms: number;
    type: string;
    furnished: boolean;
    estate: string;
    town: string;
    county: string;
    status: string;
    verificationStatus: string;
    landlordId: string;
    landlord?: { id: string; email: string; phoneNumber?: string };
    media: PropertyMedia[];
    createdAt: string;
}

export interface AgentProfile extends Agent {
    properties: Property[];
}

// ── Agents ─────────────────────────────────────────────────────────────────

export const api = {
    agents: {
        list: () => request<Agent[]>('/users/agents'),
        get: (id: string) => request<AgentProfile>(`/users/agents/${id}`),
        update: (id: string, data: Partial<Agent>) =>
            request<Agent>(`/users/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        ban: (id: string) =>
            request<Agent>(`/users/agents/${id}/ban`, { method: 'PATCH' }),
        unban: (id: string) =>
            request<Agent>(`/users/agents/${id}/unban`, { method: 'PATCH' }),
        delete: (id: string) =>
            request<{ success: boolean }>(`/users/agents/${id}`, { method: 'DELETE' }),
    },
    users: {
        listAll: () => request<Agent[]>('/users'),
        me: () => request<Agent>('/users/me'),
        updateMe: (data: { phoneNumber?: string }) =>
            request<Agent>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
        myProperties: () => request<Property[]>('/users/me/properties'),
    },
    properties: {
        list: (q?: Record<string, string>) => {
            const qs = q ? '?' + new URLSearchParams(q).toString() : '';
            return request<Property[]>(`/properties${qs}`);
        },
        get: (id: string) => request<Property>(`/properties/${id}`),
        adminAll: () => request<Property[]>('/properties/admin/all'),
        update: (id: string, data: Partial<Property>) =>
            request<Property>(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        updateStatus: (id: string, status: string) =>
            request<Property>(`/properties/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
        updateVerification: (id: string, verificationStatus: string) =>
            request<Property>(`/properties/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ verificationStatus }) }),
        delete: (id: string) =>
            request<unknown>(`/properties/${id}`, { method: 'DELETE' }),
    },
    payments: {
        checkUnlock: (propertyId: string) =>
            request<{ unlocked: boolean; contact?: { phone?: string; email?: string } }>(
                `/payments/unlock/${propertyId}/status`
            ),
        unlock: (propertyId: string, phone: string) =>
            request<{ status: string; contact?: { phone?: string; email?: string } }>(
                `/payments/unlock/${propertyId}`,
                { method: 'POST', body: JSON.stringify({ phone }) }
            ),
    },
};
