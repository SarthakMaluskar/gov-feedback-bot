"use client";

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Minus, Filter, Download, Plus, ChevronUp, ChevronDown, Loader2, X, Copy, Check, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
  blue: '#0B6CF5',
  blueSoft: '#EAF2FF',
  blueMid: '#BFDBFE',
  bg: '#F7F9FB',
  white: '#FFFFFF',
  text: '#0F1724',
  textSec: '#334155',
  border: '#E8EDF3',
  borderLight: '#F0F4F8',
  shadow: '0 1px 4px rgba(15,23,36,0.06), 0 1px 2px rgba(15,23,36,0.04)',
  green: '#10B981',
  greenSoft: '#ECFDF5',
};

function OfficeDrawer({ office, onClose }: { office: any | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <AnimatePresence>
      {office && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 36, 0.18)',
              zIndex: 40,
              backdropFilter: 'blur(2px)',
            }}
          />
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '420px',
              background: C.white,
              zIndex: 50,
              overflow: 'auto',
              boxShadow: '-12px 0 48px rgba(11,108,245,0.08), -2px 0 8px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '28px 28px 20px',
                borderBottom: `1px solid ${C.border}`,
                background: C.white,
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '640', color: C.text, letterSpacing: '-0.4px', marginBottom: '6px' }}>
                    {office.office_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: C.blueSoft,
                        color: C.blue,
                        fontSize: '13.5px',
                        fontWeight: '520',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        border: `1px solid ${C.blueMid}`,
                      }}
                    >
                      {office.district}
                    </span>
                    <span
                      style={{
                        background: office.is_active ? C.bg : '#FFFBEB',
                        color: office.is_active ? C.textSec : '#92400E',
                        fontSize: '13.5px',
                        fontWeight: '520',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        border: `1px solid ${office.is_active ? C.border : '#FDE68A'}`,
                      }}
                    >
                      {office.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: C.textSec,
                    flexShrink: 0,
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Live Insights AI Block */}
            <div style={{ padding: '0 28px' }}>
              <div style={{ background: '#F8FAFC', borderRadius: '12px', border: `1px solid ${C.border}`, padding: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '640', color: C.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Live AI Insights</h4>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803D', background: '#DCFCE7', padding: '2px 8px', borderRadius: '20px' }}>
                    {office.metadata?.confidence || 'N/A'} Confidence
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: C.white, padding: '12px', borderRadius: '8px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '13px', color: C.textSec, marginBottom: '4px' }}>OMES SCORE</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: C.text }}>{office.metadata?.omes?.toFixed(2) || 'N/A'}</div>
                  </div>
                  <div style={{ background: C.white, padding: '12px', borderRadius: '8px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '13px', color: C.textSec, marginBottom: '4px' }}>TRAJECTORY</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: office.metadata?.trend === 'declining' ? '#B91C1C' : '#15803D', textTransform: 'capitalize' }}>
                      {office.metadata?.trend || 'Stable'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: C.textSec, marginBottom: '8px' }}>DETECTED THEMES</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {office.metadata?.themes?.length > 0 ? (
                      office.metadata.themes.map((t: string) => (
                        <span key={t} style={{ fontSize: '13px', background: C.white, border: `1px solid ${C.border}`, padding: '4px 10px', borderRadius: '6px', color: C.text }}>
                          {t}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: C.textSec }}>No themes detected yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Section */}
            <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: C.blueSoft,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <QrCode size={20} color={C.blue} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: C.text, marginBottom: '6px', letterSpacing: '-0.2px' }}>
                  Feedback QR Portal
                </h3>
                <p style={{ fontSize: '14.5px', color: C.textSec, maxWidth: '260px', lineHeight: 1.5 }}>
                  Print or display this code at the office to allow citizens to instantly submit secure feedback via WhatsApp.
                </p>
              </div>

              <div
                style={{
                  padding: '16px',
                  background: 'white',
                  border: `1px solid ${C.border}`,
                  borderRadius: '14px',
                  boxShadow: C.shadow,
                  marginBottom: '28px',
                }}
              >
                <img
                  src={`/api/offices/${office.office_id}/qr?size=300`}
                  alt="Office QR Code"
                  width={220}
                  height={220}
                  style={{ display: 'block', borderRadius: '8px' }}
                />
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(office.office_id);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  background: copied ? C.greenSoft : C.blue,
                  color: copied ? '#15803D' : 'white',
                  borderRadius: '9px',
                  fontSize: '15px',
                  fontWeight: '520',
                  border: `1px solid ${copied ? C.green : C.blue}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '260px',
                  justifyContent: 'center',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'DIGIPIN Copied' : `Copy DIGIPIN (${office.digipin || office.office_id})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

type SortKey = 'name' | 'district' | 'omes' | 'expected_visitors';

export function OfficeRegistry() {
  const router = useRouter();
  const [selectedOffice, setSelectedOffice] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('omes');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [offices, setOffices] = useState<any[]>([]);
  const [totalOffices, setTotalOffices] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [divisions, setDivisions] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  const limit = 15;

  const fetchOffices = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        division: divisionFilter,
        dept: deptFilter,
        sortKey,
        sortDir
      });

      const res = await fetch(`/api/offices?${query.toString()}`);
      const data = await res.json();

      setOffices(data.offices || []);
      setTotalOffices(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Seed filters if they are empty
      if (divisions.length === 0 && data.divisions) {
        setDivisions(data.divisions);
        setDepartments(data.departments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, [page, search, divisionFilter, deptFilter, sortKey, sortDir]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, divisionFilter, deptFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
    ) : null;

  const avgVisitors = offices.length
    ? Math.round(offices.reduce((acc, o) => acc + (o.expected_visitors || 0), 0) / offices.length)
    : 0;

  const improvingPct = offices.length
    ? Math.round((offices.filter((o) => (o.metadata?.trend || 'stable') === 'improving').length / offices.length) * 100)
    : 0;

  const underReviewCount = offices.filter((o) => !o.is_active).length;
  const tableGridColumns = 'minmax(240px, 2.5fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(95px, 1fr) minmax(120px, 1fr) minmax(140px, 1fr)';

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '14px', color: C.textSec }}>Maharashtra</span>
          <span style={{ color: C.border }}>›</span>
          <span style={{ fontSize: '14px', color: C.blue, fontWeight: '500' }}>Office Registry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '680', color: C.text, letterSpacing: '-0.6px', marginBottom: '6px' }}>
              Full Office Registry
            </h1>
            <p style={{ fontSize: '16px', color: C.textSec }}>
              All registered offices across Maharashtra · {totalOffices} total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', background: C.white, border: `1px solid ${C.border}`,
                borderRadius: '9px', fontSize: '15px', color: C.textSec, cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: C.shadow,
              }}
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={() => router.push('/add-office')}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', background: C.blue, border: 'none',
                borderRadius: '9px', fontSize: '15px', fontWeight: '520', color: 'white',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(11,108,245,0.25)',
              }}
            >
              <Plus size={13} />
              Add Office
            </button>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Offices', value: `${totalOffices}` },
          { label: 'Avg Visitors', value: `${avgVisitors}` },
          { label: 'Improving', value: improvingPct },
          { label: 'Under Review', value: `${underReviewCount}` },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: '10px',
              padding: '12px 18px', boxShadow: C.shadow, flex: 1,
            }}
          >
            <div style={{ fontSize: '13px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '660', color: C.text, letterSpacing: '-0.4px' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div
        style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px',
          padding: '16px 20px', marginBottom: '20px', boxShadow: C.shadow,
          display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 14px',
          }}
        >
          <Search size={14} color={C.textSec} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by office name or district…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15.5px', color: C.text, fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} color={C.textSec} />
        </div>

        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          style={{
            padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: '9px', fontSize: '15px', color: divisionFilter ? C.text : C.textSec,
            cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '140px',
          }}
        >
          <option value="">All Divisions</option>
          {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{
            padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: '9px', fontSize: '15px', color: deptFilter ? C.text : C.textSec,
            cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '140px',
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: C.white, border: `2px solid ${C.border}`, borderRadius: '16px',
          boxShadow: C.shadow, overflowX: 'auto', overflowY: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: tableGridColumns,
            padding: '12px 24px',
            background: C.blue,
            borderBottom: `1px solid ${C.blue}`,
          }}
        >
          {[
            { k: 'name' as SortKey, label: 'Office' },
            { k: null, label: 'Dept' },
            { k: 'district' as SortKey, label: 'District' },
            { k: null, label: 'Division' },
            { k: 'omes' as SortKey, label: 'OMES' },
            { k: null, label: 'Trend' },
            { k: 'expected_visitors' as SortKey, label: 'Expected Visitors' },
          ].map(({ k, label }) => (
            <div
              key={label}
              onClick={() => k && handleSort(k)}
              style={{
                fontSize: '13px', fontWeight: '600', color: '#FFFFFF',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                cursor: k ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: '4px',
                userSelect: 'none',
              }}
            >
              {label}
              {k && <SortIcon k={k} />}
            </div>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.textSec, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={24} className="animate-spin" color={C.blue} />
            <span style={{ fontSize: '16px' }}>Loading office registry...</span>
          </div>
        ) : offices.length > 0 ? (
          offices.map((office, idx) => (
            <div
              key={office.office_id || office._id || idx}
              onClick={() => setSelectedOffice(office)}
              style={{
                display: 'grid',
                gridTemplateColumns: tableGridColumns,
                padding: '14px 24px',
                borderBottom: idx < offices.length - 1 ? `1px solid ${C.border}` : 'none',
                alignItems: 'center',
                transition: 'background 0.1s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = C.bg)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
            >
              <div>
                <div style={{ fontSize: '15.5px', fontWeight: '520', color: C.text, letterSpacing: '-0.2px', marginBottom: '2px' }}>
                  {office.office_name}
                </div>
                <span
                  style={{
                    padding: '2px 8px',
                    background: office.is_active ? C.greenSoft : '#FFFBEB',
                    color: office.is_active ? '#15803D' : '#92400E',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: '500',
                    border: `1px solid ${office.is_active ? '#A7F3D0' : '#FDE68A'}`,
                  }}
                >
                  {office.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ fontSize: '14.5px', color: C.textSec }}>{office.department || '---'}</div>
              <div style={{ fontSize: '14.5px', color: C.text }}>{office.district || '---'}</div>
              <div style={{ fontSize: '14.5px', color: C.textSec }}>{office.division || '---'}</div>

              <div>
                <span style={{ fontSize: '16px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px' }}>
                  {typeof office.metadata?.omes === 'number' ? office.metadata.omes.toFixed(2) : 'N/A'}
                </span>
                {typeof office.metadata?.omes === 'number' && office.metadata.omes > 0 && (
                  <div style={{ height: '2.5px', background: C.border, borderRadius: '2px', marginTop: '5px', width: '40px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(office.metadata.omes / 5) * 100}%`, background: C.blue, borderRadius: '2px', opacity: 0.6 }} />
                  </div>
                )}
              </div>

              <div>
                {office.metadata?.trend === 'improving' ? (
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 9px', background: '#F0FDF4', color: '#15803D',
                      borderRadius: '20px', fontSize: '13px', fontWeight: '520',

                    }}
                  >
                    <TrendingUp size={9} /> Improving
                  </span>
                ) : office.metadata?.trend === 'declining' ? (
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 9px', background: '#FEF2F2', color: '#B91C1C',
                      borderRadius: '20px', fontSize: '13px', fontWeight: '520',
                      border: `1px solid #FCA5A5`,
                    }}
                  >
                    <TrendingUp size={9} style={{ transform: 'rotate(180deg)' }} /> Declining
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 9px', background: C.bg, color: C.textSec,
                      borderRadius: '20px', fontSize: '13px', fontWeight: '520',
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <Minus size={9} /> Pending
                  </span>
                )}
              </div>

              <div style={{ fontSize: '15px', fontWeight: '520', color: C.text }}>
                {office.expected_visitors ? office.expected_visitors.toLocaleString() : '---'}
              </div>
            </div>
          ))) : (
          <div style={{ padding: '48px', textAlign: 'center', color: C.textSec, fontSize: '16px' }}>
            No offices match your current filters.
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px', borderTop: `1px solid ${C.border}`, background: '#FAFBFC',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '14px', color: C.textSec }}>
            Showing {offices.length} of {totalOffices} registered offices
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '7px',
                    border: `1px solid ${p === page ? C.blue : C.border}`,
                    background: p === page ? C.blue : C.white,
                    color: p === page ? 'white' : C.textSec,
                    fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <OfficeDrawer office={selectedOffice} onClose={() => setSelectedOffice(null)} />
    </div>
  );
}      // Default export for Next.js App Router
export default function Page() {
  return <OfficeRegistry />;
}
