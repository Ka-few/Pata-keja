'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Home, MapPin, DollarSign, Camera, CheckCircle2,
    ChevronRight, ChevronLeft, Upload, Wifi, Droplets,
    Zap, Car, Shield, Waves, X, ImageIcon, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { usePropertyStore } from '@/store/usePropertyStore';
import { useAuthStore } from '@/store/useAuthStore';

const STEPS = ['Property Details', 'Location', 'Pricing', 'Photos & Amenities', 'Review'];

const ESTATES = [
    'Barnabas', 'Bismark', 'Heshima', 'KITI', 'Kiamunyi',
    'Lanet', 'Mawanga', 'Naka', 'Pipeline', 'Sita', 'Upperhill', 'Whitehouse',
];

const AMENITIES = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'water', label: 'Water 24/7', icon: Droplets },
    { id: 'electricity', label: 'Electricity', icon: Zap },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'pool', label: 'Swimming Pool', icon: Waves },
];

interface UploadedPhoto {
    file: File;
    preview: string;
}

export default function ListPropertyPage() {
    const router = useRouter();
    const { token, isRealtorOrAdmin } = useAuthStore();
    const addProperty = usePropertyStore(state => state.addProperty);
    
    const [step, setStep] = useState(0);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: '',
        type: '',
        bathrooms: '',
        description: '',
        estate: '',
        floor: '',
        furnished: '',
        price: '',
        deposit: '',
        name: '',
        phone: '',
        email: '',
    });

    // Guard route: only REALTOR or ADMIN can access this page
    useEffect(() => {
        if (!isRealtorOrAdmin()) {
            router.push('/login');
        }
    }, [isRealtorOrAdmin, router]);

    const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));
    const toggleAmenity = (id: string) =>
        setSelectedAmenities(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

    const progressPct = ((step + 1) / STEPS.length) * 100;

    // ── Photo handling ────────────────────────────────────────────────────────
    const addFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const newPhotos: UploadedPhoto[] = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .slice(0, 10 - photos.length)
            .map(file => ({ file, preview: URL.createObjectURL(file) }));
        setPhotos(p => [...p, ...newPhotos]);
    }, [photos.length]);

    const removePhoto = (index: number) => {
        setPhotos(p => {
            URL.revokeObjectURL(p[index].preview);
            return p.filter((_, i) => i !== index);
        });
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            
            // Map form state to CreatePropertyDto
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('price', String(form.price));
            formData.append('deposit', String(form.deposit));
            
            // Calculate bedrooms from type enum string (e.g. "APARTMENT_2" -> 2)
            const beds = Number(form.type.split('_')[1]) || (form.type.includes('STUDIO') || form.type.includes('BEDSITTER') ? 1 : 0);
            formData.append('bedrooms', String(beds));
            formData.append('bathrooms', String(form.bathrooms));
            
            // Fix type to match Enum exactly
            const mappedType = form.type.includes('APARTMENT') ? 'APARTMENT' : form.type;
            formData.append('type', mappedType);
            
            formData.append('furnished', form.furnished === 'yes' ? 'true' : 'false');
            formData.append('estate', form.estate);
            formData.append('town', 'Nakuru'); // Currently locked to Nakuru
            formData.append('county', 'Nakuru'); // Currently locked to Nakuru

            // Append photos to 'files' field
            photos.forEach(p => {
                formData.append('files', p.file);
            });

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/properties`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to submit property');
            }

            const newProperty = await res.json();

            // Also add to local store for immediate UI updates without refetching all
            addProperty({
                title: newProperty.title,
                price: Number(newProperty.price),
                location: `${newProperty.estate}, Nakuru`,
                bedrooms: newProperty.bedrooms,
                bathrooms: newProperty.bathrooms,
                imageUrl: newProperty.media?.[0]?.url || photos[0]?.preview || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2673',
                isVerified: false
            });

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting property:', error);
            alert('There was an error submitting your listing. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Success screen ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center -mt-16">
                    <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Listing Submitted!</h2>
                        <p className="text-gray-500 mb-2">
                            Your property in <strong className="text-gray-700">{form.estate}, Nakuru</strong> has been received.
                        </p>
                        <p className="text-gray-500 text-sm mb-8">
                            Our team will review it within 24 hours and notify you via SMS on <strong className="text-gray-700">{form.phone || 'the number provided'}</strong>.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link href="/">
                                <Button className="w-full bg-blue-900 hover:bg-blue-950 text-white">Back to Home</Button>
                            </Link>
                            <Button variant="outline" className="w-full" onClick={() => { setSubmitted(false); setStep(0); setForm({ title: '', type: '', bathrooms: '', description: '', estate: '', floor: '', furnished: '', price: '', deposit: '', name: '', phone: '', email: '' }); setPhotos([]); setSelectedAmenities([]); }}>
                                List Another Property
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero banner */}
            <div className="bg-gradient-to-r from-blue-950 to-blue-900 pt-24 pb-10 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">List Your Property</h1>
                    <p className="text-blue-200 text-lg">Reach thousands of tenants across Nakuru in minutes.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-6">
                {/* Step indicators */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((label, i) => (
                            <div key={i} className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                    ${i < step ? 'bg-green-500 text-white' :
                                    i === step ? 'bg-blue-900 text-white ring-4 ring-blue-100' :
                                    'bg-gray-100 text-gray-400'}`}>
                                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                </div>
                                <span className={`text-[10px] mt-1 font-medium hidden md:block
                                    ${i === step ? 'text-blue-900' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className="bg-gradient-to-r from-blue-900 to-amber-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                {/* Step panels */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">

                    {/* ── STEP 0: Property Details ── */}
                    {step === 0 && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <StepHeader icon={<Home className="h-5 w-5 text-blue-900" />} bg="bg-blue-50" title="Property Details" sub="Basic info about your unit" />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Listing Title</label>
                                <Input placeholder="e.g. Modern 2BR apartment in Kiamunyi" value={form.title} onChange={e => set('title', e.target.value)} className="h-11" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type</label>
                                    <Select onValueChange={v => set('type', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BEDSITTER">Bedsitter</SelectItem>
                                            <SelectItem value="STUDIO">Studio</SelectItem>
                                            <SelectItem value="APARTMENT_1">1 Bedroom</SelectItem>
                                            <SelectItem value="APARTMENT_2">2 Bedroom</SelectItem>
                                            <SelectItem value="APARTMENT_3">3 Bedroom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bathrooms</label>
                                    <Select onValueChange={v => set('bathrooms', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Furnished?</label>
                                    <Select onValueChange={v => set('furnished', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes — fully furnished</SelectItem>
                                            <SelectItem value="partial">Partially furnished</SelectItem>
                                            <SelectItem value="no">Unfurnished</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Floor</label>
                                    <Input placeholder="e.g. Ground, 1st, 2nd…" value={form.floor} onChange={e => set('floor', e.target.value)} className="h-11" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea rows={4} placeholder="Describe the property — highlight key features, nearby landmarks, etc." value={form.description} onChange={e => set('description', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none" />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Location ── */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <StepHeader icon={<MapPin className="h-5 w-5 text-amber-600" />} bg="bg-amber-50" title="Location" sub="Where is your property located?" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Town</label>
                                    <div className="h-11 border border-gray-200 rounded-lg flex items-center px-3 gap-2 bg-gray-50">
                                        <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                                        <span className="font-semibold text-gray-700">Nakuru</span>
                                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Fixed</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estate</label>
                                    <Select onValueChange={v => set('estate', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select estate" /></SelectTrigger>
                                        <SelectContent>
                                            {ESTATES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street / Road (optional)</label>
                                <Input placeholder="e.g. Off Nakuru-Nairobi Highway" className="h-11" />
                            </div>

                            <div className="rounded-xl overflow-hidden border border-gray-200 h-48 bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400">
                                <MapPin className="h-8 w-8 text-gray-300" />
                                <span className="text-sm">Interactive map coming soon</span>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Pricing ── */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <StepHeader icon={<DollarSign className="h-5 w-5 text-green-600" />} bg="bg-green-50" title="Pricing" sub="Set your monthly rent and deposit" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Rent (KES)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">KES</span>
                                        <Input type="number" placeholder="e.g. 15000" value={form.price} onChange={e => set('price', e.target.value)} className="h-11 pl-12" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deposit (KES)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">KES</span>
                                        <Input type="number" placeholder="e.g. 15000" value={form.deposit} onChange={e => set('deposit', e.target.value)} className="h-11 pl-12" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                                <strong>Tip:</strong> Properties priced between KES 8,000 – 25,000/month get the most enquiries in Nakuru. Set a fair deposit (usually 1–2 months rent).
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Landlord / Agent Name</label>
                                <Input placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} className="h-11" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <Input placeholder="e.g. 0712 345 678" value={form.phone} onChange={e => set('phone', e.target.value)} className="h-11" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (optional)</label>
                                    <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} className="h-11" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Photos & Amenities ── */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <StepHeader icon={<Camera className="h-5 w-5 text-purple-600" />} bg="bg-purple-50" title="Photos & Amenities" sub="Add photos and select what's included" />

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={e => addFiles(e.target.files)}
                            />

                            {/* Drop zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200
                                    ${isDragging
                                        ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}
                            >
                                <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <Upload className={`h-6 w-6 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-700">
                                        {isDragging ? 'Drop your photos here!' : 'Drop photos here or click to upload'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB each • Max 10 photos</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-1 pointer-events-none"
                                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                >
                                    <ImageIcon className="h-4 w-4 mr-2" /> Browse Files
                                </Button>
                            </div>

                            {/* Photo grid preview */}
                            {photos.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-gray-700">{photos.length} photo{photos.length !== 1 ? 's' : ''} selected</label>
                                        {photos.length < 10 && (
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-700 font-medium hover:underline">+ Add more</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {photos.map((p, i) => (
                                            <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                                                <img src={p.preview} alt={`photo-${i}`} className="w-full h-full object-cover" />
                                                {i === 0 && (
                                                    <span className="absolute bottom-1 left-1 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-semibold">Cover</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(i)}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Available Amenities</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {AMENITIES.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => toggleAmenity(id)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                                                ${selectedAmenities.includes(id)
                                                    ? 'border-blue-900 bg-blue-900 text-white shadow-lg shadow-blue-900/20'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Review ── */}
                    {step === 4 && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <StepHeader icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} bg="bg-green-50" title="Review & Submit" sub="Check your listing before publishing" />

                            <div className="space-y-0 divide-y divide-gray-50">
                                {[
                                    { label: 'Title', value: form.title || '—' },
                                    { label: 'Property Type', value: form.type.replace('APARTMENT_', '') ? form.type.replace('APARTMENT_1', '1 Bedroom').replace('APARTMENT_2', '2 Bedroom').replace('APARTMENT_3', '3 Bedroom') || '—' : '—' },
                                    { label: 'Bathrooms', value: form.bathrooms || '—' },
                                    { label: 'Furnished', value: { yes: 'Yes — fully furnished', partial: 'Partially furnished', no: 'Unfurnished' }[form.furnished] || '—' },
                                    { label: 'Town', value: 'Nakuru' },
                                    { label: 'Estate', value: form.estate || '—' },
                                    { label: 'Monthly Rent', value: form.price ? `KES ${Number(form.price).toLocaleString()}` : '—' },
                                    { label: 'Deposit', value: form.deposit ? `KES ${Number(form.deposit).toLocaleString()}` : '—' },
                                    { label: 'Contact Name', value: form.name || '—' },
                                    { label: 'Phone', value: form.phone || '—' },
                                    { label: 'Photos', value: photos.length ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} ready` : 'No photos added' },
                                    { label: 'Amenities', value: selectedAmenities.length ? selectedAmenities.join(', ') : 'None selected' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between py-2.5">
                                        <span className="text-sm text-gray-500 font-medium">{label}</span>
                                        <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{value}</span>
                                    </div>
                                ))}
                            </div>

                            {photos.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {photos.slice(0, 5).map((p, i) => (
                                        <img key={i} src={p.preview} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0 border border-gray-100" />
                                    ))}
                                    {photos.length > 5 && (
                                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">+{photos.length - 5}</div>
                                    )}
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                                Your listing will be reviewed by our team within 24 hours and published once verified. You will be notified via SMS.
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
                            <ChevronLeft className="h-4 w-4" /> Back
                        </Button>

                        {step < STEPS.length - 1 ? (
                            <Button onClick={() => setStep(s => s + 1)} className="bg-blue-900 hover:bg-blue-950 text-white gap-2">
                                Continue <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 gap-2 min-w-[160px]"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                ) : (
                                    <><CheckCircle2 className="h-4 w-4" /> Submit Listing</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Small reusable step header component
function StepHeader({ icon, bg, title, sub }: { icon: React.ReactNode; bg: string; title: string; sub: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{sub}</p>
            </div>
        </div>
    );
}
