"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MessageSquare, AlertTriangle, Lightbulb, MapPin, Loader2, Sparkles, Languages, CheckCircle2, ChevronUp, ChevronRight, Clock } from 'lucide-react';

const C = {
    blue: '#0B6CF5',
    blueMid: '#93C5FD',
    blueSoft: '#EFF6FF',
    bg: '#F7F9FB',
    white: '#FFFFFF',
    text: '#0F1724',
    textSec: '#334155',
    border: '#E8EDF3',
    borderLight: '#F0F4F8',
    shadow: '0 1px 4px rgba(15,23,36,0.06), 0 1px 2px rgba(15,23,36,0.04)',
    green: '#10B981',
    greenSoft: '#ECFDF5',
    greenBorder: '#A7F3D0',
    red: '#EF4444',
    redSoft: '#FEF2F2',
    redBorder: '#FECACA',
    yellow: '#F59E0B',
    yellowSoft: '#FFFBEB',
    yellowBorder: '#FDE68A',
    amberSoft: '#FFFBEB',
    amberBorder: '#FDE68A'
};

/* ─── Feedback Card Component ────────────────────────────── */
function FeedbackCard({ session }: { session: any }) {
    const [expanded, setExpanded] = useState(false);
    const sColor = getSentimentColors(session.ai_analysis?.sentiment);
    const rawText = getRawText(session.answers);
    const dt = new Date(session.created_at);

    // Helpers locally or passed down
    const flowIcon = getFlowIcon(session.answers?.flow_choice);
    const flowLabel = getFlowLabel(session.answers?.flow_choice);

    return (
        <div style={{
            background: C.white,
            borderRadius: '12px',
            border: `1px solid ${C.border}`,
            boxShadow: C.shadow,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Main Key Info Row */}
            <div style={{ display: 'flex' }}>
                {/* Indicator Line */}
                <div style={{ width: '5px', background: sColor.text, flexShrink: 0 }} />

                <div style={{ flex: 1, padding: '16px 20px 16px 16px' }}>
                    {/* Header: Office, Flow, Date | Right: Rating, Sentiment, Chevron */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {/* Icon Box */}
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px', background: C.blue,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                {flowIcon}
                            </div>
                            
                            <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '650', color: C.text, margin: 0 }}>
                                        {session.office_name}
                                    </h3>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: C.blue }}>
                                        {flowLabel}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.textSec, marginTop: '2px' }}>
                                    <Clock size={11} />
                                    {dt.toLocaleDateString()} at {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {session.answers?.rating && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '4px 8px', background: '#FEF3C7', border: '1px solid #FDE68A',
                                    borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#D97706'
                                }}>
                                    <span>★</span> {session.answers.rating}/5
                                </div>
                            )}

                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: sColor.bg, border: `1px solid ${sColor.border}`,
                                padding: '4px 10px', borderRadius: '6px'
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sColor.text }} />
                                <span style={{ fontSize: '13px', fontWeight: '600', color: sColor.text, textTransform: 'capitalize' }}>
                                    {session.ai_analysis?.sentiment || 'Neutral'}
                                    {session.ai_analysis?.confidence ? ` (${session.ai_analysis.confidence}%)` : ''}
                                </span>
                            </div>

                            <button
                                onClick={() => setExpanded(!expanded)}
                                style={{
                                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: C.bg, border: `1px solid ${C.border}`, borderRadius: '6px',
                                    cursor: 'pointer', color: C.textSec
                                }}
                            >
                                {expanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Collapsed View: Raw Text Snippet & Tags */}
                    <div style={{ background: C.bg, borderRadius: '8px', padding: '10px 14px', border: `1px solid ${C.borderLight}` }}>
                        <div style={{ fontSize: '14px', color: C.text, lineHeight: 1.5 }}>
                            <span style={{ fontWeight: '600', color: C.textSec, marginRight: '6px', fontSize: '12px', textTransform: 'uppercase' }}>RAW:</span>
                            {expanded ? rawText : (rawText.length > 140 ? rawText.substring(0, 140) + '...' : rawText)}
                        </div>
                    </div>

                    {/* Keyword Tags */}
                    {session.ai_analysis?.keywords && session.ai_analysis.keywords.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {session.ai_analysis.keywords.map((k: string, i: number) => (
                                <span key={i} style={{
                                    fontSize: '12px', color: C.textSec, background: C.white,
                                    border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: '4px',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    # {k}
                                </span>
                            ))}
                            {session.ai_analysis?.themes?.map((t: string, i: number) => (
                                <span key={`t-${i}`} style={{
                                    fontSize: '12px', color: C.blue, background: C.blueSoft,
                                    border: `1px solid ${C.blueMid}40`, padding: '2px 8px', borderRadius: '10px',
                                    fontWeight: '500'
                                }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div style={{
                    padding: '0 20px 20px 20px',
                    marginLeft: '5px', // offset for the left border
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    <div style={{ height: '1px', background: C.border, marginBottom: '16px' }} />
                    
                    <div style={{ display: 'grid', gap: '16px' }}>
                        
                        {/* AI Translation */}
                        {session.ai_analysis?.translated_text && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '6px', background: '#F3E8FF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Sparkles size={16} color="#9333EA" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '650', color: '#9333EA', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        AI Translation
                                    </div>
                                    <div style={{ fontSize: '14px', color: C.text, lineHeight: 1.5 }}>
                                        {session.ai_analysis.translated_text}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actionable Recommendation */}
                        {session.ai_analysis?.reform_recommendation && (
                            <div style={{ 
                                display: 'flex', gap: '12px', 
                                background: '#ECFDF5', padding: '12px', borderRadius: '8px', 
                                border: `1px solid ${C.greenBorder}`
                            }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '6px', background: C.green,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    color: 'white'
                                }}>
                                    <Lightbulb size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '650', color: C.green, textTransform: 'uppercase', marginBottom: '4px' }}>
                                        Actionable Recommendation
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#064E3B', lineHeight: 1.5, fontWeight: '500' }}>
                                        {session.ai_analysis.reform_recommendation}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Extra Metadata Grid */}
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
                            {session.answers?.process_name && (
                                <div style={{ fontSize: '13px' }}>
                                    <span style={{ color: C.textSec }}>Process:</span> <span style={{ fontWeight: '500' }}>{session.answers.process_name}</span>
                                </div>
                            )}
                            {session.answers?.scheme_name && (
                                <div style={{ fontSize: '13px' }}>
                                    <span style={{ color: C.textSec }}>Scheme:</span> <span style={{ fontWeight: '500' }}>{session.answers.scheme_name}</span>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default function LiveFeedback() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState('');
    const [flowFilter, setFlowFilter] = useState('');

    const fetchFeedback = async () => {
        try {
            setIsLoading(true);
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
                sentiment: sentimentFilter,
                flow: flowFilter
            });

            const res = await fetch(`/api/feedback?${query.toString()}`);
            const data = await res.json();
            setSessions(data.sessions || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [page, search, sentimentFilter, flowFilter]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [search, sentimentFilter, flowFilter]);

    // Helpers need to be available to FeedbackCard, so we define them outside or simply keep them here and pass them?
    // Since FeedbackCard is defined inside the filescope but outside the component loop, we need to extract the helpers to file scope.
    // I will do that in the "oldString" replacement block to ensure they are available.
    
    // ... (rest of the component structure)
    
    return (
        <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', overflowX: 'auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: C.textSec }}>Maharashtra</span>
                    <span style={{ color: C.border }}>›</span>
                    <span style={{ fontSize: '14px', color: C.blue, fontWeight: '500' }}>AI Live Feed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '680', color: C.text, letterSpacing: '-0.6px', marginBottom: '6px' }}>
                            Live Citizen Feedback
                        </h1>
                        <p style={{ fontSize: '14px', color: C.textSec }}>
                            Real-time WhatsApp submissions enriched with NLP Sentiment & Suggestions
                        </p>
                    </div>
                    {/* ... Export Button ... */}
                     <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '9px 16px', background: C.blue, border: 'none',
                                borderRadius: '9px', fontSize: '14px', color: '#FFFFFF',
                                fontWeight: '520', cursor: 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: '0 2px 8px rgba(11,108,245,0.25)',
                            }}
                        >
                            <Download size={13} />
                            Export Feed
                        </button>
                    </div>
                </div>
            </div>

            {/* Constraints Tool Bar */}
            <div
                style={{
                    background: C.white, border: `2px solid ${C.border}`, borderRadius: '12px',
                    padding: '12px 16px', marginBottom: '20px', boxShadow: C.shadow,
                    display: 'flex', gap: '12px', alignItems: 'center',
                }}
            >
               {/* ... Filters (search, select) with reduced padding/font ... */}
               <div
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                        background: C.bg, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '8px 12px',
                    }}
                >
                    <Search size={14} color={C.textSec} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search raw feedback, office, or keywords…"
                        style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            fontSize: '14px', color: C.text, fontFamily: 'inherit',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Filter size={13} color={C.textSec} />
                </div>

                <select
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    style={{
                        padding: '8px 12px', background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: '9px', fontSize: '14px', color: sentimentFilter ? C.text : C.textSec,
                        cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '140px',
                    }}
                >
                    <option value="">All Sentiments</option>
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                </select>

                <select
                    value={flowFilter}
                    onChange={(e) => setFlowFilter(e.target.value)}
                    style={{
                        padding: '8px 12px', background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: '9px', fontSize: '14px', color: flowFilter ? C.text : C.textSec,
                        cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '160px',
                    }}
                >
                    <option value="">All Feedback Types</option>
                    <option value="1">Office Experience</option>
                    <option value="2">Policy Suggestion</option>
                    <option value="3">Process Reform</option>
                </select>
            </div>

            {/* Real-Time Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isLoading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: C.textSec, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px' }}>
                        <Loader2 size={24} className="animate-spin" color={C.blue} />
                        <span style={{ fontSize: '14px' }}>Parsing latest submissions...</span>
                    </div>
                ) : sessions.length > 0 ? (
                    sessions.map((session: any) => (
                        <FeedbackCard key={session._id} session={session} />
                    ))
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: C.textSec }}>No feedback found.</div>
                )}
            </div>
            
             {/* Pagination (Simplified) */}
             {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px' }}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', cursor: 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
                    <span style={{ padding: '8px' }}>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', cursor: 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
                </div>
            )}
        </div>
    );
}

