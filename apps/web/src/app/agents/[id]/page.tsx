'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { api, AgentProfile, Property } from '@/lib/api';
import { Building2, Phone, Mail, MapPin, Bed, Bath, Loader2, ArrowLeft, CheckCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AgentProfilePage() {
    const params = useParams();
    const id = params?.id as string;
    const [agent, setAgent] = useState<AgentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        api.agents.get(id)
            .then(setAgent)
            .catch(() => setError('Agent not found'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Navbar />
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
        </div>
    );

    if (error || !agent) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-32 text-center">
                <p className="text-gray-500 text-lg">{error || 'Agent not found'}</p>
                <Link href="/agents"><Button variant="outline" className="mt-4">← Back to Agents</Button></Link>
            </div>
        </div>
    );

    const initials = agent.email.slice(0, 2).toUpperCase();
    const memberSince = new Date(agent.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Profile Header */}
            <div className="bg-gradient-to-br from-blue-950 to-blue-800 pt-24 pb-32 px-4">
                <div className="max-w-5xl mx-auto">
                    <Link href="/agents" className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Agents
                    </Link>
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                            {initials}
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                                <h1 className="text-3xl font-bold text-white">{agent.email.split('@')[0]}</h1>
                                {agent.isVerified && (
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-blue-200">
                                <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{agent.email}</span>
                                {agent.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{agent.phoneNumber}</span>}
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Member since {memberSince}</span>
                            </div>
                        </div>
                        <div className="md:ml-auto text-center">
                            <div className="text-4xl font-black text-white">{agent._count.properties}</div>
                            <div className="text-blue-300 text-sm">Total Listings</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings */}
            <div className="max-w-5xl mx-auto px-4 -mt-16 pb-20">
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Available Properties</h2>
                    <p className="text-sm text-gray-500">{agent.properties.length} active listing{agent.properties.length !== 1 ? 's' : ''}</p>
                </div>

                {agent.properties.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <Building2 className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400">No active listings from this agent.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agent.properties.map(property => (
                            <AgentPropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function AgentPropertyCard({ property }: { property: Property }) {
    const thumb = property.media[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';
    return (
        <Link href={`/properties/${property.id}`}>
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <div className="relative h-44 overflow-hidden">
                    <img src={thumb} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-gray-800 border-none text-xs font-semibold">{property.type}</Badge>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-900 transition-colors">{property.title}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                        <MapPin className="h-3 w-3" />{property.estate}, {property.town}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-black text-amber-600">KES {Number(property.price).toLocaleString()}</span>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.bedrooms}</span>
                            <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
