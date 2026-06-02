import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function HeroSection() {
    return (
        <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2670"
                    alt="Luxury Kenyan Home"
                    className="w-full h-full object-cover brightness-[0.4]"
                />
            </div>

            <div className="relative z-10 max-w-5xl w-full px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Find Your Premium <br /><span className="text-gold-500">Kenyan Home</span>
                </h1>
                <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
                    Discover exclusive properties for sale and rent across Kenya with PataNyumba.
                </p>

                <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col text-left">
                            <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 italic">County</label>
                            <Select>
                                <SelectTrigger className="bg-white/90 border-none h-12">
                                    <SelectValue placeholder="Nairobi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nairobi">Nairobi</SelectItem>
                                    <SelectItem value="mombasa">Mombasa</SelectItem>
                                    <SelectItem value="kisumu">Kisumu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col text-left">
                            <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 italic">Town</label>
                            <Input type="text" placeholder="Kilimani" className="bg-white/90 border-none h-12" />
                        </div>

                        <div className="flex flex-col text-left">
                            <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 italic">Property Type</label>
                            <Select>
                                <SelectTrigger className="bg-white/90 border-none h-12">
                                    <SelectValue placeholder="Apartment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="apartment">Apartment</SelectItem>
                                    <SelectItem value="house">House</SelectItem>
                                    <SelectItem value="studio">Studio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="h-12 mt-auto bg-gold-600 hover:bg-gold-700 text-white font-bold transition-all transform hover:scale-105">
                            <Search className="mr-2 h-5 w-5" />
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
