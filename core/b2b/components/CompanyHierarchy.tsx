'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input } from '~/vibes';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';

type CompanyStatus = 'active' | 'inactive' | 'pending';
type CompanyType = 'parent' | 'subsidiary' | 'branch';

export interface CompanyNode {
  id: number;
  name: string;
  status: CompanyStatus;
  type: CompanyType;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  userCount: number;
  parentId?: number;
  children?: CompanyNode[];
  createdAt: string;
  updatedAt: string;
}

export function CompanyHierarchy({ companyId }: { companyId?: string | number }) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CompanyStatus>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [companies, setCompanies] = useState<CompanyNode[]>([]);

  useEffect(() => {
    async function loadCompany() {
      try {
        const { getCompanyInfo } = await import('~/b2b/server-actions');
        const result = await getCompanyInfo();
        if (result.company) {
          const c = result.company;
          const root: CompanyNode = {
            id: Number(c.id) || 1,
            name: c.companyName || 'My Company',
            status: 'active',
            type: 'parent',
            address: [c.addressLine1, c.city, c.state, c.zipCode].filter(Boolean).join(', '),
            phone: c.phoneNumber || undefined,
            email: c.adminEmail || undefined,
            userCount: 0,
            createdAt: c.createdAt || '',
            updatedAt: c.updatedAt || '',
            children: [],
          };
          setCompanies([root]);
        }
      } catch (err) {
        console.error('Error loading company hierarchy:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, []);

  const toggle = (id: number) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const match = (n: CompanyNode): boolean =>
      (statusFilter === 'all' || n.status === statusFilter) &&
      (!term || n.name.toLowerCase().includes(term));

    const filterTree = (nodes: CompanyNode[] | undefined): CompanyNode[] =>
      (nodes || [])
        .map((n) => ({ ...n, children: filterTree(n.children) }))
        .filter((n) => match(n) || (n.children && n.children.length > 0));

    return filterTree(companies);
  }, [companies, search, statusFilter]);

  const StatusPill = ({ status }: { status: CompanyStatus }) => (
    <span
      className={
        'px-2 py-0.5 text-xs font-medium rounded-full ' +
        (status === 'active'
          ? 'bg-green-100 text-green-800'
          : status === 'inactive'
          ? 'bg-red-100 text-red-800'
          : 'bg-yellow-100 text-yellow-800')
      }
    >
      {status}
    </span>
  );

  const TypePill = ({ type }: { type: CompanyType }) => (
    <span
      className={
        'px-2 py-0.5 text-xs font-medium rounded-full ' +
        (type === 'parent'
          ? 'bg-blue-100 text-blue-800'
          : type === 'subsidiary'
          ? 'bg-purple-100 text-purple-800'
          : 'bg-sky-100 text-sky-800')
      }
    >
      {type}
    </span>
  );

  const Node = ({ node, depth = 0 }: { node: CompanyNode; depth?: number }) => {
    const hasChildren = !!node.children?.length;
    const isOpen = expanded.has(node.id);
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white">
          <div style={{ marginLeft: depth * 16 }} className="flex items-center gap-2">
            {hasChildren ? (
              <button onClick={() => toggle(node.id)} className="p-1 hover:bg-gray-100 rounded">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ) : (
              <span className="w-4 h-4" />
            )}
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium text-gray-900">{node.name}</div>
              <StatusPill status={node.status} />
              <TypePill type={node.type} />
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
              {node.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{node.address}</span>
                </div>
              )}
              {node.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{node.phone}</span>
                </div>
              )}
              {node.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{node.email}</span>
                </div>
              )}
              {node.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{node.website}</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{node.userCount} users</span>
                </div>
                <div>
                  Updated {new Date(node.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="small" className="flex items-center gap-1">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
                {node.type !== 'parent' && (
                  <Button variant="secondary" size="small" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {isOpen && hasChildren && (
          <div className="ml-4 space-y-2">
            {node.children!.map((child) => (
              <Node key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-2 text-gray-600">Loading company hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Company Hierarchy</h2>
          <p className="text-gray-600 mt-1">Manage your company structure and subsidiaries</p>
        </div>
        <Button variant="primary" size="medium" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Company
        </Button>
      </div>

      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <div className="text-gray-700 font-medium">No companies found</div>
            <div className="text-gray-500 text-sm">Try changing your search or filters</div>
          </div>
        ) : (
          filtered.map((root) => <Node key={root.id} node={root} />)
        )}
      </div>
    </div>
  );
}


















