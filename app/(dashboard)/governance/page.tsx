"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Clock,
  ChevronRight,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

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
  shadowMd: '0 4px 16px rgba(15,23,36,0.08)',
  green: '#10B981',
  greenSoft: '#ECFDF5',
};

const suggestedQueries = [
  'Which administrative themes show highest improvement this quarter?',
  'Identify districts with consistent OMES improvement trends.',
  'What are the primary service delivery bottlenecks in Nashik Division?',
  'Show policy signals with highest citizen resonance.',
  'Compare Q1 2026 performance with Q4 2025 across divisions.',
  'Which offices have shown the most improvement in waiting time metrics?',
];

interface InsightCard {
  id: number;
  query: string;
  response: string;
  confidence: string;
  timestamp: string;
  tags: string[];
}

const insights: InsightCard[] = [
  {
    id: 1,
    query: 'Which administrative themes show highest improvement this quarter?',
    response:
      'Positive shifts observed in municipal service delivery across 4 divisions. Average OMES improvement: +0.18. Primary drivers include Queue Flow Efficiency and Documentation Clarity. Waiting time optimisation themes show a 23% increase in positive signal frequency.',
    confidence: 'High',
    timestamp: '2 hours ago',
    tags: ['Queue Efficiency', 'Documentation', 'OMES Trend'],
  },
  {
    id: 2,
    query: 'Districts with consistent OMES improvement trends?',
    response:
      'Pune and Mumbai districts demonstrate statistically consistent improvement trajectories over 6 rolling months. Both districts show above-average citizen participation rates (>2,800 submissions/month) contributing to higher confidence scores.',
    confidence: 'High',
    timestamp: 'Yesterday',
    tags: ['Pune', 'Mumbai', 'Rolling Trend'],
  },
  {
    id: 3,
    query: 'Policy signals with highest citizen resonance?',
    response:
      'Simplified Application Tracking and Digital Access Awareness emerge as the highest-resonance policy signals. These themes appear in 67% of positive feedback submissions, suggesting strong citizen alignment with digital service expansion.',
    confidence: 'Medium',
    timestamp: '3 days ago',
    tags: ['Policy Signal', 'Digital Access', 'Application'],
  },
];

const stateData = [
  { month: 'Sep', omes: 3.78 },
  { month: 'Oct', omes: 3.85 },
  { month: 'Nov', omes: 3.91 },
  { month: 'Dec', omes: 3.98 },
  { month: 'Jan', omes: 4.06 },
  { month: 'Feb', omes: 4.18 },
];

