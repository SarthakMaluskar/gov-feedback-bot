"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle, ShieldAlert, ShieldCheck, Clock, CheckCircle2,
    ChevronDown, ChevronUp, Upload, Loader2, RefreshCw, X, Building2,
    MessageSquare, CheckCheck, XCircle, Smartphone, Zap, ChevronRight
} from 'lucide-react';

/* ─── Design tokens (matches app-wide style) ─────────────── */
const C = {
    blue: '#0B6CF5',
    blueSoft: '#EAF2FF',
    bg: '#F7F9FB',
    white: '#FFFFFF',
    text: '#0F1724',
    textSec: '#334155',
    border: '#E8EDF3',
    borderLight: '#F0F4F8',
    shadow: '0 1px 4px rgba(15,23,36,0.06), 0 1px 2px rgba(15,23,36,0.04)',
    shadowMd: '0 4px 16px rgba(15,23,36,0.08), 0 1px 4px rgba(15,23,36,0.06)',
    red: '#EF4444',
    redSoft: '#FEF2F2',
    redBorder: '#FECACA',
    amber: '#F59E0B',
    amberSoft: '#FFFBEB',
    amberBorder: '#FDE68A',
    green: '#10B981',
    greenSoft: '#ECFDF5',
    greenBorder: '#A7F3D0',
    orange: '#F97316',
    orangeSoft: '#FFF7ED',
    orangeBorder: '#FED7AA',
};

/* ─── Level configuration ────────────────────────────────── */
const LEVEL_CONFIG = {
    1: {
        label: 'Office Head Alert',
        short: 'L1',
        color: C.amber,
        bg: C.amberSoft,
        border: C.amberBorder,
        description: 'Monthly OMES below threshold',
        icon: AlertTriangle,
    },
    2: {
        label: 'Taluka Head Escalation',
        short: 'L2',
        color: C.orange,
        bg: C.orangeSoft,
        border: C.orangeBorder,
        description: '3 consecutive months below threshold',
        icon: ShieldAlert,
    },
    3: {
        label: 'District Head Escalation',
        short: 'L3',
        color: C.red,
        bg: C.redSoft,
        border: C.redBorder,
        description: '5 consecutive months below threshold',
        icon: ShieldAlert,
    },
};

const DEFAULT_LEVEL = {
    label: 'Escalation',
    short: 'L?',
    color: C.red,
    bg: C.redSoft,
    border: C.redBorder,
    description: 'Threshold breach',
    icon: ShieldAlert,
};

