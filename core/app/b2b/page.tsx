'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp,
  Package,
  Calendar,
  Building2,
  Loader2
} from 'lucide-react';

import { 
  getCurrentB2BBuyer, 
  getQuoteStats,
  B2BBuyer 
} from '~/lib/b2b/server-actions';

// Client component for dashboard stats
function DashboardStats({ buyerId }: { buyerId: string }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const quoteStats = await getQuoteStats(buyerId);
        setStats(quoteStats);
      } catch (error) {
        console.error('Error loading quote stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [buyerId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">$45,230</p>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Orders</p>
            <p className="text-2xl font-semibold text-gray-900">12</p>
            <p className="text-sm text-blue-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pending Quotes</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-purple-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Team Members</p>
            <p className="text-2xl font-semibold text-gray-900">8</p>
            <p className="text-sm text-orange-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 new
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client component for recent activity
function RecentActivity() {
  // This would fetch recent activity from B2B APIs
  const recentActivity = [
    {
      id: '1',
      type: 'quote_created',
      title: 'New quote created',
      description: 'Quote #Q12345 for Premium Widgets',
      timestamp: '2 hours ago',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: '2',
      type: 'order_shipped',
      title: 'Order shipped',
      description: 'Order #ORD-2024-001 has been shipped',
      timestamp: '1 day ago',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: '3',
      type: 'payment_received',
      title: 'Payment received',
      description: 'Payment of $2,450 received',
      timestamp: '3 days ago',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main dashboard component
export default function B2BDashboardPage() {
  const [buyer, setBuyer] = useState<B2BBuyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadBuyer() {
      try {
        setLoading(true);
        const currentBuyer = await getCurrentB2BBuyer();
        
        if (!currentBuyer) {
          setError('B2B authentication required');
          router.push('/login');
          return;
        }
        
        setBuyer(currentBuyer);
      } catch (err) {
        setError('Failed to load buyer data');
        console.error('Error loading buyer:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBuyer();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Authentication Error
            </h3>
            <p className="text-red-700">
              {error || 'Unable to load B2B buyer data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">B2B Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {buyer.firstName}. Here's what's happening with your B2B operations.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{buyer.company.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <DashboardStats buyerId={buyer.id} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Create New Quote</div>
                <div className="text-sm text-gray-500">Request pricing for products</div>
              </div>
              <FileText className="h-4 w-4 text-blue-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Browse Catalog</div>
                <div className="text-sm text-gray-500">View available products</div>
              </div>
              <Package className="h-4 w-4 text-green-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">View Orders</div>
                <div className="text-sm text-gray-500">Track your order history</div>
              </div>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Analytics</div>
                <div className="text-sm text-gray-500">View performance data</div>
              </div>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Architecture Info */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Clean B2B Architecture Demo
          </h3>
          <p className="text-blue-700 mb-4">
            This page demonstrates the clean architecture approach with Catalyst client, server actions, and proper auth decoupling.
          </p>
          <div className="flex justify-center space-x-4 text-sm text-blue-600">
            <span>• Catalyst Client</span>
            <span>• Server Actions</span>
            <span>• Auth Decoupling</span>
            <span>• Type Safety</span>
          </div>
        </div>
      </div>
    </div>
  );
} 