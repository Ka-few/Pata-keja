'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/useAuthStore';
import { api, Property } from '@/lib/api';
import {
    Building2, Plus, Trash2, Eye, Pencil, MapPin, Bed, Bath,
    CheckCircle2, Clock, XCircle, Loader2, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        AVAILABLE: 'bg-green-100 text-green-700',
        RENTED: 'bg-blue-100 text-blue-700',
        HIDDEN: 'bg-gray-100 text-gray-500',
    };
    return <Badge className={`${map[status] || 'bg-gray-100 text-gray-500'} border-none text-xs font-semibold`}>{status}</Badge>;
}

function VerifyBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; icon: React.ReactNode }> = {
        VERIFIED: { cls: 'text-green-600', icon: <CheckCircle2 className="h-4 w-4" /> },
        PENDING: { cls: 'text-amber-500', icon: <Clock className="h-4 w-4" /> },
        SUSPICIOUS: { cls: 'text-red-500', icon: <XCircle className="h-4 w-4" /> },
    };
    const { cls, icon } = map[status] || map.PENDING;
    return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cls}`}>{icon}{status}</span>;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, token, isRealtorOrAdmin } = useAuthStore();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!isRealtorOrAdmin()) { router.push('/login'); return; }
        api.users.myProperties()
            .then(setProperties)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this listing permanently?')) return;
        setDeleting(id);
        try {
            await api.properties.delete(id);
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (e: any) {
            alert(e.message || 'Failed to delete');
        } finally {
            setDeleting(null);
        }
    };

    const available = properties.filter(p => p.status === 'AVAILABLE').length;
    const rented = properties.filter(p => p.status === 'RENTED').length;
    const pending = properties.filter(p => p.verificationStatus === 'PENDING').length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                        <p className="text-gray-500 mt-1 text-sm">{user?.email}</p>
                    </div>
                    <Link href="/list-property">
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2 shadow-lg shadow-amber-500/20">
                            <Plus className="h-5 w-5" /> Add New Listing
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Total Listings', value: properties.length, icon: <Building2 className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
                        { label: 'Available', value: available, icon: <CheckCircle2 className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
                        { label: 'Rented Out', value: rented, icon: <BarChart3 className="h-5 w-5 text-indigo-600" />, bg: 'bg-indigo-50' },
                        { label: 'Pending Review', value: pending, icon: <Clock className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-50' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-3`}>{stat.icon}</div>
                            <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Listings table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 text-lg">My Listings</h2>
                        <span className="text-sm text-gray-400">{properties.length} total</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                            <Loader2 className="h-6 w-6 animate-spin" />Loading…
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-20">
                            <Building2 className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 mb-4">You haven't listed any properties yet.</p>
                            <Link href="/list-property">
                                <Button className="bg-amber-500 hover:bg-amber-600 text-white">List Your First Property</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Property</th>
                                        <th className="px-6 py-3 text-left">Location</th>
                                        <th className="px-6 py-3 text-left">Price</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-left">Verification</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {properties.map(property => {
                                        const thumb = property.media[0]?.url;
                                        return (
                                            <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                            {thumb
                                                                ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                                                : <Building2 className="h-5 w-5 text-gray-300 m-auto mt-2.5" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 line-clamp-1">{property.title}</p>
                                                            <p className="text-xs text-gray-400">{property.type} · {property.bedrooms}BR</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{property.estate}</span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-amber-600">
                                                    KES {Number(property.price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4"><StatusBadge status={property.status} /></td>
                                                <td className="px-6 py-4"><VerifyBadge status={property.verificationStatus} /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/properties/${property.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-900">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/dashboard/edit/${property.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-500">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                            onClick={() => handleDelete(property.id)}
                                                            disabled={deleting === property.id}
                                                        >
                                                            {deleting === property.id
                                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                                : <Trash2 className="h-4 w-4" />
                                                            }
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
