"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Award,
  AlertTriangle,
  ArrowDownRight,
  List,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Building2,
  BarChart3,
  Clock,
  Sparkles,
} from "lucide-react";

// ── Design Tokens ─────────────────────────────────────────────────────────────

const C = {
  blue: "#0B6CF5",
  blueDeep: "#0950c4",
  blueSoft: "#EAF2FF",
  blueMid: "#BFDBFE",
  bg: "#F7F9FB",
  white: "#FFFFFF",
  text: "#0F1724",
  textSec: "#334155",
  textMuted: "#94A3B8",
  border: "#E8EDF3",
  borderLight: "#F0F4F8",
  shadow: "0 1px 3px rgba(15,23,36,0.05), 0 1px 2px rgba(15,23,36,0.03)",
  shadowMd: "0 4px 16px rgba(15,23,36,0.07)",
  shadowLg: "0 8px 30px rgba(15,23,36,0.08)",
  green: "#10B981",
  greenSoft: "#ECFDF5",
  greenMid: "#A7F3D0",
  red: "#EF4444",
  redSoft: "#FEF2F2",
  redMid: "#FECACA",
  amber: "#F59E0B",
  amberSoft: "#FFFBEB",
  amberMid: "#FDE68A",
  gold: "#EAB308",
  goldSoft: "#FEFCE8",
  purple: "#8B5CF6",
  purpleSoft: "#F5F3FF",
};

// ── Report Type Metadata ──────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: 1, label: "5★ Last Month",     shortLabel: "5★ × 1",  icon: Star,           color: C.gold,   bg: C.goldSoft,   border: "#FDE68A", desc: "Offices with ≥4.5 avg rating" },
  { id: 2, label: "5★ × 2 Months",     shortLabel: "5★ × 2",  icon: Award,          color: C.green,  bg: C.greenSoft,  border: C.greenMid, desc: "Consistent 2-month streak" },
  { id: 3, label: "5★ × 3 Months",     shortLabel: "5★ × 3",  icon: Sparkles,       color: C.blue,   bg: C.blueSoft,   border: C.blueMid, desc: "Outstanding 3-month streak" },
  { id: 4, label: "<3★ Sustained 3-6 Months",     shortLabel: "<3★",     icon: AlertTriangle,  color: C.red,    bg: C.redSoft,    border: C.redMid, desc: "Below 3★ for 3–6 months" },
  { id: 5, label: "3★→<3★ Declining",  shortLabel: "Decline", icon: ArrowDownRight, color: C.amber,  bg: C.amberSoft,  border: C.amberMid, desc: "Dropped from ≥3 to <3" },
  { id: 6, label: "Master Report",     shortLabel: "All",     icon: List,           color: C.purple, bg: C.purpleSoft, border: "#DDD6FE", desc: "All offices — full searchable view" },
];

interface ReportEntry {
  office_id: string;
  office_name: string;
  district: string;
  region: string;
  taluka: string;
  department: string;
  avg_rating: number;
  submission_count: number;
  service_breakdown: Record<string, number>;
  consecutive_months: number;
  trend: "improving" | "stable" | "declining";
}

