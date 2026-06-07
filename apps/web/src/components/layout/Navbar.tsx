'use client';

import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const { user, isAuthenticated, logout, isRealtorOrAdmin } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => setMounted(true), []);

    if (!mounted) return null; // Or a placeholder navbar matching the design

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-amber-600 bg-clip-text text-transparent">
                            PataNyumba
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/properties" className="text-gray-600 hover:text-blue-900 font-medium">Browse Listings</Link>
                        <Link href="/developments" className="text-gray-600 hover:text-blue-900 font-medium">Developments</Link>
                        <Link href="/agents" className="text-gray-600 hover:text-blue-900 font-medium">Agents</Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isRealtorOrAdmin() && (
                            <Link href="/list-property">
                                <Button variant="ghost" size="sm" className="hidden md:flex text-amber-600 font-bold hover:text-amber-700 hover:bg-amber-50">
                                    List Property
                                </Button>
                            </Link>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-blue-900 focus:outline-none"
                            >
                                <User className="h-5 w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isAuthenticated() ? (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                                            {user?.role === 'REALTOR' ? 'Agent' : user?.role === 'ADMIN' ? 'Admin' : 'Account'}
                                        </div>
                                        <DropdownMenuItem className="text-gray-700 font-medium">{user?.email}</DropdownMenuItem>
                                        {isRealtorOrAdmin() && (
                                            <DropdownMenuItem onClick={() => router.push('/list-property')} className="w-full cursor-pointer">List Property</DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                                            Agent Access
                                        </div>
                                        <DropdownMenuItem onClick={() => router.push('/login')} className="w-full cursor-pointer">Sign In</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push('/register')} className="w-full cursor-pointer">Register</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
