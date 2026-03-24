"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Minus,
  X,
  Upload,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Send,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Eye,
  Activity,
} from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────── */
const C = {
  blue: '#0B6CF5',
  blueSoft: '#EAF2FF',
  blueMid: '#BFDBFE',
  bg: '#F7F9FB',
  white: '#FFFFFF',
  text: '#0F1724',
  textSec: '#5B6472',
  border: '#E8EDF3',
  borderLight: '#F0F4F8',
  green: '#10B981',
  greenSoft: '#ECFDF5',
  greenText: '#065F46',
  amber: '#F59E0B',
  amberSoft: '#FFFBEB',
  amberText: '#92400E',
  shadow: '0 1px 4px rgba(15,23,36,0.06), 0 1px 2px rgba(15,23,36,0.04)',
  shadowMd: '0 4px 16px rgba(15,23,36,0.08), 0 1px 4px rgba(15,23,36,0.06)',
};

/* ─── Mini Sparkline ─────────────────────────────────────── */
function Sparkline({
  data,
  color = C.blue,
  id,
  height = 44,
}: {
  data: number[];
  color?: string;
  id: string;
  height?: number;
}) {
  const w = 100;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPts = `0,${h} ${pts} ${w},${h}`;
  const gradId = `sg_${id}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.14} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={areaPts} fill={`url(#${gradId})`} stroke="none" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── KPI Card ───────────────────────────────────────────── */
interface KPICardProps {
  label: string;
  value: string;
  micro: string;
  microPositive?: boolean;
  sub: string;
  sparkData: number[];
  sparkColor?: string;
  sparkId: string;
  unit?: string;
}

function KPICard({ label, value, micro, microPositive = true, sub, sparkData, sparkColor, sparkId, unit }: KPICardProps) {
  const trendColor = microPositive ? C.green : C.amber;
  const sc = sparkColor ?? (microPositive ? C.blue : C.amber);

  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: '14px',
        padding: '24px',
        flex: 1,
        boxShadow: C.shadow,
        transition: 'box-shadow 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = C.shadowMd)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow)}
    >
      <div
        style={{
          fontSize: '11.5px',
          fontWeight: '560',
          color: C.textSec,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: '14px',
        }}
      >
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: '660',
              color: C.text,
              letterSpacing: '-1px',
              lineHeight: 1,
              marginBottom: '10px',
            }}
          >
            {value}
            {unit && (
              <span style={{ fontSize: '14px', fontWeight: '500', color: C.textSec, marginLeft: '5px', letterSpacing: '-0.2px' }}>
                {unit}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '520',
              color: trendColor,
              marginBottom: '5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {microPositive ? null : null}
            {micro}
          </div>
          <div style={{ fontSize: '11.5px', color: C.textSec, letterSpacing: '-0.1px' }}>{sub}</div>
        </div>
        <div style={{ opacity: 0.85 }}>
          <Sparkline data={sparkData} color={sc} id={sparkId} />
        </div>
      </div>
    </div>
  );
}

/* ─── Drawer ─────────────────────────────────────────────── */
function OfficeDrawer({ office, onClose }: { office: any | null; onClose: () => void }) {
  const [tab, setTab] = useState<'monthly' | 'r3' | 'r6'>('monthly');

  const getChartData = () => {
    if (tab === 'monthly') return office!.omonth.map((v: number, i: number) => ({ label: `M${i + 1}`, value: v }));
    if (tab === 'r3') return office!.r3.map((v: number, i: number) => ({ label: `Q${i + 1}`, value: v }));
    return office!.r6.map((v: number, i: number) => ({ label: `P${i + 1}`, value: v }));
  };

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
              width: '500px',
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
                  <div style={{ fontSize: '18px', fontWeight: '640', color: C.text, letterSpacing: '-0.4px', marginBottom: '6px' }}>
                    {office.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: C.blueSoft,
                        color: C.blue,
                        fontSize: '11.5px',
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
                        background: C.greenSoft,
                        color: C.greenText,
                        fontSize: '11.5px',
                        fontWeight: '520',
                        padding: '3px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      Active
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

            <div style={{ padding: '24px 28px', flex: 1 }}>
              {/* OMES Trend Chart */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, letterSpacing: '-0.2px' }}>
                    OMES Trend
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['monthly', 'r3', 'r6'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${tab === t ? C.blue : C.border}`,
                          background: tab === t ? C.blueSoft : C.white,
                          color: tab === t ? C.blue : C.textSec,
                          fontSize: '11.5px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {t === 'monthly' ? 'Monthly' : t === 'r3' ? '3-Month' : '6-Month'}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    background: C.bg,
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={getChartData()} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                      <defs>
                        <linearGradient id="drawerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.blue} stopOpacity={0.12} />
                          <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: C.textSec }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: C.textSec }}
                        axisLine={false}
                        tickLine={false}
                        tickCount={4}
                      />
                      <Tooltip
                        contentStyle={{
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          borderRadius: '8px',
                          fontSize: '12px',
                          boxShadow: C.shadow,
                        }}
                        labelStyle={{ color: C.textSec }}
                        itemStyle={{ color: C.blue }}
                        formatter={(v: number) => [v.toFixed(2), 'OMES']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={C.blue}
                        strokeWidth={2}
                        fill="url(#drawerGrad)"
                        dot={{ r: 3, fill: C.blue, stroke: C.white, strokeWidth: 1.5 }}
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                {[
                  { label: 'OMES Score', value: office.omes.toFixed(2), sub: 'Current' },
                  { label: 'Submissions', value: office.submissions.toLocaleString(), sub: 'This Month' },
                  { label: 'Confidence', value: office.confidence, sub: 'Data Quality' },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: '640', color: C.text, letterSpacing: '-0.5px', marginBottom: '3px' }}>
                      {m.value}
                    </div>
                    <div style={{ fontSize: '10.5px', color: C.textSec }}>{m.label}</div>
                    <div style={{ fontSize: '10px', color: '#9BA5B0' }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* AI Theme Clusters */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, letterSpacing: '-0.2px', marginBottom: '12px' }}>
                  AI Theme Clusters
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {office.themes.map((theme: string, i: number) => (
                    <div
                      key={theme}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        background: i === 0 ? C.blueSoft : C.bg,
                        border: `1px solid ${i === 0 ? C.blueMid : C.border}`,
                        borderRadius: '9px',
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: i === 0 ? C.blue : '#9BA5B0',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '13px', color: i === 0 ? C.blue : C.text, fontWeight: i === 0 ? '520' : '420' }}>
                        {theme}
                      </span>
                      {i === 0 && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            fontSize: '10.5px',
                            color: C.blue,
                            fontWeight: '520',
                            background: C.white,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            border: `1px solid ${C.blueMid}`,
                          }}
                        >
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Snippets */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, letterSpacing: '-0.2px', marginBottom: '12px' }}>
                  Recent Feedback Snippets
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {office.snippets.map((s: string) => (
                    <div
                      key={s}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '12px 14px',
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: '9px',
                      }}
                    >
                      <MessageSquare
                        size={13}
                        style={{ color: C.textSec, flexShrink: 0, marginTop: '1px' }}
                      />
                      <span
                        style={{ fontSize: '12.5px', color: C.textSec, lineHeight: 1.5, fontStyle: 'italic' }}
                      >
                        "{s}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, marginBottom: '12px' }}>
                  Action Controls
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { icon: Upload, label: 'Upload Corrective Action Note', primary: true },
                    { icon: CheckCircle2, label: 'Mark Improvement Initiated', primary: false },
                    { icon: Eye, label: 'View Submission Patterns', primary: false },
                  ].map((a) => (
                    <button
                      key={a.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        padding: '11px 16px',
                        borderRadius: '9px',
                        border: `1px solid ${a.primary ? C.blue : C.border}`,
                        background: a.primary ? C.blue : C.white,
                        color: a.primary ? C.white : C.text,
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <a.icon size={14} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Overview Component ────────────────────────────── */
export function Overview() {
  const [offices, setOffices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedOffice, setSelectedOffice] = useState<any | null>(null);
  const [aiQuery, setAiQuery] = useState('Which administrative themes show highest improvement this quarter?');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponseVisible, setAiResponseVisible] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [sumRes, offRes] = await Promise.all([
          fetch('/api/dashboard/summary'),
          fetch('/api/offices?limit=15&sortKey=omes&sortDir=desc')
        ]);
        const sumData = await sumRes.json();
        const offData = await offRes.json();

        setSummary(sumData);

        // Map native Offces to Dashboard structural bindings
        const mappedOffices = (offData.offices || []).map((o: any) => ({
          id: o.office_id,
          name: o.office_name,
          district: o.district || 'Unknown',
          division: o.division || 'Unknown',
          omes: o.metadata?.omes || 0,
          trend: o.metadata?.trend || 'stable',
          theme: o.metadata?.themes?.[0] || 'Pending NLP',
          submissions: o.metadata?.submissions_monthly || 0,
          confidence: o.metadata?.confidence || 'N/A',
          themes: o.metadata?.themes || [],
          snippets: ['Awaiting historical feedback parse hook...'],
          omonth: [0, 0, 0, 0, 0, o.metadata?.omes || 0],
          r3: [0, 0, o.metadata?.omes || 0],
          r6: [0, 0, 0, 0, 0, o.metadata?.omes || 0]
        }));

        // Let's sort manually on frontend just in case by highest OMES
        mappedOffices.sort((a: any, b: any) => b.omes - a.omes);
        setOffices(mappedOffices);

      } catch (err) {
        console.error("Dashboard mount error:", err);
      }
    }
    fetchDashboardData();
  }, []);

  const handleAiQuery = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponseVisible(false);
    setTimeout(() => {
      setAiLoading(false);
      setAiResponseVisible(true);
    }, 1200);
  };

  const handleExportCSV = () => {
    const columns = ["Office ID", "Office Name", "District", "Division", "OMES Score", "Trend", "Primary Theme"];

    const rows = offices.map((o) => [
      o.id || '',
      `"${o.name}"` || '""',
      `"${o.district}"` || '""',
      `"${o.division}"` || '""',
      o.omes?.toFixed(2) || '0.00',
      o.trend || '-',
      `"${o.theme}"` || '""'
    ]);

    const csvContent = [columns.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MH_Gov_Dashboard_Export_Feb2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: C.textSec }}>Maharashtra</span>
              <span style={{ color: C.border, fontSize: '12px' }}>›</span>

              <span style={{ color: C.border, fontSize: '12px' }}>›</span>

            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: '680',
                color: C.text,
                letterSpacing: '-0.6px',
                marginBottom: '6px',
              }}
            >
              Governance Overview Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: C.textSec }}>
              State-aggregated performance intelligence · February 2026
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px 14px',
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: '9px',
                fontSize: '12.5px',
                color: C.textSec,
                boxShadow: C.shadow,
              }}
            >
              Feb 2026
            </div>
            <div
              onClick={handleExportCSV}
              style={{
                padding: '8px 16px',
                background: C.blue,
                borderRadius: '9px',
                fontSize: '12.5px',
                color: C.white,
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(11,108,245,0.28)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BarChart3 size={13} />
              Export Report
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '36px' }}>
        <KPICard
          label="Statewide Office Experience Score"
          value={summary?.stateOmes ? summary.stateOmes.toFixed(2) : '---'}
          micro="Live Aggregate"
          microPositive={true}
          sub="Rolling Global Baseline"
          sparkData={[3.72, 3.80, 3.85, 3.90, 3.95, summary?.stateOmes || 3.9]}
          sparkId="omes"
        />
        <KPICard
          label="Offices Under Review"
          value={summary?.officesUnderReview?.toString() || '0'}
          unit="Offices"
          micro="↓ Requires Action"
          microPositive={false}
          sub="Flagged by internal systems"
          sparkData={[26, 25, 23, 22, 21, summary?.officesUnderReview || 10]}
          sparkId="below"
          sparkColor={C.amber}
        />
        <KPICard
          label="Actionable Reform Signals"
          value={summary?.reformSignals?.toString() || '0'}
          unit="Signals"
          micro="Pattern-Triggered"
          microPositive={false}
          sub="Extracted via Direct Processes"
          sparkData={[9, 8, 9, 7, 8, summary?.reformSignals || 0]}
          sparkId="esc"
          sparkColor={C.blue}
        />
        <KPICard
          label="Total Aggregated Submissions"
          value={summary?.totalSubmissions?.toLocaleString() || '0'}
          micro="↑ Healthy Participation"
          microPositive={true}
          sub={`${summary?.positivePct || 0}% Positive AI Sentiment`}
          sparkData={[14200, 15800, 16900, 17600, 18200, summary?.totalSubmissions || 19000]}
          sparkId="subs"
        />
      </div>

      {/* Section 1: Comparative Office Performance */}
      <div
        style={{
          background: C.white,
          border: `2px solid ${C.border}`,
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: C.shadow,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '22px 28px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: '620', color: C.text, letterSpacing: '-0.3px', marginBottom: '3px' }}>
              Comparative Office Performance
            </div>
            <div style={{ fontSize: '12.5px', color: C.textSec }}>
              Ranked by OMES · Service optimisation signals
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '4px 12px',
                background: C.blueSoft,
                color: C.blue,
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: '520',
                border: `1px solid ${C.blueMid}`,
              }}
            >
              4 of 312 Offices
            </span>
          </div>
        </div>

        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 1fr 1fr 1.1fr 2fr',
            padding: '12px 28px',
            background: C.blue,
            borderBottom: `1px solid ${C.blue}`,
          }}
        >
          {['Office', 'District', 'OMES', 'Rolling Trend', 'Primary Theme'].map((h) => (
            <div
              key={h}
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {offices.map((office: any, idx) => (
          <div
            key={office.id}
            onClick={() => setSelectedOffice(office)}
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1.1fr 2fr',
              padding: '16px 28px',
              borderBottom: idx < offices.length - 1 ? `1px solid ${C.border}` : 'none',
              cursor: 'pointer',
              transition: 'background 0.12s ease',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = C.bg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
          >
            {/* Office Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: C.blueSoft,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={13} color={C.blue} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '520', color: C.text, letterSpacing: '-0.2px' }}>
                  {office.name}
                </div>
                <div style={{ fontSize: '11.5px', color: C.textSec, marginTop: '2px' }}>{office.division} Division</div>
              </div>
            </div>

            {/* District */}
            <div style={{ fontSize: '13px', color: C.textSec }}>{office.district}</div>

            {/* OMES */}
            <div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '640',
                  color: C.text,
                  letterSpacing: '-0.3px',
                }}
              >
                {office.omes.toFixed(2)}
              </span>
              <div
                style={{
                  height: '3px',
                  background: C.border,
                  borderRadius: '2px',
                  marginTop: '5px',
                  width: '44px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(office.omes / 5) * 100}%`,
                    background: C.blue,
                    borderRadius: '2px',
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>

            {/* Trend */}
            <div>
              {office.trend === 'improving' ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    background: '#F0FDF4',
                    color: '#15803D',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: '520',
                  }}
                >
                  <TrendingUp size={10} />
                  Improving
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    background: C.bg,
                    color: C.textSec,
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: '520',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Minus size={10} />
                  Stable
                </span>
              )}
            </div>

            {/* Theme */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '13px',
                  color: C.textSec,
                }}
              >
                {office.theme}
              </span>
              <ChevronRight size={14} color={C.textSec} style={{ opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>



      {/* End main dashboard sections */}

      {/* Office Detail Drawer */}
      <OfficeDrawer office={selectedOffice} onClose={() => setSelectedOffice(null)} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Default page export required by Next.js App Router
export default function Page() {
  return <Overview />;
}