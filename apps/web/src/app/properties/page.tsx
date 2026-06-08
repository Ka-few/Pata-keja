'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import PropertyCard from '@/components/properties/PropertyCard';
import { api, Property } from '@/lib/api';
import { Loader2, Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [filtered, setFiltered] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Fetch all properties (API handles only returning AVAILABLE ones by default for public)
        api.properties.list()
            .then(data => {
                setProperties(data);
                setFiltered(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(properties.filter(p => 
            p.title.toLowerCase().includes(q) || 
            p.estate.toLowerCase().includes(q) ||
            p.town.toLowerCase().includes(q)
        ));
    }, [search, properties]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 pt-28 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Browse <span className="text-amber-400">Listings</span>
                    </h1>
                    <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
                        Find your next home from our wide selection of properties.
                    </p>
                    
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search by location, estate, or property title..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-12 h-14 bg-white border-none shadow-xl rounded-xl text-gray-900 text-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
                        <span>Loading properties...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <MapPin className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No properties found{search ? ` matching "${search}"` : ''}.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 text-sm mb-6">
                            Showing <strong className="text-gray-900">{filtered.length}</strong> available propert{filtered.length !== 1 ? 'ies' : 'y'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map(property => (
                                <PropertyCard 
                                    key={property.id} 
                                    id={property.id}
                                    title={property.title}
                                    price={Number(property.price)}
                                    location={`${property.estate}, ${property.town}`}
                                    bedrooms={property.bedrooms}
                                    bathrooms={property.bathrooms}
                                    imageUrl={property.media?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2675'}
                                    isVerified={property.verificationStatus === 'VERIFIED'}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
