import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin } from 'lucide-react';

export default function HeroSection() {
    return (
        <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2670"
                    alt="Nakuru Apartment"
                    className="w-full h-full object-cover brightness-[0.4]"
                />
            </div>

            <div className="relative z-10 max-w-5xl w-full px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Find Your Perfect <br /><span className="text-amber-400">Nakuru Home</span>
                </h1>
                <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
                    Discover apartments, studios and bedsitters across the best estates in Nakuru.
                </p>

                <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* Estate */}
                        <div className="flex flex-col text-left">
                            <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 italic">Estate</label>
                            <Select>
                                <SelectTrigger className="bg-white/90 border-none h-12">
                                    <SelectValue placeholder="All Estates" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="naka">Naka</SelectItem>
                                    <SelectItem value="kiamunyi">Kiamunyi</SelectItem>
                                    <SelectItem value="whitehouse">Whitehouse</SelectItem>
                                    <SelectItem value="upperhill">Upperhill</SelectItem>
                                    <SelectItem value="bismark">Bismark</SelectItem>
                                    <SelectItem value="kiti">KITI</SelectItem>
                                    <SelectItem value="heshima">Heshima</SelectItem>
                                    <SelectItem value="sita">Sita</SelectItem>
                                    <SelectItem value="lanet">Lanet</SelectItem>
                                    <SelectItem value="pipeline">Pipeline</SelectItem>
                                    <SelectItem value="barnabas">Barnabas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Town — fixed to Nakuru */}
                        <div className="flex flex-col text-left">
                            <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 italic">Town</label>
                            <div className="bg-white/90 border-none h-12 rounded-md flex items-center px-3 gap-2 text-gray-700">
                                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                                <span className="font-semibold">Nakuru</span>
                            </div>
                        </div>

                        {/* Property Type */}
                        <div className="flex flex-col text-left">
                            <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 italic">Property Type</label>
                            <Select>
                                <SelectTrigger className="bg-white/90 border-none h-12">
                                    <SelectValue placeholder="Any Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bedsitter">Bedsitter</SelectItem>
                                    <SelectItem value="studio">Studio</SelectItem>
                                    <SelectItem value="1bedroom">1 Bedroom</SelectItem>
                                    <SelectItem value="2bedroom">2 Bedroom</SelectItem>
                                    <SelectItem value="3bedroom">3 Bedroom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="h-12 mt-auto bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all transform hover:scale-105">
                            <Search className="mr-2 h-5 w-5" />
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
