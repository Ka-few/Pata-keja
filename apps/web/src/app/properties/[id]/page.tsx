'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bed, Bath, MapPin, Share2, Heart, Loader2, Lock, Phone, Unlock,
    CheckCircle2, ChevronLeft, ChevronRight, X, Images
} from 'lucide-react';
import { api, Property } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function PropertyDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { token } = useAuthStore();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [unlockStatus, setUnlockStatus] = useState<{
        unlocked: boolean;
        contact?: { phone?: string; email?: string };
    } | null>(null);
    const [checkingUnlock, setCheckingUnlock] = useState(false);

    // ── Lightbox state ──────────────────────────────────────────────
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        api.properties.get(id)
            .then(setProperty)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!token) return;
        setCheckingUnlock(true);
        api.payments.checkUnlock(id)
            .then(setUnlockStatus)
            .catch(() => setUnlockStatus(null))
            .finally(() => setCheckingUnlock(false));
    }, [id, token]);

    const photos = property?.media?.length
        ? property.media.map(m => m.url)
        : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2670'];

    // Keyboard navigation for lightbox
    const handleKey = useCallback((e: KeyboardEvent) => {
        if (lightboxIndex === null) return;
        if (e.key === 'ArrowRight') setLightboxIndex(i => (i! + 1) % photos.length);
        if (e.key === 'ArrowLeft')  setLightboxIndex(i => (i! - 1 + photos.length) % photos.length);
        if (e.key === 'Escape')     setLightboxIndex(null);
    }, [lightboxIndex, photos.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightboxIndex]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center text-blue-900 mt-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </main>
        );
    }

    if (!property) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center text-gray-500 mt-20">
                    Property not found.
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Lightbox Overlay ──────────────────────────────────────── */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                        {lightboxIndex + 1} / {photos.length}
                    </div>

                    {/* Prev arrow */}
                    {photos.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i! - 1 + photos.length) % photos.length); }}
                            className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110 active:scale-95"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft className="h-7 w-7" />
                        </button>
                    )}

                    {/* Image */}
                    <img
                        key={lightboxIndex}
                        src={photos[lightboxIndex]}
                        alt={`Photo ${lightboxIndex + 1}`}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl select-none animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    />

                    {/* Next arrow */}
                    {photos.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i! + 1) % photos.length); }}
                            className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110 active:scale-95"
                            aria-label="Next photo"
                        >
                            <ChevronRight className="h-7 w-7" />
                        </button>
                    )}

                    {/* Thumbnail strip */}
                    {photos.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 pb-1">
                            {photos.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                                    className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                                        i === lightboxIndex ? 'border-amber-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Keyboard hint */}
                    {photos.length > 1 && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs flex items-center gap-1.5">
                            <span>← →</span> arrow keys to navigate • <span>Esc</span> to close
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/properties" className="hover:text-blue-900 transition-colors">Properties</Link>
                    <span className="mx-2">/</span>
                    <span>{property.county}</span>
                    <span className="mx-2">/</span>
                    <span className="text-blue-900 font-medium">{property.title}</span>
                </div>

                {/* ── Media Gallery Grid (clickable) ───────────────────── */}
                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 rounded-3xl overflow-hidden h-[500px]">
                    {/* Main photo */}
                    <div
                        className="md:col-span-2 h-full bg-gray-100 cursor-zoom-in relative group"
                        onClick={() => setLightboxIndex(0)}
                    >
                        <img src={photos[0]} alt="Main" className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/40 rounded-full p-3 backdrop-blur-sm">
                                <Images className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Side thumbnails */}
                    {photos.length > 1 ? (
                        <div className="md:col-span-1 grid grid-rows-2 gap-4 h-full">
                            <div
                                className="w-full h-full bg-gray-100 cursor-zoom-in relative group"
                                onClick={() => setLightboxIndex(1 % photos.length)}
                            >
                                <img src={photos[1 % photos.length]} alt="Room 1" className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm">
                                        <Images className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div
                                className="w-full h-full bg-gray-100 cursor-zoom-in relative group"
                                onClick={() => setLightboxIndex(2 % photos.length)}
                            >
                                <img src={photos[2 % photos.length] || photos[1 % photos.length]} alt="Room 2" className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm">
                                        <Images className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="md:col-span-1 grid grid-rows-2 gap-4 h-full">
                            <div className="w-full h-full bg-gray-200"></div>
                            <div className="w-full h-full bg-gray-200"></div>
                        </div>
                    )}

                    {photos.length > 2 ? (
                        <div
                            className="md:col-span-1 h-full bg-gray-100 cursor-zoom-in relative group"
                            onClick={() => setLightboxIndex(3 % photos.length)}
                        >
                            <img src={photos[3 % photos.length] || photos[0]} alt="View" className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300" />
                            {/* "View all" badge on last visible cell */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 rounded-xl px-3 py-2 text-white font-semibold text-sm backdrop-blur-sm flex items-center gap-2">
                                    <Images className="h-4 w-4" />
                                    {photos.length > 4 ? `+${photos.length - 4} more` : 'View all'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="md:col-span-1 h-full bg-gray-200"></div>
                    )}

                    {/* "View all photos" pill */}
                    {photos.length > 1 && (
                        <button
                            onClick={() => setLightboxIndex(0)}
                            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 font-semibold text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Images className="h-4 w-4" />
                            View all {photos.length} photos
                        </button>
                    )}
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-4xl font-black text-blue-950 mb-2">{property.title}</h1>
                                <div className="flex items-center text-gray-500">
                                    <MapPin className="h-5 w-5 mr-1" />
                                    <span>{property.estate}, {property.town}</span>
                                </div>
                            </div>
                            <div className="flex gap-4 text-gray-400">
                                <button className="p-2 hover:bg-white hover:text-blue-900 rounded-full transition-colors border border-gray-100 shadow-sm">
                                    <Share2 className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-white hover:text-red-500 rounded-full transition-colors border border-gray-100 shadow-sm">
                                    <Heart className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            {property.verificationStatus === 'VERIFIED' && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-4 py-1 font-bold">
                                    Featured Premium
                                </Badge>
                            )}
                            <span className="text-3xl font-black text-blue-900">
                                KES {Number(property.price).toLocaleString()} / month
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                                    <Bed className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Bedrooms</span>
                                    <span className="font-bold">{property.bedrooms}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                                    <Bath className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Bathrooms</span>
                                    <span className="font-bold">{property.bathrooms}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Location</span>
                                    <span className="font-bold">{property.estate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-blue-950 mb-4 pb-2 border-b-4 border-amber-500 inline-block">
                                Property Description
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {property.description}
                            </p>
                        </div>

                        {/* ── Contact Section ─────────────────────────────────── */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h3 className="text-xl font-bold text-blue-950 mb-4">Contact Landlord</h3>

                            {/* Not logged in */}
                            {!token && (
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-blue-50 rounded-2xl">
                                    <div className="p-3 bg-blue-900 rounded-xl shrink-0">
                                        <Lock className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Login to contact the landlord</p>
                                        <p className="text-sm text-gray-500">
                                            Pay a one-time fee of <strong>KES 100</strong> to unlock the landlord's phone number and email.
                                        </p>
                                    </div>
                                    <Link href={`/login?redirect=/checkout/${id}`} className="shrink-0">
                                        <Button className="bg-blue-900 hover:bg-blue-950 text-white font-bold gap-2">
                                            <Lock className="h-4 w-4" /> Login to Contact
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Logged in — checking status */}
                            {token && checkingUnlock && (
                                <div className="flex items-center gap-3 text-gray-400 p-4">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Checking access…</span>
                                </div>
                            )}

                            {/* Logged in — NOT unlocked */}
                            {token && !checkingUnlock && unlockStatus && !unlockStatus.unlocked && (
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <div className="p-3 bg-amber-500 rounded-xl shrink-0">
                                        <Lock className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Contact info is locked</p>
                                        <p className="text-sm text-gray-500">
                                            Pay <strong>KES 100</strong> once via M-Pesa to get permanent access to the landlord's contact details.
                                        </p>
                                    </div>
                                    <Link href={`/checkout/${id}`} className="shrink-0">
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2 shadow-lg shadow-amber-500/20">
                                            <Unlock className="h-4 w-4" /> Pay KES 100 to Reveal
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Logged in — UNLOCKED */}
                            {token && !checkingUnlock && unlockStatus?.unlocked && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold mb-4">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Contact details unlocked
                                    </div>
                                    {unlockStatus.contact?.phone && (
                                        <a
                                            href={`tel:${unlockStatus.contact.phone}`}
                                            className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group"
                                        >
                                            <div className="p-3 bg-blue-900 rounded-xl">
                                                <Phone className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone Number</p>
                                                <p className="text-xl font-bold text-blue-900 group-hover:underline">
                                                    {unlockStatus.contact.phone}
                                                </p>
                                            </div>
                                        </a>
                                    )}
                                    {unlockStatus.contact?.email && (
                                        <a
                                            href={`mailto:${unlockStatus.contact.email}`}
                                            className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors group"
                                        >
                                            <div className="p-3 bg-amber-500 rounded-xl">
                                                <span className="text-white font-bold text-sm">@</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                                                <p className="text-lg font-bold text-amber-700 group-hover:underline">
                                                    {unlockStatus.contact.email}
                                                </p>
                                            </div>
                                        </a>
                                    )}
                                    {!unlockStatus.contact?.phone && !unlockStatus.contact?.email && (
                                        <p className="text-gray-400 text-sm p-4 bg-gray-50 rounded-xl">
                                            The landlord has not added contact details to their profile yet.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* No status returned (not logged in edge case) */}
                            {token && !checkingUnlock && !unlockStatus && (
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">
                                            Pay <strong>KES 100</strong> to unlock landlord contact details.
                                        </p>
                                    </div>
                                    <Link href={`/checkout/${id}`} className="shrink-0">
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2">
                                            <Unlock className="h-4 w-4" /> Unlock Contact
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