/* ─── Corrective Action Modal ────────────────────────────── */
function ActionModal({
    escalation,
    onClose,
    onSuccess,
}: {
    escalation: any;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const submit = async () => {
        if (note.trim().length < 10) {
            setError('Please write at least 10 characters describing the action taken.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/escalations/${escalation._id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note, uploaded_by: 'State Admin' }),
            });
            if (!res.ok) throw new Error('Failed to submit');
            onSuccess();
            onClose();
        } catch {
            setError('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const lc = LEVEL_CONFIG[escalation.level as keyof typeof LEVEL_CONFIG] || DEFAULT_LEVEL;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(15,23,36,0.5)',
                zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: C.white, borderRadius: '16px', padding: '32px',
                    width: '100%', maxWidth: '540px', boxShadow: C.shadowMd,
                    border: `1px solid ${C.border}`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '680', color: C.text, letterSpacing: '-0.3px', marginBottom: '4px' }}>
                            Upload Corrective Action
                        </div>
                        <div style={{ fontSize: '14px', color: C.textSec }}>
                            {escalation.office_name} · <span style={{ color: lc.color, fontWeight: '500' }}>{lc.label}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, padding: '4px' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* OMES at trigger */}
                <div style={{ background: C.bg, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '24px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>OMES at Trigger</div>
                        <div style={{ fontSize: '20px', fontWeight: '680', color: C.red }}>{escalation.omes_at_trigger?.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Months Below</div>
                        <div style={{ fontSize: '20px', fontWeight: '680', color: C.text }}>{escalation.consecutive_months_below}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Threshold</div>
                        <div style={{ fontSize: '20px', fontWeight: '680', color: C.text }}>{escalation.threshold_used?.toFixed(1)}</div>
                    </div>
                </div>

                {/* Note textarea */}
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '560', color: C.text, marginBottom: '8px' }}>
                    Action Taken Note <span style={{ color: C.red }}>*</span>
                </label>
                <textarea
                    value={note}
                    onChange={(e) => { setNote(e.target.value); setError(''); }}
                    placeholder="Describe what corrective action was taken — e.g., Additional staff deployed, Queue management system upgraded, Staff sensitization training conducted..."
                    style={{
                        width: '100%', minHeight: '120px', padding: '12px',
                        border: `1px solid ${error ? C.red : C.border}`, borderRadius: '10px',
                        fontSize: '14px', color: C.text, fontFamily: 'inherit',
                        resize: 'vertical', outline: 'none', background: C.bg,
                        boxSizing: 'border-box',
                    }}
                />
                {error && <div style={{ fontSize: '13px', color: C.red, marginTop: '6px' }}>{error}</div>}

                {/* Footer */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 18px', border: `1px solid ${C.border}`, borderRadius: '9px',
                            background: C.white, color: C.textSec, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={submitting}
                        style={{
                            padding: '10px 20px', border: 'none', borderRadius: '9px',
                            background: C.blue, color: 'white', fontSize: '14px', fontWeight: '520',
                            cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: '7px',
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {submitting ? 'Submitting...' : 'Submit Action Note'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Escalation Card ────────────────────────────────────── */
function EscalationCard({
    esc,
    onAction,
}: {
    esc: any;
    onAction: (esc: any) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const lc = LEVEL_CONFIG[esc.level as keyof typeof LEVEL_CONFIG] || DEFAULT_LEVEL;
    const Icon = lc.icon;
    const triggeredDate = new Date(esc.triggered_at);

    const statusChip = () => {
        if (esc.status === 'resolved')
            return { label: 'Resolved', color: C.green, bg: C.greenSoft, border: C.greenBorder };
        if (esc.status === 'action_uploaded')
            return { label: 'Action Uploaded', color: C.blue, bg: C.blueSoft, border: '#BFDBFE' };
        return { label: 'Open', color: lc.color, bg: lc.bg, border: lc.border };
    };

    const chip = statusChip();

    return (
        <div
            style={{
                background: C.white,
                border: `1px solid #000000`,
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: C.shadow,
            }}
        >
            {/* Left level stripe */}
            <div style={{ display: 'flex' }}>
                <div style={{ width: '5px', background: lc.color, flexShrink: 0 }} />

                <div style={{ flex: 1, padding: '20px 24px' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Level badge */}
                            <div style={{
                                background: lc.bg, border: `1px solid ${lc.border}`,
                                borderRadius: '8px', padding: '6px 10px',
                                display: 'flex', alignItems: 'center', gap: '5px',
                            }}>
                                <Icon size={14} color={lc.color} />
                                <span style={{ fontSize: '12px', fontWeight: '640', color: lc.color }}>{lc.short}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '620', color: C.text, letterSpacing: '-0.2px' }}>
                                    {esc.office_name}
                                </div>
                                <div style={{ fontSize: '13px', color: C.textSec, marginTop: '2px' }}>
                                    {esc.district} · {esc.division} · {esc.department || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Status chip */}
                            <span style={{
                                background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
                                borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '520',
                            }}>
                                {chip.label}
                            </span>
                            {/* Expand toggle */}
                            <button
                                onClick={() => setExpanded(!expanded)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, padding: '4px' }}
                            >
                                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Metric strip */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>OMES</div>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: C.red, letterSpacing: '-0.5px' }}>{esc.omes_at_trigger?.toFixed(2)}</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', background: C.border }} />
                        <div>
                            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Consecutive Months</div>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: C.text, letterSpacing: '-0.5px' }}>{esc.consecutive_months_below}</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', background: C.border }} />
                        <div>
                            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Level</div>
                            <div style={{ fontSize: '14px', fontWeight: '580', color: lc.color }}>{lc.label}</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', background: C.border }} />
                        <div>
                            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Triggered</div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: C.text }}>{triggeredDate.toLocaleDateString()}</div>
                        </div>

                        {/* Action button — only for open escalations */}
                        {esc.status === 'open' && (
                            <button
                                onClick={() => onAction(esc)}
                                style={{
                                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px',
                                    padding: '9px 16px', background: C.blue, border: 'none', borderRadius: '9px',
                                    color: 'white', fontSize: '14px', fontWeight: '520', cursor: 'pointer',
                                    fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(11,108,245,0.25)',
                                }}
                            >
                                <Upload size={13} />
                                Upload Action
                            </button>
                        )}
                        {esc.status === 'resolved' && (
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: C.green, fontSize: '14px', fontWeight: '520' }}>
                                <CheckCircle2 size={15} />
                                Auto-resolved
                            </div>
                        )}
                    </div>

                    {/* Expanded: action note or description */}
                    {expanded && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${C.borderLight}` }}>
                            {esc.corrective_action_note ? (
                                <div style={{ background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: '10px', padding: '16px' }}>
                                    <div style={{ fontSize: '12px', color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '8px' }}>
                                        Corrective Action Note
                                    </div>
                                    <div style={{ fontSize: '15px', color: C.text, lineHeight: 1.55 }}>
                                        {esc.corrective_action_note}
                                    </div>
                                    <div style={{ fontSize: '12px', color: C.textSec, marginTop: '10px' }}>
                                        Uploaded by {esc.action_uploaded_by} · {new Date(esc.action_uploaded_at).toLocaleString()}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: C.bg, borderRadius: '10px', padding: '14px 16px', border: `1px solid ${C.border}` }}>
                                    <div style={{ fontSize: '13px', color: C.textSec }}>
                                        <strong>Why this escalation was raised: </strong>{lc.description}
                                    </div>
                                    <div style={{ fontSize: '13px', color: C.textSec, marginTop: '6px' }}>
                                        Office ID: <code style={{ background: C.borderLight, padding: '2px 6px', borderRadius: '4px' }}>{esc.office_id}</code>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function EscalationsPage() {
    const [escalations, setEscalations] = useState<any[]>([]);
    const [summary, setSummary] = useState({ openCount: 0, l4Count: 0, l3Count: 0, resolvedToday: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSweeping, setIsSweeping] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [actionTarget, setActionTarget] = useState<any | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifStats, setNotifStats] = useState({ total: 0, sentCount: 0, failedCount: 0 });
    // Demo trigger state
    const [showDemo, setShowDemo] = useState(false);
    const [demoOfficeId, setDemoOfficeId] = useState('');
    const [demoOmes, setDemoOmes] = useState(1.8);
    const [isTriggering, setIsTriggering] = useState(false);
    const [demoResult, setDemoResult] = useState<{ success: boolean; message: string } | null>(null);

    const fetchEscalations = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                ...(statusFilter ? { status: statusFilter } : {}),
                ...(levelFilter ? { level: levelFilter } : {}),
            });
            const res = await fetch(`/api/escalations?${q}`);
            const data = await res.json();
            setEscalations(data.escalations || []);
            setSummary(data.summary || { openCount: 0, l4Count: 0, l3Count: 0, resolvedToday: 0 });
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [page, statusFilter, levelFilter]);

    useEffect(() => { fetchEscalations(); }, [fetchEscalations]);
    useEffect(() => { setPage(1); }, [statusFilter, levelFilter]);

    // Fetch notification log on mount
    useEffect(() => {
        fetch('/api/escalations/notifications?limit=20')
            .then(r => r.json())
            .then(d => {
                setNotifications(d.notifications || []);
                setNotifStats({ total: d.total || 0, sentCount: d.sentCount || 0, failedCount: d.failedCount || 0 });
            })
            .catch(console.error);
    }, []);

    const runSweep = async () => {
        setIsSweeping(true);
        try {
            await fetch('/api/escalations/run', { method: 'POST' });
            await fetchEscalations();
            // Refresh notification log after sweep
            const nr = await fetch('/api/escalations/notifications?limit=20');
            const nd = await nr.json();
            setNotifications(nd.notifications || []);
            setNotifStats({ total: nd.total || 0, sentCount: nd.sentCount || 0, failedCount: nd.failedCount || 0 });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSweeping(false);
        }
    };

    const runDemoTrigger = async () => {
        if (!demoOfficeId.trim()) { setDemoResult({ success: false, message: 'Enter an Office ID first.' }); return; }
        setIsTriggering(true);
        setDemoResult(null);
        try {
            const res = await fetch('/api/escalations/demo-trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ office_id: demoOfficeId.trim(), omes: demoOmes }),
            });
            const data = await res.json();
            setDemoResult({ success: res.ok, message: data.message || data.error });
            if (res.ok) {
                await fetchEscalations();
                const nr = await fetch('/api/escalations/notifications?limit=20');
                const nd = await nr.json();
                setNotifications(nd.notifications || []);
                setNotifStats({ total: nd.total || 0, sentCount: nd.sentCount || 0, failedCount: nd.failedCount || 0 });
            }
        } catch (e: any) {
            setDemoResult({ success: false, message: e.message });
        } finally {
            setIsTriggering(false);
        }
    };

    const kpiCards = [
        {
            label: 'Open Escalations',
            value: summary.openCount,
            color: C.red,
            bg: C.redSoft,
            border: C.redBorder,
            icon: AlertTriangle,
        },
        {
            label: 'L3 — District Head',
            value: summary.l3Count,
            color: C.red,
            bg: C.redSoft,
            border: C.redBorder,
            icon: ShieldAlert,
        },
        {
            label: 'Resolved Today',
            value: summary.resolvedToday,
            color: C.green,
            bg: C.greenSoft,
            border: C.greenBorder,
            icon: CheckCircle2,
        },
    ];

    return (
        <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: C.textSec }}>Maharashtra</span>
                    <span style={{ color: C.border }}>›</span>
                    <span style={{ fontSize: '14px', color: C.blue, fontWeight: '500' }}>Escalation Engine</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '680', color: C.text, letterSpacing: '-0.6px', marginBottom: '6px' }}>
                            Escalation Control Centre
                        </h1>
                        <p style={{ fontSize: '16px', color: C.textSec }}>
                            Pattern-triggered, 3-level governance escalation system · Auto-resolved on OMES recovery
                        </p>
                    </div>
                    <button
                        onClick={runSweep}
                        disabled={isSweeping}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '10px 18px', background: isSweeping ? C.bg : C.blue,
                            border: isSweeping ? `1px solid ${C.border}` : 'none',
                            borderRadius: '10px', fontSize: '14px', fontWeight: '520',
                            color: isSweeping ? C.textSec : 'white',
                            cursor: isSweeping ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            boxShadow: isSweeping ? 'none' : '0 2px 8px rgba(11,108,245,0.25)',
                        }}
                    >
                        {isSweeping
                            ? <><Loader2 size={14} className="animate-spin" /> Running Sweep...</>
                            : <><RefreshCw size={14} /> Run Escalation Sweep</>
                        }
                    </button>
                </div>
            </div>

            {/* ── Demo Trigger Panel ───────────────────────── */}
            {/* 
            <div style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: '12px', marginBottom: '24px', overflow: 'hidden',
            }}>
                <button
                    onClick={() => { setShowDemo(!showDemo); setDemoResult(null); }}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', textAlign: 'left',
                    }}
                >
                    <Zap size={16} color={C.amber} />
                    <span style={{ fontSize: '14px', fontWeight: '580', color: '#92400E', flex: 1 }}>Demo Mode — Trigger Live Escalation</span>
                    {showDemo ? <ChevronUp size={14} color={C.amber} /> : <ChevronRight size={14} color={C.amber} />}
                </button>

                {showDemo && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #FDE68A' }}>
                        <p style={{ fontSize: '13px', color: '#92400E', margin: '14px 0 16px' }}>
                            Forces an office OMES below 3.0 and immediately raises an escalation + sends a live WhatsApp to your <code style={{ background: '#FEF3C7', padding: '1px 5px', borderRadius: '4px' }}>DEMO_NOTIFY_NUMBER</code>.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ fontSize: '12px', color: '#92400E', fontWeight: '560', display: 'block', marginBottom: '6px' }}>Office ID</label>
                                <input
                                    value={demoOfficeId}
                                    onChange={e => setDemoOfficeId(e.target.value)}
                                    placeholder="e.g. MH-PUN-COL-001"
                                    style={{
                                        width: '100%', padding: '9px 12px', borderRadius: '9px',
                                        border: '1px solid #FDE68A', background: C.white,
                                        fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div style={{ minWidth: '180px' }}>
                                <label style={{ fontSize: '12px', color: '#92400E', fontWeight: '560', display: 'block', marginBottom: '6px' }}>Force OMES to: <strong>{demoOmes.toFixed(1)}</strong></label>
                                <input
                                    type="range" min={0.5} max={2.9} step={0.1}
                                    value={demoOmes}
                                    onChange={e => setDemoOmes(parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: C.amber }}
                                />
                            </div>
                            <button
                                onClick={runDemoTrigger}
                                disabled={isTriggering}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                    padding: '10px 20px', background: C.amber, border: 'none',
                                    borderRadius: '9px', fontSize: '14px', fontWeight: '560',
                                    color: 'white', cursor: isTriggering ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit', opacity: isTriggering ? 0.7 : 1,
                                    boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {isTriggering ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                {isTriggering ? 'Triggering...' : 'Trigger Live Demo'}
                            </button>
                        </div>

                        {demoResult && (
                            <div style={{
                                marginTop: '14px', padding: '12px 16px', borderRadius: '9px',
                                background: demoResult.success ? C.greenSoft : C.redSoft,
                                border: `1px solid ${demoResult.success ? C.greenBorder : C.redBorder}`,
                                fontSize: '14px',
                                color: demoResult.success ? C.green : C.red,
                                fontWeight: '500',
                            }}>
                                {demoResult.success ? '✓ ' : '✗ '}{demoResult.message}
                                {demoResult.success && ' — Check your WhatsApp and scroll down for the notification log ↓'}
                            </div>
                        )}
                    </div>
                )}
            </div>
            */}

            {/* KPI Strip */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
                {kpiCards.map((k) => {
                    const KIcon = k.icon;
                    return (
                        <div
                            key={k.label}
                            style={{
                                flex: 1, background: k.bg, border: `1px solid ${k.border}`,
                                borderRadius: '12px', padding: '18px 20px', boxShadow: C.shadow,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div style={{ fontSize: '12px', color: k.color, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '580' }}>
                                    {k.label}
                                </div>
                                <KIcon size={15} color={k.color} />
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: k.value > 0 ? k.color : C.text, letterSpacing: '-0.8px' }}>
                                {k.value}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div style={{
                background: C.white, border: `2px solid ${C.border}`, borderRadius: '12px',
                padding: '14px 18px', marginBottom: '20px', boxShadow: C.shadow,
                display: 'flex', gap: '12px', alignItems: 'center',
            }}>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: '9px', fontSize: '15px', color: C.textSec,
                        cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '150px',
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="action_uploaded">Action Uploaded</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    style={{
                        padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: '9px', fontSize: '15px', color: C.textSec,
                        cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '160px',
                    }}
                >
                    <option value="">All Levels</option>
                    <option value="1">L1 — Office Head</option>
                    <option value="2">L2 — Taluka Head</option>
                    <option value="3">L3 — District Head</option>
                </select>

                <span style={{ fontSize: '14px', color: C.textSec, marginLeft: 'auto' }}>
                    {total} escalation{total !== 1 ? 's' : ''} found
                </span>
            </div>

            {/* Escalation List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isLoading ? (
                    <div style={{
                        padding: '60px', textAlign: 'center', color: C.textSec,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        background: C.white, border: `1px solid ${C.border}`, borderRadius: '14px',
                    }}>
                        <Loader2 size={24} className="animate-spin" color={C.blue} />
                        <span style={{ fontSize: '16px' }}>Loading escalations...</span>
                    </div>
                ) : escalations.length > 0 ? (
                    escalations.map((esc) => (
                        <EscalationCard key={esc._id} esc={esc} onAction={setActionTarget} />
                    ))
                ) : (
                    <div style={{
                        padding: '64px', textAlign: 'center',
                        background: C.white, border: `1px solid ${C.border}`, borderRadius: '14px',
                        boxShadow: C.shadow,
                    }}>
                        <ShieldCheck size={36} color={C.green} style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '18px', fontWeight: '600', color: C.text, marginBottom: '6px' }}>
                            No escalations
                        </div>
                        <div style={{ fontSize: '15px', color: C.textSec }}>
                            {statusFilter || levelFilter
                                ? 'No escalations match your current filters.'
                                : 'All offices are performing above the threshold. Run a sweep to re-evaluate.'
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '28px 0 0' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            style={{
                                width: '34px', height: '34px', borderRadius: '8px',
                                border: `1px solid ${p === page ? C.blue : C.border}`,
                                background: p === page ? C.blue : C.white,
                                color: p === page ? 'white' : C.textSec,
                                fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Corrective Action Modal */}
            {actionTarget && (
                <ActionModal
                    escalation={actionTarget}
                    onClose={() => setActionTarget(null)}
                    onSuccess={fetchEscalations}
                />
            )}

            {/* ── WhatsApp Notification Log ─────────────────── */}
            <div style={{ marginTop: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px', height: '34px', background: '#DCFCE7',
                            borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Smartphone size={16} color={C.green} />
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: '660', color: C.text, letterSpacing: '-0.3px' }}>Email Notification Log</div>
                            <div style={{ fontSize: '13px', color: C.textSec }}>Escalation alerts dispatched to officials via email</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: C.green }}>{notifStats.sentCount}</div>
                            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivered</div>
                        </div>
                        <div style={{ width: '1px', background: C.border }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: C.red }}>{notifStats.failedCount}</div>
                            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Failed</div>
                        </div>
                        <div style={{ width: '1px', background: C.border }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: C.text }}>{notifStats.total}</div>
                            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: C.white, border: '1px solid #000000',
                    borderRadius: '14px', overflow: 'hidden', boxShadow: C.shadow,
                }}>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: C.textSec }}>
                            <MessageSquare size={28} color={C.border} style={{ marginBottom: '10px' }} />
                            <div style={{ fontSize: '16px', fontWeight: '500', color: C.text, marginBottom: '4px' }}>No notifications yet</div>
                            <div style={{ fontSize: '14px' }}>Run an Escalation Sweep to fire live WhatsApp alerts to officials.</div>
                        </div>
                    ) : (
                        notifications.map((n: any, idx) => (
                            <div
                                key={n._id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '36px 2fr 1.2fr 1fr 1fr 100px',
                                    padding: '14px 24px',
                                    alignItems: 'center',
                                    gap: '16px',
                                    borderBottom: idx < notifications.length - 1 ? '1px solid #000000' : 'none',
                                    background: n.status === 'sent' ? C.white : C.redSoft,
                                }}
                            >
                                {/* Channel icon */}
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: '8px',
                                    background: n.status === 'sent' ? C.greenSoft : C.redSoft,
                                    border: `1px solid ${n.status === 'sent' ? C.greenBorder : C.redBorder}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {n.status === 'sent'
                                        ? <CheckCheck size={15} color={C.green} />
                                        : <XCircle size={15} color={C.red} />
                                    }
                                </div>

                                {/* Office + level */}
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '540', color: C.text, letterSpacing: '-0.1px' }}>{n.office_name}</div>
                                    <div style={{ fontSize: '12px', color: C.textSec, marginTop: '2px' }}>
                                        L{n.level} → {n.recipient_label}
                                    </div>
                                </div>

                                {/* Recipient email */}
                                <div style={{ fontSize: '13px', color: C.textSec }}>
                                    {n.recipient_number}
                                </div>

                                {/* Message ID */}
                                <div style={{ fontSize: '11px', color: C.textSec, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {n.twilio_sid ? n.twilio_sid.slice(0, 20) + '…' : '—'}
                                </div>

                                {/* Timestamp */}
                                <div style={{ fontSize: '12px', color: C.textSec }}>
                                    {new Date(n.sent_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {/* Status chip */}
                                <div>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '540',
                                        background: n.status === 'sent' ? C.greenSoft : C.redSoft,
                                        color: n.status === 'sent' ? C.green : C.red,
                                        border: `1px solid ${n.status === 'sent' ? C.greenBorder : C.redBorder}`,
                                    }}>
                                        {n.status === 'sent' ? '✓ Delivered' : '✗ Failed'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
