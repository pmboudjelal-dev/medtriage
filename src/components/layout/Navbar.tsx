'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HeartPulse,
  LayoutDashboard,
  UserPlus,
  ScanLine,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/add', label: 'New Patient', icon: UserPlus },
  { href: '/scan', label: 'Scan QR', icon: ScanLine },
];

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-600">
          <HeartPulse className="w-6 h-6" />
          <span className="text-lg hidden sm:block">MedTriage</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
                <User className="w-4 h-4 text-blue-700" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {profile?.name ?? 'Staff'}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'hidden sm:block text-xs capitalize',
                  profile?.role === 'doctor'
                    ? 'border-blue-300 text-blue-700 bg-blue-50'
                    : 'border-green-300 text-green-700 bg-green-50'
                )}
              >
                {profile?.role ?? '…'}
              </Badge>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{profile?.name}</span>
                <span className="text-xs text-slate-500 font-normal">{profile?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {navLinks.map(({ href, label, icon: Icon }) => (
              <DropdownMenuItem key={href} asChild className="md:hidden">
                <Link href={href} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="md:hidden" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}