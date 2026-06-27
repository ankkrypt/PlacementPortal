'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const roleLinks = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Profile', href: '/student/profile' },
    { label: 'Resume', href: '/student/resume' },
    { label: 'Jobs', href: '/student/jobs' },
    { label: 'Applications', href: '/student/applications' },
    { label: 'Notifications', href: '/student/notifications' },
    { label: 'AI Tools', href: '/ai' },
  ],
  company: [
    { label: 'Dashboard', href: '/company/dashboard' },
    { label: 'Profile', href: '/company/profile' },
    { label: 'My Jobs', href: '/company/jobs' },
    { label: 'Interviews', href: '/company/interviews' },
    { label: 'AI Tools', href: '/ai' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Students', href: '/admin/students' },
    { label: 'Companies', href: '/admin/companies' },
    { label: 'Drives', href: '/admin/drives' },
    { label: 'Announcements', href: '/admin/announcements' },
    { label: 'Bulk Import', href: '/admin/bulk-import' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'AI Insights', href: '/ai' },
  ],
  faculty: [
    { label: 'Dashboard', href: '/faculty/dashboard' },
    { label: 'Reports', href: '/faculty/reports' },
    { label: 'AI Tools', href: '/ai' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const links = roleLinks[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <img src="/logo.png" alt="TIMSCDR Logo" className="w-10 h-10 rounded-lg object-contain" />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-800 leading-tight">TIMSCDR</h2>
          <p className="text-[10px] text-gray-500 leading-tight">Thakur Institute of Management Studies, Career Development & Research</p>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href || pathname.startsWith(link.href + '/')
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
