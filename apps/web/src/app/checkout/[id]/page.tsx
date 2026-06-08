'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, Property } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Loader2, Phone, Lock, CheckCircle2, ArrowLeft, ShieldCheck, MapPin
} from 'lucide-react';
import Link from 'next/link';

const UNLOCK_FEE = 100;

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params.id as string;
    const { token, user } = useAuthStore();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [paying, setPaying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [contact, setContact] = useState<{ phone?: string; email?: string } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            router.push(`/login?redirect=/checkout/${propertyId}`);
            return;
        }
        api.properties.get(propertyId)
            .then(setProperty)
            .catch(() => router.push('/properties'))
            .finally(() => setLoading(false));
    }, [propertyId, token, router]);

    const handlePay = async () => {
        setError('');
        const cleaned = phone.replace(/\s+/g, '');
        if (!cleaned || !/^(07|01|\+2547|\+2541)\d{8}$/.test(cleaned)) {
            setError('Please enter a valid Kenyan phone number (e.g. 0712 345 678)');
            return;
        }
        setPaying(true);
        try {
            const result = await api.payments.unlock(propertyId, cleaned);
            if (result.status === 'SUCCESS' || result.status === 'ALREADY_UNLOCKED') {
                setContact(result.contact || null);
                setSuccess(true);
            } else {
                setError('Payment could not be processed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh] mt-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
                </div>
            </div>
        );
    }

    if (success && contact) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-lg mx-auto px-4 pt-32 pb-16 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-500 mb-8">You've unlocked the contact details for <strong>{property?.title}</strong>.</p>

                    <div className="w-full bg-white rounded-3xl shadow-xl border border-green-100 p-8 mb-8 space-y-4">
                        <h2 className="text-lg font-bold text-gray-700 mb-4 text-left border-b pb-2">Landlord Contact Info</h2>
                        {contact.phone ? (
                            <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group"
                            >
                                <div className="p-3 bg-blue-900 rounded-xl">
                                    <Phone className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone Number</p>
                                    <p className="text-xl font-bold text-blue-900 group-hover:underline">{contact.phone}</p>
                                </div>
                            </a>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 text-sm">No phone number on file.</div>
                        )}
                        {contact.email && (
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors group"
                            >
                                <div className="p-3 bg-amber-500 rounded-xl">
                                    <span className="text-white font-bold text-sm">@</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                                    <p className="text-lg font-bold text-amber-700 group-hover:underline">{contact.email}</p>
                                </div>
                            </a>
                        )}
                    </div>

                    <Link href={`/properties/${propertyId}`}>
                        <Button className="bg-blue-900 hover:bg-blue-950 text-white px-8">
                            Back to Property
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 pt-24 pb-16 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-sm font-medium px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                        <Lock className="h-4 w-4" /> Secure Checkout
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Unlock Contact Details</h1>
                    <p className="text-blue-200 text-lg">Pay once, get permanent access to the landlord's contact info.</p>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-8 pb-16">
                {/* Property Summary Card */}
                {property && (
                    <div className="bg-white rounded-2xl shadow-xl p-5 mb-6 flex gap-4 items-center border border-gray-100">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                            {property.media?.[0] ? (
                                <img src={property.media[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{property.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {property.estate}, {property.town}
                            </p>
                            <p className="text-blue-900 font-bold mt-1">KES {Number(property.price).toLocaleString()}/mo</p>
                        </div>
                    </div>
                )}

                {/* Payment Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <div className="flex items-center mb-6">
                        <Link href={`/properties/${propertyId}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to property
                        </Link>
                    </div>

                    {/* Fee breakdown */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Contact Unlock Fee</span>
                            <span className="font-semibold">KES {UNLOCK_FEE.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Processing Fee</span>
                            <span className="font-semibold">KES 0</span>
                        </div>
                        <div className="border-t border-blue-100 pt-2 flex justify-between font-bold text-gray-900">
                            <span>Total</span>
                            <span className="text-blue-900 text-lg">KES {UNLOCK_FEE.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* M-Pesa Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            M-Pesa Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="tel"
                                placeholder="e.g. 0712 345 678"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="h-12 pl-10 text-base"
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                            An M-Pesa STK push will be sent to this number. Enter your PIN when prompted.
                        </p>
                    </div>

                    <Button
                        onClick={handlePay}
                        disabled={paying}
                        className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2 shadow-lg shadow-green-600/20"
                    >
                        {paying ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Processing Payment…</>
                        ) : (
                            <>Pay KES {UNLOCK_FEE.toLocaleString()} via M-Pesa</>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Secured & encrypted • One-time payment • Permanent access
                    </div>
                </div>
            </div>
        </div>
    );
}
