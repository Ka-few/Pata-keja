'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/useAuthStore';
import { api, Agent, Property } from '@/lib/api';
import {
    Users, Building2, ShieldCheck, Trash2, Ban, CheckCircle2,
    Loader2, BarChart3, Clock, XCircle, ChevronDown, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── Small helpers ──────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, string> = {
        ADMIN: 'bg-red-100 text-red-700',
        REALTOR: 'bg-blue-100 text-blue-700',
        REGISTERED: 'bg-gray-100 text-gray-600',
        GUEST: 'bg-gray-50 text-gray-400',
    };
    return <Badge className={`${map[role] || 'bg-gray-100 text-gray-500'} border-none text-xs font-semibold`}>{role}</Badge>;
}

const STATUS_OPTIONS = ['AVAILABLE', 'RENTED', 'HIDDEN'];
const VERIFY_OPTIONS = ['PENDING', 'VERIFIED', 'SUSPICIOUS'];
const ROLE_OPTIONS = ['GUEST', 'REGISTERED', 'REALTOR', 'ADMIN'];

// ── Admin page ─────────────────────────────────────────────────────────────

export default function AdminPage() {
    const router = useRouter();
    const { isAdmin } = useAuthStore();
    const [tab, setTab] = useState<'agents' | 'properties'>('agents');

    useEffect(() => {
        if (!isAdmin()) router.push('/');
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 pt-24 pb-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                    </div>
                    <p className="text-gray-400 text-sm">Manage agents and moderate property listings.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit mb-8">
                    {[
                        { key: 'agents', label: 'Agents', icon: <Users className="h-4 w-4" /> },
                        { key: 'properties', label: 'Properties', icon: <Building2 className="h-4 w-4" /> },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                                ${tab === t.key
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'agents' && <AgentsTab />}
                {tab === 'properties' && <PropertiesTab />}
            </div>
        </div>
    );
}

// ── Agents Tab ─────────────────────────────────────────────────────────────

function AgentsTab() {
    const [users, setUsers] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        api.users.listAll()
            .then(setUsers)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const refresh = () => {
        setLoading(true);
        api.users.listAll().then(setUsers).finally(() => setLoading(false));
    };

    const handleBan = async (agent: Agent) => {
        if (!confirm(`${agent.isVerified ? 'Ban' : 'Unban'} ${agent.email}?`)) return;
        setBusy(agent.id);
        try {
            agent.isVerified
                ? await api.agents.ban(agent.id)
                : await api.agents.unban(agent.id);
            refresh();
        } catch (e: any) { alert(e.message); }
        finally { setBusy(null); }
    };

    const handleRoleChange = async (agent: Agent, role: string) => {
        setBusy(agent.id);
        try {
            await api.agents.update(agent.id, { role: role as any });
            refresh();
        } catch (e: any) { alert(e.message); }
        finally { setBusy(null); }
    };

    const handleDelete = async (agent: Agent) => {
        if (!confirm(`Permanently delete ${agent.email} and all their listings?`)) return;
        setBusy(agent.id);
        try {
            await api.agents.delete(agent.id);
            setUsers(prev => prev.filter(u => u.id !== agent.id));
        } catch (e: any) { alert(e.message); }
        finally { setBusy(null); }
    };

    const total = users.length;
    const realtors = users.filter(u => u.role === 'REALTOR').length;
    const banned = users.filter(u => !u.isVerified).length;

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Users', value: total, icon: <Users className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
                    { label: 'Active Agents', value: realtors, icon: <CheckCircle2 className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
                    { label: 'Banned / Unverified', value: banned, icon: <Ban className="h-5 w-5 text-red-500" />, bg: 'bg-red-50' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-3`}>{stat.icon}</div>
                        <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                    <h2 className="font-bold text-gray-900">All Users</h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-left">Phone</th>
                                    <th className="px-6 py-3 text-left">Role</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Listings</th>
                                    <th className="px-6 py-3 text-left">Joined</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(agent => (
                                    <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {agent.email.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 truncate max-w-[180px]">{agent.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{agent.phoneNumber || '—'}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={agent.role}
                                                disabled={busy === agent.id}
                                                onChange={e => handleRoleChange(agent, e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 cursor-pointer"
                                            >
                                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            {agent.isVerified
                                                ? <Badge className="bg-green-100 text-green-700 border-none text-xs">Active</Badge>
                                                : <Badge className="bg-red-100 text-red-600 border-none text-xs">Banned</Badge>
                                            }
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">{agent._count.properties}</td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">{new Date(agent.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost" size="sm"
                                                    disabled={busy === agent.id}
                                                    onClick={() => handleBan(agent)}
                                                    className={`gap-1 text-xs h-8 ${agent.isVerified ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                                                >
                                                    {busy === agent.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
                                                    {agent.isVerified ? 'Ban' : 'Unban'}
                                                </Button>
                                                <Button
                                                    variant="ghost" size="sm"
                                                    disabled={busy === agent.id}
                                                    onClick={() => handleDelete(agent)}
                                                    className="gap-1 text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" /> Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Properties Tab ─────────────────────────────────────────────────────────

function PropertiesTab() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        api.properties.adminAll()
            .then(setProperties)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleStatus = async (id: string, status: string) => {
        setBusy(id);
        try {
            const updated = await api.properties.updateStatus(id, status);
            setProperties(prev => prev.map(p => p.id === id ? { ...p, status: updated.status } : p));
        } catch (e: any) { alert(e.message); }
        finally { setBusy(null); }
    };

    const handleVerify = async (id: string, verificationStatus: string) => {
        setBusy(id);
        try {
            const updated = await api.properties.updateVerification(id, verificationStatus);
            setProperties(prev => prev.map(p => p.id === id ? { ...p, verificationStatus: updated.verificationStatus } : p));
        } catch (e: any) { alert(e.message); }
        finally { setBusy(null); }
    };

    const handleDelete = async (property: Property) => {
        if (!confirm(`Delete "${property.title}"?`)) return;
        setBusy(property.id);
        try {
            await api.properties.delete(property.id);
            setProperties(prev => prev.filter(p => p.id !== property.id));
        } catch (e: any) { alert(e.message); }
        finally { setBusy(null); }
    };

    const pending = properties.filter(p => p.verificationStatus === 'PENDING').length;
    const suspicious = properties.filter(p => p.verificationStatus === 'SUSPICIOUS').length;

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Properties', value: properties.length, icon: <Building2 className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
                    { label: 'Pending Review', value: pending, icon: <Clock className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-50' },
                    { label: 'Suspicious', value: suspicious, icon: <AlertTriangle className="h-5 w-5 text-red-500" />, bg: 'bg-red-50' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-3`}>{stat.icon}</div>
                        <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                    <h2 className="font-bold text-gray-900">All Listings</h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">Property</th>
                                    <th className="px-6 py-3 text-left">Agent</th>
                                    <th className="px-6 py-3 text-left">Price</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Verification</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {properties.map(property => (
                                    <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {property.media[0]?.url
                                                    ? <img src={property.media[0].url} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                                                    : <div className="w-12 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center"><Building2 className="h-4 w-4 text-gray-300" /></div>
                                                }
                                                <div>
                                                    <p className="font-semibold text-gray-900 line-clamp-1">{property.title}</p>
                                                    <p className="text-xs text-gray-400">{property.estate}, {property.town}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[140px]">
                                            {property.landlord?.email || '—'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-amber-600">
                                            KES {Number(property.price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={property.status}
                                                disabled={busy === property.id}
                                                onChange={e => handleStatus(property.id, e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 cursor-pointer"
                                            >
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={property.verificationStatus}
                                                disabled={busy === property.id}
                                                onChange={e => handleVerify(property.id, e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 cursor-pointer"
                                            >
                                                {VERIFY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="ghost" size="sm"
                                                    disabled={busy === property.id}
                                                    onClick={() => handleDelete(property)}
                                                    className="gap-1 text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    {busy === property.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
