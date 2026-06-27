'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Login successful!');
      const paths = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        admin: '/admin/dashboard',
        faculty: '/faculty/dashboard',
      };
      router.push(paths[user.role] || '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Background Banner */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <img
          src="/timscdr_banner.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="TIMSCDR Logo"
            className="w-20 h-20 mx-auto mb-3 rounded-xl object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">TIMSCDR</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Thakur Institute of Management Studies,
            <br />
            Career Development & Research
          </p>
          <div className="w-12 h-0.5 bg-blue-600 mx-auto mt-3 mb-2"></div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="you@college.edu"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Register here
          </Link>
        </p>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Demo Accounts:</p>
          <p>Admin: admin@college.edu / admin@123</p>
        </div>
      </div>
    </div>
  );
}
