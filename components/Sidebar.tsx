"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Brain, Building2, Plus, Radio, AlertTriangle, FileBarChart2, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems = [
  { path: '/', icon: LayoutGrid, label: 'Overview' },
  { path: '/add-office', icon: Plus, label: 'Add New' },
  { path: '/office-registry', icon: Building2, label: 'Full Office Registry' },
  { path: '/feedback', icon: Radio, label: 'Live AI Feed' },
  { path: '/escalations', icon: AlertTriangle, label: 'Escalations' },
  { path: '/reports', icon: FileBarChart2, label: 'Monthly Reports' },
  { path: '/admin/users', icon: Users, label: 'User Management' },
];

export function Sidebar() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <aside
      style={{
        width: '244px',
        minWidth: '244px',
        background: '#FFFFFF',
        borderRight: '2px solid #E8EDF3',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '28px 22px 22px', borderBottom: '1px solid #F0F4F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              background: 'linear-gradient(135deg, #0B6CF5 0%, #0950c4 100%)',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(11, 108, 245, 0.28)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h8M2 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: '650',
                color: '#0F1724',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              GovIntel
            </div>
            <div style={{ fontSize: '11px', color: '#5B6472', letterSpacing: '0.01em', marginTop: '1px' }}>
              Governance Platform
            </div>
          </div>
        </div>
      </div>

      {/* Context Badge */}
      <div style={{ padding: '18px 22px 10px' }}>
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            color: '#9BA5B0',
            fontWeight: '600',
            marginBottom: '6px',
          }}
        >
          ACCESS LEVEL
        </div>
        <div
          style={{
            fontSize: '13px',
            color: '#0B6CF5',
            fontWeight: '600',
            letterSpacing: '-0.1px',
          }}
        >
          Maharashtra — State Level
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 12px', flex: 1 }}>
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            color: '#9BA5B0',
            fontWeight: '600',
            padding: '4px 12px 8px',
          }}
        >
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className=""
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                background: isActive ? '#EAF2FF' : 'transparent',
                color: isActive ? '#0B6CF5' : '#5B6472',
                transition: 'all 0.15s ease',
                border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2.1 : 1.75} />
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: isActive ? '560' : '420',
                  letterSpacing: '-0.1px',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #F0F4F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #EAF2FF 0%, #DBEAFE 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0B6CF5',
              flexShrink: 0,
            }}
          >
            SA
          </div>
          <div className="flex-1">
            <div style={{ fontSize: '12.5px', fontWeight: '530', color: '#0F1724', letterSpacing: '-0.1px' }}>
              State Admin
            </div>
            <div style={{ fontSize: '11px', color: '#5B6472' }}>Maharashtra</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#5B6472',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
