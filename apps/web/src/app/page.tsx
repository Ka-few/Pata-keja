import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import PropertyGrid from '@/components/properties/PropertyGrid';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-blue-950 mb-2 underline decoration-amber-500 decoration-4 underline-offset-8">
              Featured Luxury Properties
            </h2>
            <p className="text-gray-500 mt-4">Hand-picked listings across Naka, Kiamunyi, Whitehouse, Upperhill, Bismark, and more in Nakuru.</p>
          </div>
          <button className="text-blue-900 font-bold hover:text-amber-600 transition-colors flex items-center">
            View All Listings
            <span className="ml-2">→</span>
          </button>
        </div>

        <PropertyGrid />
      </div>

      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} PataNyumba. All rights reserved. Built for the Kenyan market.
        </div>
      </footer>
    </main>
  );
}
