'use client';

import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import { api, Property } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function PropertyGrid() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch only verified and available properties for the featured section
        api.properties.list({ verificationStatus: 'VERIFIED' })
            .then(data => {
                // Limit to 6 for the featured grid
                setProperties(data.slice(0, 6));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20 text-blue-900">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p>No featured properties available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
                <PropertyCard 
                    key={property.id} 
                    id={property.id}
                    title={property.title}
                    price={Number(property.price)}
                    location={`${property.estate}, Nakuru`}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    imageUrl={property.media?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2675'}
                    isVerified={property.verificationStatus === 'VERIFIED'}
                />
            ))}
        </div>
    );
}
