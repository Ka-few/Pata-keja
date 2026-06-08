'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, ArrowLeft, CheckCircle2, Upload, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

const ESTATES = [
    'Barnabas', 'Bismark', 'Heshima', 'KITI', 'Kiamunyi',
    'Lanet', 'Mawanga', 'Naka', 'Pipeline', 'Sita', 'Upperhill', 'Whitehouse',
];

interface UploadedPhoto {
    file: File;
    preview: string;
}

export default function EditPropertyPage() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;
    const { token, isRealtorOrAdmin } = useAuthStore();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [form, setForm] = useState({
        title: '',
        type: '',
        bathrooms: '',
        description: '',
        estate: '',
        furnished: '',
        price: '',
        deposit: '',
    });

    useEffect(() => {
        if (!isRealtorOrAdmin()) {
            router.push('/login');
            return;
        }

        api.properties.get(propertyId)
            .then(data => {
                let mappedType = data.type;
                if (data.type === 'APARTMENT') {
                    mappedType = `APARTMENT_${data.bedrooms}`;
                }
                
                setForm({
                    title: data.title || '',
                    type: mappedType || '',
                    bathrooms: String(data.bathrooms || ''),
                    description: data.description || '',
                    estate: data.estate || '',
                    furnished: data.furnished ? 'yes' : 'no',
                    price: String(data.price || ''),
                    deposit: String(data.deposit || ''),
                });

                if (data.media && data.media.length > 0) {
                    setExistingPhotos(data.media.map((m: any) => m.url));
                }
            })
            .catch(err => {
                console.error(err);
                alert('Failed to load property details');
                router.push('/dashboard');
            })
            .finally(() => setLoading(false));
    }, [propertyId, isRealtorOrAdmin, router]);

    const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

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

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('price', String(form.price));
            formData.append('deposit', String(form.deposit));
            
            const beds = Number(form.type.split('_')[1]) || (form.type.includes('STUDIO') || form.type.includes('BEDSITTER') ? 1 : 0);
            formData.append('bedrooms', String(beds));
            formData.append('bathrooms', String(form.bathrooms));
            
            const mappedType = form.type.includes('APARTMENT') ? 'APARTMENT' : form.type;
            formData.append('type', mappedType);
            
            formData.append('furnished', form.furnished === 'yes' ? 'true' : 'false');
            formData.append('estate', form.estate);
            formData.append('town', 'Nakuru');
            formData.append('county', 'Nakuru');

            photos.forEach(p => {
                formData.append('files', p.file);
            });

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/properties/${propertyId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to update property');
            }
            
            alert('Property updated successfully');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Update failed', error);
            alert(error.message || 'Failed to update property');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh] gap-3 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin" /> Loading property details...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="bg-gradient-to-r from-blue-950 to-blue-900 pt-24 pb-10 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Edit Property</h1>
                    <p className="text-blue-200 text-lg">Update your listing details below.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-6 pb-16">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <div className="flex items-center mb-6">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Listing Title</label>
                            <Input value={form.title} onChange={e => set('title', e.target.value)} className="h-11" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type</label>
                                <Select value={form.type} onValueChange={v => set('type', v)}>
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
                                <Select value={form.bathrooms} onValueChange={v => set('bathrooms', v)}>
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
                                <Select value={form.furnished} onValueChange={v => set('furnished', v)}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes — fully furnished</SelectItem>
                                        <SelectItem value="no">Unfurnished</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estate</label>
                                <Select value={form.estate} onValueChange={v => set('estate', v)}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Select estate" /></SelectTrigger>
                                    <SelectContent>
                                        {ESTATES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Rent (KES)</label>
                                <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="h-11" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deposit (KES)</label>
                                <Input type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} className="h-11" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                            <textarea 
                                rows={5} 
                                value={form.description} 
                                onChange={e => set('description', e.target.value)} 
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none" 
                            />
                        </div>

                        {/* Photos Section */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Update Photos</label>
                            <p className="text-xs text-amber-600 font-medium mb-3">
                                Uploading new photos will completely replace your existing photos. Leave this blank to keep your current photos.
                            </p>
                            
                            {existingPhotos.length > 0 && photos.length === 0 && (
                                <div className="mb-4">
                                    <span className="text-xs text-gray-500 font-medium block mb-2">Current Photos:</span>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {existingPhotos.map((url, i) => (
                                            <img key={i} src={url} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0 border border-gray-100" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={e => addFiles(e.target.files)}
                            />

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
                                        {isDragging ? 'Drop your photos here!' : 'Drop new photos here or click to upload'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB each • Max 10 photos</p>
                                </div>
                            </div>

                            {photos.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-gray-700">New photos selected ({photos.length})</label>
                                        {photos.length < 10 && (
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-700 font-medium hover:underline">+ Add more</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                        {photos.map((p, i) => (
                                            <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                                                <img src={p.preview} alt={`photo-${i}`} className="w-full h-full object-cover" />
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
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <Button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 gap-2"
                            >
                                {saving ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><CheckCircle2 className="h-4 w-4" /> Save Changes</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
