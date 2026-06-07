import { create } from 'zustand';

export interface Property {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    imageUrl: string;
    isVerified?: boolean;
}

const SAMPLE_PROPERTIES: Property[] = [
    {
        id: '1',
        title: '5 Bedroom Villa in Karen',
        price: 250000,
        location: 'Karen, Nairobi',
        bedrooms: 5,
        bathrooms: 5,
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2675',
        isVerified: true,
    },
    {
        id: '2',
        title: 'Modern Studio in Kilimani',
        price: 45000,
        location: 'Kilimani, Nairobi',
        bedrooms: 1,
        bathrooms: 1,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2670',
        isVerified: true,
    },
    {
        id: '3',
        title: 'Luxury 3BR Apartment in Nyali',
        price: 120000,
        location: 'Nyali, Mombasa',
        bedrooms: 3,
        bathrooms: 3,
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2670',
        isVerified: false,
    },
];

interface PropertyStore {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
    properties: SAMPLE_PROPERTIES,
    addProperty: (property) => set((state) => ({
        properties: [
            { ...property, id: Math.random().toString(36).substr(2, 9) },
            ...state.properties,
        ],
    })),
}));
