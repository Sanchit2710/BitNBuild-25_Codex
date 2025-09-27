// file: dashboard/components/DashboardLayout.js

import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">NourishNet🍴</h1>
        </div>
        <nav className="mt-6">
          <Link href="/" className="block px-6 py-2.5 text-gray-700 hover:bg-gray-200">Dashboard</Link>
          <Link href="/subscribers" className="block px-6 py-2.5 text-gray-700 hover:bg-gray-200">Subscribers</Link>
          <Link href="/deliveries" className="block px-6 py-2.5 text-gray-700 hover:bg-gray-200">Deliveries</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}