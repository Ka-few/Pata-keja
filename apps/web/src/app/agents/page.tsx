'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { api, Agent } from '@/lib/api';
import { Building2, Phone, Mail, Users, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filtered, setFiltered] = useState<Agent[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.agents.list()
            .then(data => { setAgents(data); setFiltered(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(agents.filter(a =>
            a.email.toLowerCase().includes(q) ||
            (a.phoneNumber || '').includes(q)
        ));
    }, [search, agents]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 pt-28 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Users className="h-4 w-4 text-amber-400" />
                        Verified Nakuru Property Agents
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Find a Trusted <span className="text-amber-400">Agent</span>
                    </h1>
                    <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
                        Browse licensed agents who list verified properties across Nakuru's top estates.
                    </p>
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search by email or phone…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-12 bg-white border-none shadow-xl rounded-xl text-gray-900"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading agents…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No agents found{search ? ` matching "${search}"` : ''}.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 text-sm mb-8">
                            Showing <strong className="text-gray-900">{filtered.length}</strong> agent{filtered.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(agent => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function AgentCard({ agent }: { agent: Agent }) {
    const initials = agent.email.slice(0, 2).toUpperCase();
    const listingCount = agent._count.properties;

    return (
        <Link href={`/agents/${agent.id}`}>
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/20 shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
                            {agent.email.split('@')[0]}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {agent.isVerified ? (
                                <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-semibold">Verified</Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-500 border-none text-[10px]">Unverified</Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 text-sm text-gray-500 mb-5">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-300 shrink-0" />
                        <span className="truncate">{agent.email}</span>
                    </div>
                    {agent.phoneNumber && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-300 shrink-0" />
                            <span>{agent.phoneNumber}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Building2 className="h-4 w-4 text-amber-500" />
                        {listingCount} listing{listingCount !== 1 ? 's' : ''}
                    </div>
                    <span className="text-xs text-blue-700 font-semibold group-hover:underline">View Profile →</span>
                </div>
            </div>
        </Link>
    );
}
