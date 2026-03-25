"use client";

import React, { useState, useEffect } from 'react';
import { Network, Loader2, Sparkles, AlertTriangle, Building2, MapPin, X } from 'lucide-react';
import MaharashtraMap from '@/components/MaharashtraMap';

/* ─── Design tokens & Types ──────────────────────────────── */
const C = {
    blue: '#0B6CF5',
    blueSoft: '#EAF2FF',
    bg: '#F7F9FB',
    white: '#FFFFFF',
    text: '#0F1724',
    textSec: '#334155',
    border: '#E8EDF3',
    borderLight: '#F0F4F8',
    red: '#EF4444',
    shadow: '0 4px 16px rgba(15,23,36,0.06)'
};

type RegionType = "district";

interface RegionalData {
    region_type: RegionType;
    region_name: string;
    summary_text: string;
    metrics: {
        total_offices: number;
        avg_omes: number;
        open_escalations: number;
    };
    top_themes: string[];
    updated_at?: string;
}

export default function RegionalDashboard() {
    const [regionType, setRegionType] = useState<"district" | "taluka">("district");
    const [regionName, setRegionName] = useState("Pune");
    const [summaryData, setSummaryData] = useState<RegionalData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCached, setIsCached] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = async (targetRegion: string, targetType: "district" | "taluka" = regionType, forceRefresh = false) => {
        if (!targetRegion.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const url = `/api/analytics/regional-summary?type=${targetType}&name=${encodeURIComponent(targetRegion.trim())}&refresh=${forceRefresh}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch summary.");
            }

            setSummaryData(data.data);
            setIsCached(data.cached);
        } catch (err: any) {
            setError(err.message);
            setSummaryData(null);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount for the default value
    useEffect(() => {
        fetchSummary(regionName, regionType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle map clicks
    const handleRegionSelect = (selectedName: string, selectedType: "district" | "taluka" = "district") => {
        let scrubbedName = selectedName.trim();
        if (selectedType === "district") {
            if (scrubbedName === "Mumbai Suburban") scrubbedName = "Mumbai";
        }

        setRegionType(selectedType);
        setRegionName(scrubbedName);
        fetchSummary(scrubbedName, selectedType);
    };

    const handleResetMap = () => {
        setRegionType("district");
        setRegionName("");
        setSummaryData(null); // Clear summary when zoomed out to state level
    };

    return (
        <div style={{ padding: '40px 48px', maxWidth: '1600px', margin: '0 auto', minHeight: '100vh', background: C.bg }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Network size={16} color={C.blue} />
                    <span style={{ fontSize: '14px', color: C.blue, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Governance Map</span>
                </div>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '700', color: C.text, letterSpacing: '-0.8px', marginBottom: '6px' }}>
                        Regional Intelligence
                    </h1>
                    <p style={{ fontSize: '16px', color: C.textSec, maxWidth: '600px' }}>
                        Interactive geographical analysis. Select any district to instantly generate a comprehensive AI situational briefing and performance metrics.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1fr) 1.2fr', gap: '32px', alignItems: 'start' }}>

                {/* LEFT: INTERACTIVE MAP (Sticky) */}
                <div style={{
                    background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px',
                    padding: '24px', boxShadow: C.shadow, position: 'sticky', top: '24px'
                }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: C.text }}>Territory Selection</div>
                        {regionName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontSize: '14px', color: C.text, background: C.blueSoft, padding: '4px 12px', borderRadius: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Target: <span style={{ color: C.blue, fontWeight: '700' }}>{regionName}</span>
                                    <button
                                        onClick={handleResetMap}
                                        style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: C.blue, opacity: 0.7, marginLeft: '4px' }}
                                        title="Reset Map"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '13px', color: '#64748B', background: C.bg, padding: '4px 12px', borderRadius: '16px' }}>
                                Select a District
                            </div>
                        )}
                    </div>

                    <div style={{ background: C.bg, borderRadius: '12px', overflow: 'hidden', padding: '16px', border: `1px solid ${C.borderLight}` }}>
                        <MaharashtraMap
                            onRegionSelect={handleRegionSelect}
                            selectedRegion={regionName}
                        />
                    </div>
                </div>

                {/* RIGHT: AI EXECUTIVE SUMMARY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Error State */}
                    {error && (
                        <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: C.red, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                            <AlertTriangle size={20} />
                            {error}
                        </div>
                    )}

                    {/* State View Prompt */}
                    {!loading && !summaryData && !error && !regionName && (
                        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', boxShadow: C.shadow, padding: '40px', textAlign: 'center' }}>
                            <div style={{ background: C.blueSoft, padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
                                <MapPin size={32} color={C.blue} />
                            </div>
                            <div style={{ color: C.text, fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>State-Level View Active</div>
                            <div style={{ color: C.textSec, fontSize: '15px', maxWidth: '400px', lineHeight: 1.5 }}>
                                Select a specific district on the interactive map to drill down and generate a hyper-local AI performance briefing.
                            </div>
                        </div>
                    )}

                    {loading && !summaryData && (
                        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', boxShadow: C.shadow }}>
                            <Loader2 size={40} color={C.blue} className="animate-spin" style={{ marginBottom: '20px' }} />
                            <div style={{ color: C.text, fontWeight: 600, fontSize: '18px' }}>Generating AI Briefing...</div>
                            <div style={{ color: C.textSec, fontSize: '14px', marginTop: '8px' }}>Analyzing millions of data points across {regionName}</div>
                        </div>
                    )}

                    {summaryData && !loading && (
                        <>
                            {/* Metrics Strip (MOVED TO TOP FOR VISIBILITY) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', boxShadow: C.shadow }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ background: C.bg, padding: '8px', borderRadius: '8px' }}>
                                            <Building2 size={18} color={C.textSec} />
                                        </div>
                                        <div style={{ fontSize: '12px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Offices Tracked</div>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: C.text, letterSpacing: '-1px' }}>{summaryData.metrics.total_offices}</div>
                                </div>
                                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', boxShadow: C.shadow }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ background: summaryData.metrics.avg_omes < 3.0 ? '#FEF2F2' : '#ECFDF5', padding: '8px', borderRadius: '8px' }}>
                                            <MapPin size={18} color={summaryData.metrics.avg_omes < 3.0 ? C.red : '#10B981'} />
                                        </div>
                                        <div style={{ fontSize: '12px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Regional OMES</div>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: summaryData.metrics.avg_omes < 3.0 ? C.red : '#10B981', letterSpacing: '-1px' }}>
                                        {summaryData.metrics.avg_omes.toFixed(1)} <span style={{ fontSize: '16px', fontWeight: '500', color: C.textSec }}>/ 5.0</span>
                                    </div>
                                </div>
                                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', boxShadow: C.shadow }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ background: summaryData.metrics.open_escalations > 0 ? '#FEF2F2' : C.bg, padding: '8px', borderRadius: '8px' }}>
                                            <AlertTriangle size={18} color={summaryData.metrics.open_escalations > 0 ? C.red : C.textSec} />
                                        </div>
                                        <div style={{ fontSize: '12px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Active Escalations</div>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: summaryData.metrics.open_escalations > 0 ? C.red : C.text, letterSpacing: '-1px' }}>
                                        {summaryData.metrics.open_escalations}
                                    </div>
                                </div>
                            </div>

                            {/* Top Themes */}
                            {summaryData.top_themes.length > 0 && (
                                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', boxShadow: C.shadow }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: C.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                                        Dominant Citizen Themes
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {summaryData.top_themes.map((theme, i) => (
                                            <div key={i} style={{ padding: '8px 16px', borderRadius: '8px', background: C.bg, border: `1px solid ${C.border}`, fontSize: '14px', color: C.text, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.blue }}></div>
                                                {theme}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Synopsis Panel */}
                            <div style={{
                                background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px',
                                padding: '32px', boxShadow: C.shadow
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ background: C.blueSoft, padding: '10px', borderRadius: '10px' }}>
                                            <Sparkles size={24} color={C.blue} />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: C.text, letterSpacing: '-0.5px' }}>
                                                Chief Secretary Briefing
                                            </h2>
                                            <div style={{ fontSize: '14px', color: C.textSec, marginTop: '2px' }}>Prepared for {summaryData.region_name}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: isCached ? '#64748B' : C.blue, background: isCached ? C.bg : C.blueSoft, padding: '6px 12px', borderRadius: '6px', border: `1px solid ${isCached ? C.border : '#BFDBFE'}` }}>
                                        {isCached ? "DATABASE CACHE" : "LIVE AI GENERATION"}
                                    </div>
                                </div>

                                <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#334155', display: 'flex', flexDirection: 'column', gap: '20px', letterSpacing: '0.1px' }}>
                                    {summaryData.summary_text.split('\n').filter(p => p.trim() !== "").map((para, i) => (
                                        <p key={i} style={{ margin: 0 }}>
                                            {/* Stylize the first paragraph with a drop cap or bold intro if desired */}
                                            {i === 0 ? <strong style={{ color: C.text }}>{para.substring(0, 10)}</strong> : null}
                                            {i === 0 ? para.substring(10) : para}
                                        </p>
                                    ))}
                                </div>

                                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>
                                        Report timestamp: {summaryData.updated_at ? new Date(summaryData.updated_at).toLocaleString() : new Date().toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => fetchSummary(regionName, regionType, true)}
                                        style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = C.bg}
                                    >
                                        Force AI Refresh
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