export function GovernanceIntelligence() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseVisible, setResponseVisible] = useState(false);
  const [customResponse, setCustomResponse] = useState('');

  const handleQuery = () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponseVisible(false);
    setTimeout(() => {
      setLoading(false);
      setResponseVisible(true);
      setCustomResponse(
        `Analysis complete for: "${query}". Based on ${(Math.random() * 5000 + 15000).toFixed(0)} citizen submissions across ${Math.floor(Math.random() * 8 + 4)} districts, the governance intelligence system identifies strong positive signals in service delivery optimisation. Confidence level is high with sufficient data coverage.`
      );
    }, 1400);
  };

  const handleSuggested = (q: string) => {
    setQuery(q);
    setResponseVisible(false);
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '14px', color: C.textSec }}>Maharashtra</span>
          <span style={{ color: C.border }}>›</span>
          <span style={{ fontSize: '14px', color: C.blue, fontWeight: '500' }}>
            Governance Intelligence
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '680',
                color: C.text,
                letterSpacing: '-0.6px',
                marginBottom: '6px',
              }}
            >
              Governance Intelligence
            </h1>
            <p style={{ fontSize: '16px', color: C.textSec }}>
              AI-advisory pattern analysis · Not prescriptive, not punitive
            </p>
          </div>
          
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Left: Main Query Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Query Panel */}
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: C.shadow,
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`,
                background: 'linear-gradient(135deg, #F8FBFF 0%, #EAF2FF 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              
              <div>
                <div style={{ fontSize: '16px', fontWeight: '620', color: C.text, letterSpacing: '-0.2px' }}>
                  Intelligence Query
                </div>
                <div style={{ fontSize: '13.5px', color: C.textSec }}>
                  Explore patterns across submissions, OMES trends & governance themes
                </div>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Textarea */}
              <div
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  transition: 'border-color 0.15s',
                }}
              >
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about patterns, trends, performance themes, or governance signals across offices and districts…"
                  rows={3}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    color: C.text,
                    letterSpacing: '-0.1px',
                    lineHeight: 1.6,
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['All Divisions', 'Q1 2026', 'State Level'].map((f) => (
                    <span
                      key={f}
                      style={{
                        padding: '4px 10px',
                        background: C.blueSoft,
                        color: C.blue,
                        border: `1px solid ${C.blueMid}`,
                        borderRadius: '20px',
                        fontSize: '13.5px',
                        fontWeight: '500',
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleQuery}
                  disabled={loading || !query.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: loading || !query.trim() ? '#9BBDF8' : C.blue,
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '15.5px',
                    fontWeight: '530',
                    cursor: loading || !query.trim() ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: loading || !query.trim() ? 'none' : '0 2px 10px rgba(11,108,245,0.28)',
                    transition: 'all 0.15s',
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: '13px',
                          height: '13px',
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Analysing…
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Analyse Intelligence
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Response Area */}
            <AnimatePresence>
              {responseVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ borderTop: `1px solid ${C.border}`, overflow: 'hidden' }}
                >
                  <div style={{ padding: '24px', background: 'linear-gradient(135deg, #F8FBFF 0%, #EAF2FF 100%)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          background: C.blue,
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Sparkles size={12} color="white" />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: '16px',
                            color: C.text,
                            lineHeight: 1.65,
                            letterSpacing: '-0.1px',
                            marginBottom: '14px',
                          }}
                        >
                          {customResponse}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              padding: '4px 12px',
                              background: C.white,
                              border: `1px solid #A7C4FC`,
                              borderRadius: '20px',
                              fontSize: '13.5px',
                              color: C.blue,
                              fontWeight: '520',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <CheckCircle2 size={11} />
                            High Confidence
                          </span>
                          <span
                            style={{
                              padding: '4px 12px',
                              background: C.white,
                              border: `1px solid ${C.border}`,
                              borderRadius: '20px',
                              fontSize: '13.5px',
                              color: C.textSec,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <RefreshCw size={10} />
                            AI Advisory · Feb 2026
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Suggested Queries */}
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              padding: '22px',
              boxShadow: C.shadow,
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: '580', color: C.text, marginBottom: '14px', letterSpacing: '-0.2px' }}>
              Suggested Intelligence Queries
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestedQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggested(q)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: '9px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s',
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = C.blueSoft;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.blueMid;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = C.bg;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                  }}
                >
                  <MessageSquare size={13} color={C.textSec} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', color: C.text, flex: 1 }}>{q}</span>
                  <ChevronRight size={13} color={C.textSec} style={{ opacity: 0.5 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Insight History */}
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: C.shadow,
            }}
          >
            <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '15.5px', fontWeight: '620', color: C.text, letterSpacing: '-0.2px' }}>
                Recent Intelligence Insights
              </div>
            </div>
            {insights.map((ins, idx) => (
              <div
                key={ins.id}
                style={{
                  padding: '18px 22px',
                  borderBottom: idx < insights.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      background: C.blueSoft,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}
                  >
                    <BookOpen size={11} color={C.blue} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '520', color: C.text, marginBottom: '4px', letterSpacing: '-0.1px' }}>
                      {ins.query}
                    </div>
                    <p style={{ fontSize: '14.5px', color: C.textSec, lineHeight: 1.55, marginBottom: '10px' }}>
                      {ins.response}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          background: ins.confidence === 'High' ? '#F0FDF4' : '#FFFBEB',
                          color: ins.confidence === 'High' ? '#15803D' : '#92400E',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '520',
                        }}
                      >
                        {ins.confidence} Confidence
                      </span>
                      {ins.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: '3px 9px',
                            background: C.bg,
                            color: C.textSec,
                            border: `1px solid ${C.border}`,
                            borderRadius: '20px',
                            fontSize: '13px',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '13px',
                          color: C.textSec,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={10} />
                        {ins.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Context Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* State OMES Trend */}
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              padding: '22px',
              boxShadow: C.shadow,
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: '580', color: C.text, marginBottom: '4px', letterSpacing: '-0.2px' }}>
              State OMES Trend
            </div>
            <div style={{ fontSize: '13.5px', color: C.textSec, marginBottom: '16px' }}>Sep 2025 – Feb 2026</div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: '660', color: C.text, letterSpacing: '-0.8px' }}>4.18</span>
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '14px',
                  color: C.green,
                  fontWeight: '520',
                  background: '#ECFDF5',
                  padding: '3px 8px',
                  borderRadius: '20px',
                }}
              >
                ↑ +0.40
              </span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={stateData} margin={{ top: 4, right: 2, bottom: 0, left: -32 }}>
                <defs>
                  <linearGradient id="stateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} />
                <YAxis domain={[3.6, 4.3]} tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} tickCount={3} />
                <Tooltip
                  contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '13px' }}
                  formatter={(v: number) => [v.toFixed(2), 'OMES']}
                />
                <Area type="monotone" dataKey="omes" stroke={C.blue} strokeWidth={2} fill="url(#stateGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Intelligence Context */}
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              padding: '22px',
              boxShadow: C.shadow,
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: '580', color: C.text, marginBottom: '14px', letterSpacing: '-0.2px' }}>
              Intelligence Context
            </div>
            {[
              { label: 'Active Offices', value: '312', icon: TrendingUp },
              { label: 'Submissions (Feb)', value: '19,842', icon: MessageSquare },
              { label: 'Avg. Confidence', value: 'High', icon: CheckCircle2 },
              { label: 'Divisions Active', value: '6 of 6', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: item.label !== 'Divisions Active' ? `1px solid ${C.borderLight}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={13} color={C.textSec} />
                    <span style={{ fontSize: '14.5px', color: C.textSec }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '560', color: C.text }}>{item.value}</span>
                </div>
              );
            })}
          </div>

          {/* Advisory Notice */}
          
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Default export for Next.js App Router
export default function Page() {
  return <GovernanceIntelligence />;
}
