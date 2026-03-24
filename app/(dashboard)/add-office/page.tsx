"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Plus, X, Building2, QrCode, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const steps = [
  { id: 1, label: 'Office Details' },
  { id: 2, label: 'Identifiers' },
  { id: 3, label: 'Services & Hours' },
  { id: 4, label: 'Review & QR' },
];

const allServices = [
  'Income Certificate',
  'Domicile Certificate',
  'Land Records',
  'Birth Certificate',
  'Death Certificate',
  'Caste Certificate',
  'Ration Card',
  'Non-Creamy Layer Certificate',
];

/* Drop local QRCodeSVG since we use the official API */

/* ─── Field Component ────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontSize: '14.5px',
          fontWeight: '560',
          color: C.text,
          letterSpacing: '-0.1px',
        }}
      >
        {label}
        {required && <span style={{ color: '#E11D48', marginLeft: '3px' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '10px 14px',
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: '9px',
          fontSize: '15.5px',
          color: C.text,
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
          letterSpacing: '-0.1px',
        }}
        onFocus={(e) => (e.target.style.borderColor = C.blue)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />
      {hint && <span style={{ fontSize: '13.5px', color: C.textSec }}>{hint}</span>}
    </div>
  );
}

function ComboboxField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  const listId = `list-${label.replace(/\s+/g, '-')}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '14.5px', fontWeight: '560', color: C.text, letterSpacing: '-0.1px' }}>
        {label}
        {required && <span style={{ color: '#E11D48', marginLeft: '3px' }}>*</span>}
      </label>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type or select...'}
        style={{
          padding: '10px 14px',
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: '9px',
          fontSize: '15.5px',
          color: C.text,
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
          letterSpacing: '-0.1px',
        }}
        onFocus={(e) => (e.target.style.borderColor = C.blue)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '14.5px', fontWeight: '560', color: C.text, letterSpacing: '-0.1px' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '10px 14px',
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: '9px',
          fontSize: '15.5px',
          color: value ? C.text : C.textSec,
          outline: 'none',
          fontFamily: 'inherit',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235B6472' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AddOffice() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdOffice, setCreatedOffice] = useState<any>(null);

  const [form, setForm] = useState({
    officeName: '',
    department: '',
    officeType: '',
    district: '',
    division: '',
    digipin: '',
    treasuryCode: '',
    services: [] as string[],
    expectedVisitors: '',
    workingHoursFrom: '',
    workingHoursTo: '',
    guardianSecretary: '',
    officeHeadName: '',
    officeHeadPhone: '',
    officeHeadEmail: '',
    collectorName: '',
    collectorPhone: '',
    collectorEmail: '',
    divCommName: '',
    divCommPhone: '',
    divCommEmail: '',
    address: '',
    geoLat: '',
    geoLng: '',
    tags: '',
    isActive: true,
  });

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleService = (s: string) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(form.digipin);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(f => ({
          ...f,
          geoLat: position.coords.latitude.toFixed(6),
          geoLng: position.coords.longitude.toFixed(6)
        }));
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please check browser permissions.");
        setIsLoading(false);
      }
    );
  };

  const submitOffice = async () => {
    try {
      setIsLoading(true);

      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const res = await fetch('/api/offices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to create office");
      }

      const data = await res.json();
      setCreatedOffice(data.office);
      setStep(4);
    } catch (error) {
      console.error(error);
      alert("Error creating office. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '820px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '14px', color: C.textSec }}>Maharashtra</span>
          <span style={{ color: C.border }}>›</span>
          <span style={{ fontSize: '14px', color: C.blue, fontWeight: '500' }}>Add New Office</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: C.blueSoft,
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${C.blueMid}`,
            }}
          >
            <Building2 size={18} color={C.blue} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '680', color: C.text, letterSpacing: '-0.5px', marginBottom: '4px' }}>
              Register New Office
            </h1>
            <p style={{ fontSize: '15.5px', color: C.textSec }}>
              Add an office to the GovIntel governance monitoring network
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginBottom: '32px',
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: C.shadow,
        }}
      >
        {steps.map((s, i) => (
          <div key={s.id} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step > s.id ? C.green : step === s.id ? C.blue : C.bg,
                  border: `2px solid ${step > s.id ? C.green : step === s.id ? C.blue : C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {step > s.id ? (
                  <Check size={13} color="white" />
                ) : (
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: step === s.id ? 'white' : C.textSec,
                    }}
                  >
                    {s.id}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '14.5px',
                  fontWeight: step === s.id ? '580' : '420',
                  color: step === s.id ? C.text : C.textSec,
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.1px',
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: step > s.id ? C.green : C.border,
                  margin: '0 12px',
                  transition: 'background 0.2s',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          boxShadow: C.shadow,
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '32px' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '17px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px', marginBottom: '4px' }}>
                  Office Details
                </div>
                <div style={{ fontSize: '14.5px', color: C.textSec }}>
                  Basic identification and classification information
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field
                    label="Office Name"
                    value={form.officeName}
                    onChange={set('officeName')}
                    placeholder="e.g. Aurangabad Revenue Office C"
                    required
                  />
                </div>
                <ComboboxField
                  label="Department"
                  value={form.department}
                  onChange={set('department')}
                  options={['Revenue', 'Municipal', 'Transport', 'Health', 'Education']}
                />
                <ComboboxField
                  label="Office Type"
                  value={form.officeType}
                  onChange={set('officeType')}
                  options={['Revenue', 'Tahsildar', 'Municipal', 'Transport', 'Sub-Divisional']}
                />
                <ComboboxField
                  label="District"
                  value={form.district}
                  onChange={set('district')}
                  options={['Aurangabad', 'Pune', 'Nashik', 'Nagpur', 'Mumbai', 'Solapur', 'Kolhapur']}
                  required
                />
                <ComboboxField
                  label="Division"
                  value={form.division}
                  onChange={set('division')}
                  options={['Aurangabad', 'Pune', 'Nashik', 'Nagpur', 'Konkan', 'Amravati']}
                />

                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Address" value={form.address} onChange={set('address')} placeholder="Full office address" />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '18px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}><Field label="Latitude (Geo)" value={form.geoLat} onChange={set('geoLat')} placeholder="e.g. 19.8762" type="number" /></div>
                  <div style={{ flex: 1 }}><Field label="Longitude (Geo)" value={form.geoLng} onChange={set('geoLng')} placeholder="e.g. 75.3433" type="number" /></div>
                  <button
                    onClick={getGeoLocation}
                    type="button"
                    style={{
                      height: '42px',
                      padding: '0 16px',
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: '9px',
                      fontSize: '15px',
                      color: C.textSec,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Get Location
                  </button>
                </div>
              </div>

              {/* Hierarchy Contacts Section */}
              <div style={{ marginTop: '32px' }}>
                <div style={{ fontSize: '16px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px', marginBottom: '16px' }}>
                  Hierarchy & Contacts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <Field
                    label="Guardian Secretary"
                    value={form.guardianSecretary}
                    onChange={set('guardianSecretary')}
                    placeholder="e.g. Shri. XYZ"
                  />
                  <div style={{ gridColumn: '1 / -1', borderTop: `1px dashed ${C.border}`, margin: '8px 0' }} />

                  {/* Office Head Contact */}
                  <div style={{ gridColumn: '1 / -1', fontSize: '14.5px', fontWeight: '560', color: C.textSec }}>
                    Office Head Contact
                  </div>
                  <Field label="Name" value={form.officeHeadName} onChange={set('officeHeadName')} placeholder="Officer Name" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', gridColumn: '1 / -1' }}>
                    <Field label="Phone" value={form.officeHeadPhone} onChange={set('officeHeadPhone')} placeholder="Phone Number" type="tel" />
                    <Field label="Email" value={form.officeHeadEmail} onChange={set('officeHeadEmail')} placeholder="Email Address" type="email" />
                  </div>

                  <div style={{ gridColumn: '1 / -1', borderTop: `1px dashed ${C.border}`, margin: '8px 0' }} />

                  {/* Collector Contact */}
                  <div style={{ gridColumn: '1 / -1', fontSize: '14.5px', fontWeight: '560', color: C.textSec }}>
                    Collector Contact
                  </div>
                  <Field label="Name" value={form.collectorName} onChange={set('collectorName')} placeholder="Collector Name" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', gridColumn: '1 / -1' }}>
                    <Field label="Phone" value={form.collectorPhone} onChange={set('collectorPhone')} placeholder="Phone Number" type="tel" />
                    <Field label="Email" value={form.collectorEmail} onChange={set('collectorEmail')} placeholder="Email Address" type="email" />
                  </div>

                  <div style={{ gridColumn: '1 / -1', borderTop: `1px dashed ${C.border}`, margin: '8px 0' }} />

                  {/* Divisional Commissioner Contact */}
                  <div style={{ gridColumn: '1 / -1', fontSize: '14.5px', fontWeight: '560', color: C.textSec }}>
                    Divisional Commissioner Contact
                  </div>
                  <Field label="Name" value={form.divCommName} onChange={set('divCommName')} placeholder="Commissioner Name" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', gridColumn: '1 / -1' }}>
                    <Field label="Phone" value={form.divCommPhone} onChange={set('divCommPhone')} placeholder="Phone Number" type="tel" />
                    <Field label="Email" value={form.divCommEmail} onChange={set('divCommEmail')} placeholder="Email Address" type="email" />
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '32px' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '17px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px', marginBottom: '4px' }}>
                  Office Identifiers
                </div>
                <div style={{ fontSize: '14.5px', color: C.textSec }}>
                  Unique codes assigned to this office in state systems
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <Field
                  label="Office DIGIPIN"
                  value={form.digipin}
                  onChange={set('digipin')}
                  placeholder="e.g. MH-AU-0043"
                  hint="Format: [State]-[District]-[Sequence]"
                />
                <Field
                  label="Treasury Code"
                  value={form.treasuryCode}
                  onChange={set('treasuryCode')}
                  placeholder="e.g. TR-AU-2211"
                  hint="Assigned by the Finance Department"
                />

                {form.digipin && form.treasuryCode && (
                  <div
                    style={{
                      background: C.blueSoft,
                      border: `1px solid ${C.blueMid}`,
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <CheckCircle2 size={15} color={C.blue} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14.5px', fontWeight: '540', color: C.blue, marginBottom: '2px' }}>
                        Identifier Format Valid
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#1E4DA0' }}>
                        DIGIPIN {form.digipin} · Treasury {form.treasuryCode}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '32px' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '17px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px', marginBottom: '4px' }}>
                  Services & Operations
                </div>
                <div style={{ fontSize: '14.5px', color: C.textSec }}>
                  Services offered and operational parameters
                </div>
              </div>

              {/* Services */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14.5px', fontWeight: '560', color: C.text, marginBottom: '10px', letterSpacing: '-0.1px' }}>
                  Services Offered
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {allServices.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleService(s)}
                      style={{
                        padding: '7px 14px',
                        background: form.services.includes(s) ? C.blue : C.bg,
                        border: `1px solid ${form.services.includes(s) ? C.blue : C.border}`,
                        borderRadius: '8px',
                        fontSize: '14.5px',
                        color: form.services.includes(s) ? 'white' : C.text,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      {form.services.includes(s) && <Check size={11} />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <Field
                  label="Expected Daily Visitors"
                  value={form.expectedVisitors}
                  onChange={set('expectedVisitors')}
                  placeholder="e.g. 180"
                  type="number"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14.5px', fontWeight: '560', color: C.text, letterSpacing: '-0.1px' }}>
                    Working Hours
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="time"
                      value={form.workingHoursFrom}
                      onChange={(e) => set('workingHoursFrom')(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: '9px',
                        fontSize: '15.5px',
                        color: C.text,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <span style={{ fontSize: '14px', color: C.textSec }}>to</span>
                    <input
                      type="time"
                      value={form.workingHoursTo}
                      onChange={(e) => set('workingHoursTo')(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: '9px',
                        fontSize: '15.5px',
                        color: C.text,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', borderTop: `1px dashed ${C.border}`, margin: '8px 0' }} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Tags (comma-separated)" value={form.tags} onChange={set('tags')} placeholder="e.g. pilot, high-traffic" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} id="isActiveCheck" style={{ cursor: 'pointer' }} />
                  <label htmlFor="isActiveCheck" style={{ fontSize: '15px', color: C.text, cursor: 'pointer' }}>Active Office (Receiving Feedback)</label>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '32px' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '17px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px', marginBottom: '4px' }}>
                  Review & Registration
                </div>
                <div style={{ fontSize: '14.5px', color: C.textSec }}>
                  Confirm office details and generate WhatsApp onboarding QR
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '24px', alignItems: 'start' }}>
                {/* Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Basic Info */}
                  <div
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: '14px',
                        fontWeight: '580',
                        color: C.textSec,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        background: '#FAFBFC',
                      }}
                    >
                      Office Details
                    </div>
                    {[
                      ['Office Name', form.officeName],
                      ['Department', form.department],
                      ['Office Type', form.officeType],
                      ['District', form.district],
                      ['Division', form.division],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 16px',
                          borderBottom: `1px solid ${C.borderLight}`,
                        }}
                      >
                        <span style={{ fontSize: '14.5px', color: C.textSec }}>{k}</span>
                        <span style={{ fontSize: '14.5px', fontWeight: '520', color: C.text }}>{v || '—'}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: '14px',
                        fontWeight: '580',
                        color: C.textSec,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        background: '#FAFBFC',
                      }}
                    >
                      Identifiers & Operations
                    </div>
                    {[
                      ['DIGIPIN', form.digipin],
                      ['Treasury Code', form.treasuryCode],
                      ['Daily Visitors', form.expectedVisitors],
                      ['Working Hours', `${form.workingHoursFrom} – ${form.workingHoursTo}`],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 16px',
                          borderBottom: `1px solid ${C.borderLight}`,
                        }}
                      >
                        <span style={{ fontSize: '14.5px', color: C.textSec }}>{k}</span>
                        <span style={{ fontSize: '14.5px', fontWeight: '520', color: C.text }}>{v || '—'}</span>
                      </div>
                    ))}
                    <div style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '14.5px', color: C.textSec, display: 'block', marginBottom: '6px' }}>
                        Services
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {form.services.map((s) => (
                          <span
                            key={s}
                            style={{
                              padding: '3px 9px',
                              background: C.blueSoft,
                              color: C.blue,
                              border: `1px solid ${C.blueMid}`,
                              borderRadius: '20px',
                              fontSize: '13.5px',
                              fontWeight: '500',
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: C.shadow,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <QrCode size={14} color={C.blue} />
                      <span style={{ fontSize: '14px', fontWeight: '560', color: C.text, letterSpacing: '-0.1px' }}>
                        WhatsApp QR Code
                      </span>
                    </div>
                    {createdOffice ? (
                      <div
                        style={{
                          padding: '12px',
                          background: 'white',
                          border: `1px solid ${C.border}`,
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <img
                          src={`/api/offices/${createdOffice.office_id}/qr?size=300`}
                          alt="Office QR Code"
                          width={160}
                          height={160}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '30px',
                          background: C.bg,
                          border: `1px dashed ${C.border}`,
                          borderRadius: '10px',
                          color: C.textSec,
                          fontSize: '14px',
                          textAlign: 'center',
                          width: '186px',
                          height: '186px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        Generated upon registration
                      </div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '560', color: C.text, marginBottom: '2px' }}>
                        {form.digipin || '---'}
                      </div>
                      <div style={{ fontSize: '13px', color: C.textSec }}>Scan to submit feedback</div>
                    </div>
                    <button
                      onClick={handleCopy}
                      disabled={!createdOffice}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        background: !createdOffice ? C.bg : (copied ? C.greenSoft : C.bg),
                        border: `1px solid ${!createdOffice ? C.border : (copied ? C.green : C.border)}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: !createdOffice ? C.textSec : (copied ? '#15803D' : C.textSec),
                        cursor: !createdOffice ? 'not-allowed' : 'pointer',
                        opacity: !createdOffice ? 0.6 : 1,
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy DIGIPIN'}
                    </button>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      background: C.blueSoft,
                      border: `1px solid ${C.blueMid}`,
                      borderRadius: '10px',
                    }}
                  >
                    <p style={{ fontSize: '13.5px', color: '#1E4DA0', lineHeight: 1.55 }}>
                      Citizens can scan this QR to submit experience feedback via WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Navigation */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: `1px solid ${C.border}`,
            background: '#FAFBFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.push('/'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 18px',
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '9px',
              fontSize: '15px',
              color: C.textSec,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.12s',
            }}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: C.textSec }}>
              Step {step} of {steps.length}
            </span>
            <button
              onClick={() => {
                if (step === 3) {
                  submitOffice();
                } else if (step === 4) {
                  router.push('/office-registry');
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 22px',
                background: C.blue,
                border: 'none',
                borderRadius: '9px',
                fontSize: '15px',
                fontWeight: '520',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(11,108,245,0.25)',
                transition: 'all 0.12s',
              }}
            >
              {step === 4 ? (
                <>
                  <CheckCircle2 size={13} />
                  Finish
                </>
              ) : step === 3 ? (
                <>
                  {isLoading ? 'Registering...' : 'Register Office'}
                  {!isLoading && <ChevronRight size={13} />}
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export for Next.js App Router
export default function Page() {
  return <AddOffice />;
}