// Helpers moved to file scope
const getFlowIcon = (flowChoice: number) => {
    switch (flowChoice) {
        case 1: return <MapPin size={16} color="white" />; // Changed color for the blue box
        case 2: return <Lightbulb size={16} color="white" />;
        case 3: return <AlertTriangle size={16} color="white" />;
        default: return <MessageSquare size={16} color="white" />;
    }
};

const getFlowLabel = (flowChoice: number) => {
    switch (flowChoice) {
        case 1: return 'Office Experience';
        case 2: return 'Policy Suggestion';
        case 3: return 'Process Reform';
        default: return 'External Feedback';
    }
};

const getSentimentColors = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
        case 'negative': return { bg: C.redSoft, border: C.redBorder, text: '#B91C1C' };
        case 'positive': return { bg: C.greenSoft, border: C.greenBorder, text: '#15803D' };
        case 'neutral': return { bg: C.amberSoft, border: C.amberBorder, text: '#D97706' }; // Changed to amber for better contrast
        default: return { bg: C.bg, border: C.border, text: C.textSec };
    }
};

const getRawText = (answers: any) => {
    if (!answers) return "No text provided.";
    if (answers.feedback) return answers.feedback; 
    if (answers.scheme_suggestion) return answers.scheme_suggestion;
    if (answers.process_suggestion) return answers.process_suggestion;
    return "Structured choices only (No free-text).";
};



