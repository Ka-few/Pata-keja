import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, MapPin, Share2, Heart, Phone, Lock } from 'lucide-react';

export default function PropertyDetail() {
    // Sample data - in a real app, this would be fetched from the API
    const property = {
        title: 'The Azura Apartment',
        location: 'Kilimani, Nairobi',
        price: 115000,
        bedrooms: 3,
        bathrooms: 3,
        area: '185 sq m',
        description: 'Luxury Living in Kilimani in the the Azura Apartment, Nairobi, more apartment to quality premios. Modern finishes, and prodento as nimimas and wiring generator property, imimited, tinan and deivers, such as being deparirenn, chania, sltandaro coating connols and ti-protestins, precim, and conociocure purxurq questions, heed to calmnote their grandrora and escorte smitoring and property owner are features.',
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                {/* Breadcrumbs Placeholder */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <span>Properties</span>
                    <span className="mx-2">/</span>
                    <span>Nairobi</span>
                    <span className="mx-2">/</span>
                    <span className="text-blue-900 font-medium">{property.title}</span>
                </div>

                {/* Media Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 rounded-3xl overflow-hidden h-[500px]">
                    <div className="md:col-span-2 h-full">
                        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2670" alt="Main" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-1 grid grid-rows-2 gap-4 h-full">
                        <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2670" alt="Room 1" className="w-full h-full object-cover" />
                        <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2670" alt="Room 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-1 h-full">
                        <img src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&q=80&w=2670" alt="View" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-4xl font-black text-blue-950 mb-2">{property.title}</h1>
                                    <div className="flex items-center text-gray-500">
                                        <MapPin className="h-5 w-5 mr-1" />
                                        <span>{property.location}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-gray-400">
                                    <button className="p-2 hover:bg-white hover:text-blue-900 rounded-full transition-colors border border-gray-100 shadow-sm"><Share2 className="h-5 w-5" /></button>
                                    <button className="p-2 hover:bg-white hover:text-red-500 rounded-full transition-colors border border-gray-100 shadow-sm"><Heart className="h-5 w-5" /></button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-4 py-1 font-bold">Featured Premium</Badge>
                                <span className="text-3xl font-black text-blue-900">KES {property.price.toLocaleString()} / month</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-900 rounded-xl"><Bed className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Bedrooms</span>
                                        <span className="font-bold">{property.bedrooms}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-900 rounded-xl"><Bath className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Bathrooms</span>
                                        <span className="font-bold">{property.bathrooms}</span>
                                    </div>
                                </div>
                                {/* Area and type details placeholder */}
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-blue-950 mb-4 pb-2 border-b-4 border-amber-500 inline-block">Property Description</h3>
                                <p className="text-gray-600 leading-relaxed text-lg italic">
                                    {property.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / CTA */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-blue-900/10 border border-blue-50 sticky top-24">
                            <h4 className="text-xl font-bold text-gray-800 mb-6">Interested in this property?</h4>

                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-4 bg-white rounded-full shadow-md mb-4">
                                            <Lock className="h-8 w-8 text-amber-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 mb-6">
                                            Landlord contact details are hidden for security and lead quality. Unlock them to schedule a viewing.
                                        </p>
                                        <Button className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-3 group">
                                            <Phone className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                            Unlock Contact Details
                                        </Button>
                                        <div className="mt-4 flex items-center gap-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" className="h-5 grayscale opacity-50" alt="M-PESA" />
                                            <span className="text-xs text-gray-400">Secure Payment via M-PESA</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                                    By clicking unlock, you agree to pay KES 50 fee.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
