'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const roleLinks = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
    { label: 'Profile', href: '/student/profile', icon: '👤' },
    { label: 'Resume', href: '/student/resume', icon: '📄' },
    { label: 'Jobs', href: '/student/jobs', icon: '💼' },
    { label: 'Applications', href: '/student/applications', icon: '📋' },
    { label: 'Notifications', href: '/student/notifications', icon: '🔔' },
    { label: 'AI Tools', href: '/ai', icon: '🤖' },
  ],
  company: [
    { label: 'Dashboard', href: '/company/dashboard', icon: '📊' },
    { label: 'Profile', href: '/company/profile', icon: '🏢' },
    { label: 'My Jobs', href: '/company/jobs', icon: '💼' },
    { label: 'Interviews', href: '/company/interviews', icon: '📅' },
    { label: 'AI Tools', href: '/ai', icon: '🤖' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Students', href: '/admin/students', icon: '👨‍🎓' },
    { label: 'Companies', href: '/admin/companies', icon: '🏢' },
    { label: 'Drives', href: '/admin/drives', icon: '🚗' },
    { label: 'Announcements', href: '/admin/announcements', icon: '📢' },
    { label: 'Bulk Import', href: '/admin/bulk-import', icon: '📥' },
    { label: 'Reports', href: '/admin/reports', icon: '📈' },
    { label: 'AI Insights', href: '/ai', icon: '🤖' },
  ],
  faculty: [
    { label: 'Dashboard', href: '/faculty/dashboard', icon: '📊' },
    { label: 'Reports', href: '/faculty/reports', icon: '📈' },
    { label: 'AI Tools', href: '/ai', icon: '🤖' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const links = roleLinks[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Placement Portal</h2>
        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
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
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
