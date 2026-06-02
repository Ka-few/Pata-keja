import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Menu } from 'lucide-react';

export default function Navbar() {
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
                        <Button variant="ghost" size="sm" className="hidden md:flex">List Property</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="outline" size="icon" className="rounded-full">
                                        <User className="h-5 w-5" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Sign In</DropdownMenuItem>
                                <DropdownMenuItem>Register</DropdownMenuItem>
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
