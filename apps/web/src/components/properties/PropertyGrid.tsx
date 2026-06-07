'use client';

import PropertyCard from './PropertyCard';
import { usePropertyStore } from '@/store/usePropertyStore';

export default function PropertyGrid() {
    const properties = usePropertyStore((state) => state.properties);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
                <PropertyCard key={property.id} {...property} />
            ))}
        </div>
    );
}
