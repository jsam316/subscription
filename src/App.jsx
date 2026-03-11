import { useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Entertainment', 'Productivity', 'Health', 'Finance', 'Other']
const CATEGORY_COLORS = { Entertainment: '#FF6B6B', Productivity: '#4ECDC4', Health: '#95E1D3', Finance: '#F7DC6F', Other: '#BB8FCE' }
const ICONS = { Entertainment: '🎬', Productivity: '⚡', Health: '💚', Finance: '💰', Other: '✦' }
const BILLING = ['Monthly', 'Yearly', 'Weekly']

const CURRENCIES = [
  { code: 'USD', symbol: '$',    name: 'US Dollar',          flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',    name: 'Euro',               flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',      flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen',       flag: '🇯🇵' },
  { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar',    flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar',  flag: '🇦🇺' },
  { code: 'CHF', symbol: 'Fr',   name: 'Swiss Franc',        flag: '🇨🇭' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',       flag: '🇮🇳' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real',     flag: '🇧🇷' },
  { code: 'MXN', symbol: 'MX$',  name: 'Mexican Peso',       flag: '🇲🇽' },
  { code: 'KWD', symbol: 'KD',   name: 'Kuwaiti Dinar',      flag: '🇰🇼' },
  { code: 'SAR', symbol: 'SR',   name: 'Saudi Riyal',        flag: '🇸🇦' },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham',         flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar',   flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$',  name: 'Hong Kong Dollar',   flag: '🇭🇰' },
  { code: 'KRW', symbol: '₩',    name: 'South Korean Won',   flag: '🇰🇷' },
  { code: 'SEK', symbol: 'kr',   name: 'Swedish Krona',      flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr',   name: 'Norwegian Krone',    flag: '🇳🇴' },
  { code: 'NZD', symbol: 'NZ$',  name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand', flag: '🇿🇦' },
]

const RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.53,
  CHF: 0.89, INR: 83.1, BRL: 4.97, MXN: 17.2, KWD: 0.308, SAR: 3.75,
  AED: 3.67, SGD: 1.34, HKD: 7.82, KRW: 1325, SEK: 10.4, NOK: 10.6,
  NZD: 1.63, ZAR: 18.6,
}

const SAMPLE_SUBS = [
  { id: 1, name: 'Netflix',   category: 'Entertainment', cost: 15.99, billing: 'Monthly', color: '#E50914', startDate: '2023-01-15', notes: 'Family plan',      source: 'manual' },
  { id: 2, name: 'Notion',    category: 'Productivity',  cost: 8,     billing: 'Monthly', color: '#6C63FF', startDate: '2023-03-01', notes: '',                source: 'manual' },
  { id: 3, name: 'Spotify',   category: 'Entertainment', cost: 9.99,  billing: 'Monthly', color: '#1DB954', startDate: '2022-11-20', notes: 'Student discount', source: 'manual' },
  { id: 4, name: 'Apple One', category: 'Productivity',  cost: 19.95, billing: 'Monthly', color: '#555555', startDate: '2023-06-01', notes: '',                source: 'manual' },
  { id: 5, name: 'Headspace', category: 'Health',        cost: 69.99, billing: 'Yearly',  color: '#FF6E42', startDate: '2024-01-01', notes: '',                source: 'manual' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMonthlyEquivalent(cost, billing) {
  if (billing === 'Yearly')  return cost / 12
  if (billing === 'Weekly')  return cost * 4.33
  return cost
}

function fmt(value, currency, decimals = 2) {
  const converted = value * RATES[currency.code]
  const d = ['JPY', 'KRW'].includes(currency.code) ? 0 : decimals
  return `${currency.symbol}${converted.toFixed(d)}`
}

function categoryColor(name) {
  const map = { netflix: '#E50914', spotify: '#1DB954', apple: '#888', google: '#4285F4', amazon: '#FF9900', microsoft: '#00A4EF', adobe: '#FF0000', notion: '#6C63FF', dropbox: '#0061FF', slack: '#4A154B', zoom: '#2D8CFF', hulu: '#1CE783', disney: '#113CCF', youtube: '#FF0000', github: '#333', figma: '#A259FF' }
  const key = Object.keys(map).find(k => name.toLowerCase().includes(k))
  return key ? map[key] : '#' + Math.floor(Math.random() * 0xAAAAAA + 0x444444).toString(16)
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle  = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelText   = { fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666' }
const inputStyle  = { padding: '11px 14px', borderRadius: 10, border: '1px solid #2A2A35', background: '#181820', color: '#F0EEE8', fontFamily: 'inherit', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen() {
  const { loginWithRedirect, isLoading } = useAuth0()

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600&display=swap');`}</style>
      <div style={{ textAlign: 'center', padding: 48 }}>
        {/* Logo mark */}
        <div style={{ fontSize: 52, marginBottom: 16 }}>✦</div>
        <h1 style={{ margin: '0 0 10px', fontFamily: "'Playfair Display', serif", fontSize: 34, color: '#F0EEE8', letterSpacing: -1 }}>
          Subscription Manager
        </h1>
        <p style={{ margin: '0 0 40px', color: '#555', fontSize: 15 }}>
          Track every subscription. Never overpay.
        </p>

        <button
          onClick={() => loginWithRedirect()}
          disabled={isLoading}
          style={{ padding: '14px 40px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #6C63FF, #8B80FF)', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, letterSpacing: 0.3, boxShadow: '0 8px 32px rgba(108,99,255,0.4)', opacity: isLoading ? 0.7 : 1, transition: 'all 0.2s' }}
        >
          {isLoading ? 'Loading…' : 'Sign In to Continue'}
        </button>

        <p style={{ marginTop: 24, fontSize: 12, color: '#333' }}>
          Secured with Auth0 · Your data stays private
        </p>
      </div>
    </div>
  )
}

// ── Currency picker ───────────────────────────────────────────────────────────

function CurrencyPicker({ currency, onChange }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const filtered = CURRENCIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #2A2A35', background: '#0F0F18', color: '#F0EEE8', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500 }}>
        <span style={{ fontSize: 16 }}>{currency.flag}</span>
        <span>{currency.code}</span>
        <span style={{ color: '#555', fontSize: 11 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => { setOpen(false); setSearch('') }} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0F0F18', border: '1px solid #2A2A35', borderRadius: 14, width: 260, zIndex: 50, boxShadow: '0 20px 50px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1E1E2A' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search currency…" autoFocus style={{ ...inputStyle, background: '#181820', fontSize: 13, padding: '8px 12px' }} />
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {filtered.map(c => (
                <button key={c.code} onClick={() => { onChange(c); setOpen(false); setSearch('') }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: c.code === currency.code ? '#1A1A28' : 'transparent', border: 'none', color: c.code === currency.code ? '#F0EEE8' : '#999', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, textAlign: 'left' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{c.flag}</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span style={{ color: '#555', fontSize: 12, fontWeight: 600 }}>{c.code}</span>
                  {c.code === currency.code && <span style={{ color: '#6C63FF' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Add / Edit modal ──────────────────────────────────────────────────────────

function AddModal({ onClose, onAdd, editData, currency }) {
  const [form, setForm] = useState(editData || { name: '', category: 'Entertainment', cost: '', billing: 'Monthly', color: '#6C63FF', startDate: new Date().toISOString().split('T')[0], notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name || !form.cost) return
    onAdd({ ...form, cost: parseFloat(form.cost), id: editData?.id || Date.now(), source: editData?.source || 'manual' })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#0F0F13', border: '1px solid #2A2A35', borderRadius: 20, padding: 36, width: 420, maxWidth: '90vw', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        <h2 style={{ margin: '0 0 28px', fontSize: 20, fontFamily: "'Playfair Display', serif", color: '#F0EEE8', letterSpacing: -0.5 }}>
          {editData ? 'Edit Subscription' : 'New Subscription'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={labelStyle}>
            <span style={labelText}>Service Name</span>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Netflix" style={inputStyle} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={labelStyle}>
              <span style={labelText}>Cost ({currency.symbol})</span>
              <input type="number" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0.00" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelText}>Billing</span>
              <select value={form.billing} onChange={e => set('billing', e.target.value)} style={inputStyle}>
                {BILLING.map(b => <option key={b}>{b}</option>)}
              </select>
            </label>
          </div>
          <label style={labelStyle}>
            <span style={labelText}>Category</span>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
            <label style={labelStyle}>
              <span style={labelText}>Start Date</span>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={inputStyle} />
            </label>
            <label style={{ ...labelStyle, alignItems: 'center' }}>
              <span style={labelText}>Color</span>
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                style={{ width: 48, height: 42, borderRadius: 10, border: '1px solid #2A2A35', background: 'none', cursor: 'pointer', padding: 2 }} />
            </label>
          </div>
          <label style={labelStyle}>
            <span style={labelText}>Notes</span>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional note…" style={inputStyle} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #2A2A35', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6C63FF, #8B80FF)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>
            {editData ? 'Save Changes' : 'Add Subscription'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────

function Dashboard() {
  const { user, logout } = useAuth0()
  const [subs, setSubs]       = useState(SAMPLE_SUBS)
  const [filter, setFilter]   = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('name')
  const [currency, setCurrency] = useState(CURRENCIES[0])

  const totalMonthly = subs.reduce((acc, s) => acc + getMonthlyEquivalent(s.cost, s.billing), 0)
  const totalYearly  = totalMonthly * 12

  const filtered = subs
    .filter(s => filter === 'All' || s.category === filter)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'cost') return getMonthlyEquivalent(b.cost, b.billing) - getMonthlyEquivalent(a.cost, a.billing)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'date') return new Date(b.startDate) - new Date(a.startDate)
      return 0
    })

  const handleAdd = (sub) => {
    setSubs(s => editSub ? s.map(x => x.id === sub.id ? sub : x) : [...s, sub])
    setEditSub(null)
  }

  const categoryBreakdown = CATEGORIES.filter(c => c !== 'All').map(cat => ({
    cat, total: subs.filter(s => s.category === cat).reduce((a, s) => a + getMonthlyEquivalent(s.cost, s.billing), 0),
  })).filter(c => c.total > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#F0EEE8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2A2A35; border-radius: 10px; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        select option { background: #181820; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .sub-card { animation: fadeUp 0.3s ease forwards; }
        .sub-card:hover .actions { opacity: 1 !important; }
        .sub-card:hover { border-color: #3A3A48 !important; }
        .filter-btn:hover { background: #1A1A24 !important; }
      `}</style>

      <div style={{ padding: '40px 40px 0', maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: '#6C63FF', marginBottom: 8, textTransform: 'uppercase' }}>✦ Dashboard</div>
            <h1 style={{ margin: 0, fontSize: 36, fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>Subscriptions</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CurrencyPicker currency={currency} onChange={setCurrency} />
            <button onClick={() => setShowAdd(true)}
              style={{ padding: '12px 22px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #6C63FF, #8B80FF)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(108,99,255,0.35)' }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Add New
            </button>
          </div>
        </div>

        {/* User bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, background: '#0F0F18', border: '1px solid #1E1E2A', borderRadius: 14, padding: '12px 18px' }}>
          {user?.picture && <img src={user.picture} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #2A2A35' }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F0EEE8' }}>{user?.name || user?.email}</div>
            <div style={{ fontSize: 11, color: '#555' }}>{user?.email}</div>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/subscription-manager/' } })}
            style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid #2A2A35', background: 'transparent', color: '#666', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Monthly Spend', value: fmt(totalMonthly, currency),    sub: 'across all services' },
            { label: 'Annual Total',  value: fmt(totalYearly, currency, 0),  sub: 'projected this year' },
            { label: 'Active Plans',  value: subs.length,                    sub: `${categoryBreakdown.length} categories` },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#0F0F18', border: '1px solid #1E1E2A', borderRadius: 16, padding: '22px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#555', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 30, fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: -1, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Currency note */}
        {currency.code !== 'USD' && (
          <div style={{ background: '#6C63FF11', border: '1px solid #6C63FF33', borderRadius: 12, padding: '10px 16px', marginBottom: 24, fontSize: 12, color: '#8B80FF', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{currency.flag}</span>
            <span>Showing approximate values in {currency.name} ({currency.code}) · Rates are indicative only</span>
          </div>
        )}

        {/* Category breakdown */}
        {categoryBreakdown.length > 0 && (
          <div style={{ background: '#0F0F18', border: '1px solid #1E1E2A', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#555', textTransform: 'uppercase', marginBottom: 16 }}>Spend by Category</div>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 16 }}>
              {categoryBreakdown.map(({ cat, total }) => (
                <div key={cat} style={{ flex: total / totalMonthly, background: CATEGORY_COLORS[cat] }} title={cat} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
              {categoryBreakdown.map(({ cat, total }) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[cat] }} />
                  <span style={{ color: '#888' }}>{cat}</span>
                  <span style={{ color: '#F0EEE8', fontWeight: 600 }}>{fmt(total, currency)}/mo</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subscriptions…"
            style={{ ...inputStyle, flex: 1, minWidth: 180, background: '#0F0F18', border: '1px solid #1E1E2A' }} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ ...inputStyle, width: 'auto', background: '#0F0F18', border: '1px solid #1E1E2A' }}>
            <option value="name">Sort: Name</option>
            <option value="cost">Sort: Cost</option>
            <option value="date">Sort: Date</option>
          </select>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} className="filter-btn" onClick={() => setFilter(cat)}
              style={{ padding: '7px 16px', borderRadius: 20, border: filter === cat ? 'none' : '1px solid #1E1E2A', background: filter === cat ? 'linear-gradient(135deg, #6C63FF, #8B80FF)' : 'transparent', color: filter === cat ? '#fff' : '#666', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>
              {cat !== 'All' && <span style={{ marginRight: 5 }}>{ICONS[cat]}</span>}{cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 60 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 16 }}>No subscriptions found</div>
            </div>
          )}
          {filtered.map((sub, i) => {
            const monthly = getMonthlyEquivalent(sub.cost, sub.billing)
            const months  = Math.floor((new Date() - new Date(sub.startDate)) / (1000 * 60 * 60 * 24 * 30))
            return (
              <div key={sub.id} className="sub-card" style={{ background: '#0F0F18', border: '1px solid #1E1E2A', borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, animationDelay: `${i * 40}ms`, transition: 'border-color 0.2s', position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: sub.color + '22', border: `1.5px solid ${sub.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {ICONS[sub.category]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#F0EEE8' }}>{sub.name}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: CATEGORY_COLORS[sub.category] + '22', color: CATEGORY_COLORS[sub.category], fontWeight: 600 }}>{sub.category}</span>
                    {sub.notes && <span style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>· {sub.notes}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    {sub.billing} · started {new Date(sub.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} · {months > 0 ? `${months} months` : 'just started'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#F0EEE8' }}>{fmt(sub.cost, currency)}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{sub.billing !== 'Monthly' ? `${fmt(monthly, currency)}/mo` : 'per month'}</div>
                </div>
                <div className="actions" style={{ display: 'flex', gap: 6, opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }}>
                  <button onClick={() => { setEditSub(sub); setShowAdd(true) }}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #2A2A35', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</button>
                  <button onClick={() => setSubs(s => s.filter(x => x.id !== sub.id))}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #3A1A1A', background: 'transparent', color: '#FF6B6B', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {(showAdd || editSub) && (
        <AddModal onClose={() => { setShowAdd(false); setEditSub(null) }} onAdd={handleAdd} editData={editSub} currency={currency} />
      )}
    </div>
  )
}

// ── Root — Auth gate ──────────────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6C63FF', fontSize: 32 }}>✦</div>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginScreen />
}