interface ReportResponse {
  entries: ReportEntry[];
  summary: { total_offices: number; avg_rating: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
  month: string;
  report_type: number;
  generated_at?: string;
  available_months: string[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeType, setActiveType] = useState(6);
  const [month, setMonth] = useState("");
  const [district, setDistrict] = useState("");
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState(0);
  const [serviceFilter, setServiceFilter] = useState("");
  const [sortField, setSortField] = useState("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  // Fetch
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", String(activeType));
      if (month) params.set("month", month);
      if (district) params.set("district", district);
      if (search) params.set("search", search);
      if (starFilter > 0) params.set("star", String(starFilter));
      if (serviceFilter) params.set("service", serviceFilter);
      params.set("sort", sortField);
      params.set("order", sortOrder);
      params.set("page", String(page));
      params.set("limit", "50");
      const res = await fetch(`/api/reports?${params.toString()}`);
      const json: ReportResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  }, [activeType, month, district, search, starFilter, serviceFilter, sortField, sortOrder, page]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useEffect(() => { setPage(1); }, [activeType, month, district, search, starFilter, serviceFilter]);

  // Generate
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const params = new URLSearchParams();
      if (month) params.set("month", month);
      await fetch(`/api/cron/monthly-reports?${params.toString()}`);
      await fetchReport();
    } catch (err) {
      console.error("Failed to generate reports", err);
    } finally {
      setGenerating(false);
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (!data?.entries.length) return;
    const headers = ["Office ID", "Office Name", "District", "Region", "Taluka", "Department", "Avg Rating", "Submissions", "Trend", "Consecutive Months"];
    const rows = data.entries.map(e => [
      e.office_id, e.office_name, e.district, e.region, e.taluka, e.department,
      e.avg_rating, e.submission_count, e.trend, e.consecutive_months,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_type${activeType}_${data.month || "latest"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sort
  const toggleSort = (field: string) => {
    if (sortField === field) setSortOrder(o => (o === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("desc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown size={11} style={{ opacity: 0.25 }} />;
    return sortOrder === "desc" ? <ChevronDown size={11} color={C.blue} /> : <ChevronUp size={11} color={C.blue} />;
  };

  // Trend badge
  const TrendBadge = ({ trend }: { trend: string }) => {
    const cfg = trend === "improving"
      ? { icon: TrendingUp, color: C.green, bg: C.greenSoft, label: "Improving" }
      : trend === "declining"
        ? { icon: TrendingDown, color: C.red, bg: C.redSoft, label: "Declining" }
        : { icon: Minus, color: C.textMuted, bg: C.bg, label: "Stable" };
    const Icon = cfg.icon;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "520", color: cfg.color, background: cfg.bg }}>
        <Icon size={11} /> {cfg.label}
      </span>
    );
  };

  // Star display
  const StarRating = ({ rating }: { rating: number }) => {
    const color = rating >= 4.5 ? C.green : rating >= 3 ? C.amber : C.red;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontWeight: "650", color, fontSize: "15px", letterSpacing: "-0.3px" }}>
          {rating.toFixed(1)}
        </span>
        <Star size={12} fill={color} color={color} style={{ marginBottom: "1px" }} />
      </div>
    );
  };

  const activeMeta = REPORT_TYPES.find(r => r.id === activeType)!;
  const ActiveIcon = activeMeta.icon;

  return (
    <div style={{ padding: "36px 44px", maxWidth: "1500px", margin: "0 auto", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", color: C.textMuted }}>Maharashtra</span>
          <span style={{ color: C.border }}>›</span>
          <span style={{ fontSize: "13px", color: C.blue, fontWeight: "520" }}>Monthly Reports</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: C.text, letterSpacing: "-0.7px", marginBottom: "4px", lineHeight: 1.2 }}>
              Monthly Office Reports
            </h1>
            <p style={{ fontSize: "14.5px", color: C.textSec, lineHeight: 1.4 }}>
              Auto-generated performance snapshots · Filterable by district, office, service, and star rating
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", background: C.white, border: `1px solid ${C.border}`,
                borderRadius: "9px", cursor: generating ? "default" : "pointer",
                fontSize: "13.5px", fontWeight: "520", color: C.text, fontFamily: "inherit",
                opacity: generating ? 0.6 : 1, transition: "all 0.15s",
                boxShadow: C.shadow,
              }}
            >
              <RefreshCw size={13} style={generating ? { animation: "spin 1s linear infinite" } : {}} />
              {generating ? "Generating…" : "Generate"}
            </button>
            <button
              onClick={exportCSV}
              disabled={!data?.entries.length}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDeep} 100%)`,
                border: "none", borderRadius: "9px",
                cursor: data?.entries.length ? "pointer" : "default",
                fontSize: "13.5px", fontWeight: "520", color: "white", fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(11,108,245,0.25)",
                opacity: data?.entries.length ? 1 : 0.5, transition: "all 0.15s",
              }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── Report Type Cards (horizontal) ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "20px" }}>
        {REPORT_TYPES.map(rt => {
          const Icon = rt.icon;
          const isActive = activeType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setActiveType(rt.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                padding: "14px 16px", borderRadius: "12px",
                border: isActive ? `2px solid ${rt.border}` : `1px solid ${C.border}`,
                background: isActive ? rt.bg : C.white,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s", textAlign: "left",
                boxShadow: isActive ? C.shadowMd : C.shadow,
                transform: isActive ? "translateY(-1px)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "7px",
                  background: isActive ? rt.color : C.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  <Icon size={12} color={isActive ? "white" : rt.color} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: isActive ? "620" : "480", color: isActive ? rt.color : C.textSec, letterSpacing: "-0.1px" }}>
                  {rt.label}
                </span>
              </div>
              <span style={{ fontSize: "11px", color: C.textMuted, lineHeight: 1.3 }}>{rt.desc}</span>
            </button>
          );
        })}
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center",
        background: C.white, border: `1px solid ${C.border}`, borderRadius: "11px",
        padding: "12px 16px", boxShadow: C.shadow,
      }}>
        <Filter size={13} color={C.textMuted} style={{ marginRight: "2px" }} />

        <select
          value={month || (data?.month ?? "")}
          onChange={e => setMonth(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "7px", border: `1px solid ${C.border}`, fontSize: "13px", color: C.text, fontFamily: "inherit", background: C.bg, cursor: "pointer", outline: "none" }}
        >
          {data?.available_months?.length ? (
            data.available_months.map(m => <option key={m} value={m}>{m}</option>)
          ) : (
            <option value="">No data</option>
          )}
        </select>

        <input
          type="text" placeholder="District…" value={district}
          onChange={e => setDistrict(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "7px", border: `1px solid ${C.border}`, fontSize: "13px", color: C.text, fontFamily: "inherit", width: "110px", background: C.bg, outline: "none" }}
        />

        <select
          value={starFilter} onChange={e => setStarFilter(Number(e.target.value))}
          style={{ padding: "6px 10px", borderRadius: "7px", border: `1px solid ${C.border}`, fontSize: "13px", color: C.text, fontFamily: "inherit", background: C.bg, cursor: "pointer", outline: "none" }}
        >
          <option value={0}>All Ratings</option>
          <option value={4.5}>≥ 4.5★</option>
          <option value={4}>≥ 4★</option>
          <option value={3}>≥ 3★</option>
          <option value={2}>≥ 2★</option>
        </select>

        <input
          type="text" placeholder="Service…" value={serviceFilter}
          onChange={e => setServiceFilter(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "7px", border: `1px solid ${C.border}`, fontSize: "13px", color: C.text, fontFamily: "inherit", width: "100px", background: C.bg, outline: "none" }}
        />

        <div style={{ flex: 1, minWidth: "160px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "7px", border: `1px solid ${C.border}`, background: C.bg }}>
          <Search size={13} color={C.textMuted} />
          <input
            type="text" placeholder="Search office name or ID…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: C.text, fontFamily: "inherit", width: "100%" }}
          />
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "18px" }}>
        {[
          {
            label: "Report Type", icon: ActiveIcon,
            value: activeMeta.label,
            accent: activeMeta.color, accentBg: activeMeta.bg,
          },
          {
            label: "Offices in Report", icon: Building2,
            value: String(data?.summary.total_offices ?? "–"),
            accent: C.blue, accentBg: C.blueSoft,
          },
          {
            label: "Average Rating", icon: Star,
            value: data?.summary.avg_rating ? `${data.summary.avg_rating.toFixed(1)}★` : "–",
            accent: (data?.summary.avg_rating ?? 0) >= 4 ? C.green : (data?.summary.avg_rating ?? 0) >= 3 ? C.amber : C.red,
            accentBg: (data?.summary.avg_rating ?? 0) >= 4 ? C.greenSoft : (data?.summary.avg_rating ?? 0) >= 3 ? C.amberSoft : C.redSoft,
          },
          {
            label: "Generated", icon: Clock,
            value: data?.generated_at ? new Date(data.generated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "–",
            accent: C.purple, accentBg: C.purpleSoft,
          },
        ].map(card => {
          const CardIcon = card.icon;
          return (
            <div key={card.label} style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px",
              padding: "16px 18px", boxShadow: C.shadow, transition: "box-shadow 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "6px", background: card.accentBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CardIcon size={11} color={card.accent} />
                </div>
                <span style={{ fontSize: "12px", color: C.textMuted, fontWeight: "500", letterSpacing: "0.01em" }}>{card.label}</span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "680", color: C.text, letterSpacing: "-0.4px" }}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────────── */}
      <div style={{
        background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px",
        overflow: "hidden", boxShadow: C.shadow,
      }}>
        {/* Table header bar */}
        <div style={{
          padding: "13px 20px", borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(135deg, ${C.bg} 0%, #ffffff 100%)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={14} color={activeMeta.color} />
            <span style={{ fontSize: "14px", fontWeight: "600", color: C.text, letterSpacing: "-0.2px" }}>
              {activeMeta.label}
            </span>
            {data?.month && (
              <span style={{ fontSize: "12px", color: C.textMuted, background: C.bg, padding: "2px 8px", borderRadius: "12px", border: `1px solid ${C.border}` }}>
                {data.month}
              </span>
            )}
          </div>
          <span style={{ fontSize: "12.5px", color: C.textMuted }}>
            {data?.pagination.total ?? 0} {(data?.pagination.total ?? 0) === 1 ? "office" : "offices"}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.borderLight}` }}>
                {[
                  { key: "name", label: "Office", width: "28%" },
                  { key: "district", label: "District", width: "18%" },
                  { key: "rating", label: "Rating", width: "10%" },
                  { key: "submissions", label: "Submissions", width: "12%" },
                  { key: "", label: "Trend", width: "12%" },
                  { key: "", label: "Services", width: "20%" },
                  ...(activeType >= 2 && activeType <= 5 ? [{ key: "", label: "Streak", width: "8%" }] : []),
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={col.key ? () => toggleSort(col.key) : undefined}
                    style={{
                      padding: "10px 16px", textAlign: "left", fontWeight: "560",
                      color: C.textMuted, fontSize: "11.5px", letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      cursor: col.key ? "pointer" : "default", userSelect: "none",
                      whiteSpace: "nowrap", width: col.width, background: C.bg,
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      {col.label} {col.key && <SortIcon field={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "70px 0", textAlign: "center", color: C.textMuted }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <RefreshCw size={22} style={{ animation: "spin 1s linear infinite", color: C.blue }} />
                      <span style={{ fontSize: "14px" }}>Loading reports…</span>
                    </div>
                  </td>
                </tr>
              ) : !data?.entries.length ? (
                <tr>
                  <td colSpan={7} style={{ padding: "70px 0", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "12px", background: C.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <FileText size={22} color={C.textMuted} />
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "540", color: C.text, marginBottom: "4px" }}>No report data</div>
                        <div style={{ fontSize: "13px", color: C.textMuted }}>Click &quot;Generate&quot; to create reports for this month</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                data.entries.map((entry) => (
                  <tr
                    key={entry.office_id}
                    style={{ borderBottom: `1px solid ${C.borderLight}`, transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFBFD")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontWeight: "540", color: C.text, marginBottom: "2px", fontSize: "13.5px", lineHeight: 1.3 }}>{entry.office_name}</div>
                      <div style={{ fontSize: "11.5px", color: C.textMuted, fontFamily: "var(--font-geist-mono)" }}>{entry.office_id}</div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ color: C.text, fontSize: "13.5px" }}>{entry.district}</div>
                      {(entry.region || entry.taluka) && (
                        <div style={{ fontSize: "11.5px", color: C.textMuted }}>
                          {[entry.region, entry.taluka].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <StarRating rating={entry.avg_rating} />
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontWeight: "560", color: C.text, fontSize: "14px" }}>
                        {entry.submission_count}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <TrendBadge trend={entry.trend} />
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {Object.entries(entry.service_breakdown || {}).slice(0, 3).map(([svc, avg]) => (
                          <span
                            key={svc}
                            title={`${svc}: ${avg}★`}
                            style={{
                              padding: "2px 8px", borderRadius: "10px", fontSize: "11px",
                              background: C.blueSoft, color: C.blue, fontWeight: "500",
                              whiteSpace: "nowrap", border: `1px solid ${C.blueMid}`,
                            }}
                          >
                            {svc}
                          </span>
                        ))}
                        {Object.keys(entry.service_breakdown || {}).length === 0 && (
                          <span style={{ fontSize: "11px", color: C.textMuted, fontStyle: "italic" }}>—</span>
                        )}
                      </div>
                    </td>
                    {(activeType >= 2 && activeType <= 5) && (
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
                          fontWeight: "560", background: activeMeta.bg, color: activeMeta.color,
                          border: `1px solid ${activeMeta.border}`,
                        }}>
                          {entry.consecutive_months} mo
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {data && data.pagination.totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 18px", borderTop: `1px solid ${C.border}`, background: C.bg,
          }}>
            <span style={{ fontSize: "12.5px", color: C.textMuted }}>
              {((data.pagination.page - 1) * data.pagination.limit) + 1}–{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
            </span>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "30px", height: "30px",
                  border: `1px solid ${C.border}`, borderRadius: "7px", background: C.white,
                  cursor: page <= 1 ? "default" : "pointer", fontFamily: "inherit",
                  opacity: page <= 1 ? 0.35 : 1, transition: "all 0.1s",
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ padding: "0 10px", fontSize: "13px", fontWeight: "540", color: C.text }}>
                {data.pagination.page} / {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page >= data.pagination.totalPages}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "30px", height: "30px",
                  border: `1px solid ${C.border}`, borderRadius: "7px", background: C.white,
                  cursor: page >= data.pagination.totalPages ? "default" : "pointer", fontFamily: "inherit",
                  opacity: page >= data.pagination.totalPages ? 0.35 : 1, transition: "all 0.1s",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
