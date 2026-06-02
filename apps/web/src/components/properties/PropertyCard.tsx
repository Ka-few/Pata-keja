import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, Bath, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

interface PropertyCardProps {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    imageUrl: string;
    isVerified?: boolean;
}

export default function PropertyCard({
    id, title, price, location, bedrooms, bathrooms, imageUrl, isVerified
}: PropertyCardProps) {
    return (
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group rounded-2xl">
            <div className="relative h-64 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    {isVerified && (
                        <Badge className="bg-green-500/90 hover:bg-green-600 text-white border-none backdrop-blur-md">
                            Verified
                        </Badge>
                    )}
                    <Badge className="bg-white/90 text-gray-900 border-none backdrop-blur-md">
                        Rental
                    </Badge>
                </div>
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors">
                    <Star className="h-5 w-5" />
                </button>
            </div>

            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-900 transition-colors">
                        {title}
                    </h3>
                    <span className="text-xl font-black text-amber-600">
                        KES {price.toLocaleString()}
                    </span>
                </div>

                <div className="flex items-center text-gray-500 mb-4 h-5">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{location}</span>
                </div>

                <div className="flex items-center space-x-6 text-gray-600 border-t border-gray-50 pt-4">
                    <div className="flex items-center">
                        <Bed className="h-5 w-5 mr-2 text-blue-900/60" />
                        <span className="font-semibold">{bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center">
                        <Bath className="h-5 w-5 mr-2 text-blue-900/60" />
                        <span className="font-semibold">{bathrooms} Baths</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-5 pb-5 pt-0 gap-3">
                <Link href={`/properties/${id}`} className="flex-1">
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border-none shadow-none">
                        View Details
                    </Button>
                </Link>
                <Button className="bg-blue-900 hover:bg-blue-950 text-white shadow-lg shadow-blue-900/20">
                    Contact
                </Button>
            </CardFooter>
        </Card>
    );
}
