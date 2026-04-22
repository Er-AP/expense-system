import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Other"];

const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "📄",
  Health: "💊",
  Entertainment: "🎮",
  Other: "💡",
};

const CATEGORY_COLORS = {
  Food: "#f97316",
  Transport: "#3b82f6",
  Shopping: "#a855f7",
  Bills: "#ef4444",
  Health: "#22c55e",
  Entertainment: "#f59e0b",
  Other: "#64748b",
};

function Toaster({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === "success" ? "✅" : "❌"}</span>
      <p>{message}</p>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenses, setExpenses] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);

  const url = `${import.meta.env.VITE_API_URL}/api`;
  const token = localStorage.getItem("token");

  const notify = (message, type = "success") => setToast({ message, type });

  const register = async () => {
    setLoading(true);
    try {
      await axios.post(`${url}/register`, { name, email, password });
      notify("Account created! Please login.", "success");
      setIsLogin(true);
      setName(""); setEmail(""); setPassword("");
    } catch {
      notify("Registration failed. Try again.", "error");
    } finally { setLoading(false); }
  };

  const login = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${url}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.reload();
    } catch {
      notify("Invalid credentials.", "error");
    } finally { setLoading(false); }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${url}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (e) { console.log(e); }
  };

  const addExpense = async () => {
    if (!title || !amount || !category) return notify("Fill all fields.", "error");
    setAddLoading(true);
    try {
      await axios.post(`${url}/expense`, { title, amount, category }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle(""); setAmount(""); setCategory("Food");
      setShowForm(false);
      fetchExpenses();
      notify("Expense added!", "success");
    } catch {
      notify("Failed to add expense.", "error");
    } finally { setAddLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => { if (token) fetchExpenses(); }, []);

  const total = expenses.reduce((s, i) => s + Number(i.amount), 0);
  const filtered = filterCat === "All" ? expenses : expenses.filter(e => e.category === filterCat);
  const highestExpense = expenses.length ? Math.max(...expenses.map(e => Number(e.amount))) : 0;
  const catBreakdown = CATEGORIES.reduce((acc, c) => {
    acc[c] = expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0);
    return acc;
  }, {});

  // ─── AUTH SCREEN ────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="auth-root">
        <Toaster message={toast.message} type={toast.type} onClose={() => setToast({ message: "" })} />

        <div className="auth-left">
          <div className="auth-brand">
            <span className="brand-icon">₹</span>
            <span className="brand-name">SpendSense</span>
          </div>
          <h2 className="auth-headline">Take control of<br /><em>every rupee.</em></h2>
          <p className="auth-sub">Track, analyze, and master your spending — built for the modern Indian.</p>
          <div className="auth-pills">
            <span>📊 Visual Analytics</span>
            <span>🔒 Secure Auth</span>
            <span>⚡ Instant Sync</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-tabs">
              <button className={isLogin ? "tab active" : "tab"} onClick={() => setIsLogin(true)}>Sign In</button>
              <button className={!isLogin ? "tab active" : "tab"} onClick={() => setIsLogin(false)}>Register</button>
            </div>

            {!isLogin && (
              <div className="field-group">
                <label>Full Name</label>
                <input type="text" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}

            <div className="field-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="pw-wrap">
                <input type={pwVisible ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="pw-toggle" onClick={() => setPwVisible(v => !v)}>
                  {pwVisible ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button className="auth-btn" onClick={isLogin ? login : register} disabled={loading}>
              {loading ? <span className="spinner" /> : (isLogin ? "Sign In →" : "Create Account →")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───────────────────────────────────────────────────
  return (
    <div className="dash-root">
      <Toaster message={toast.message} type={toast.type} onClose={() => setToast({ message: "" })} />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">₹</span>
          <span className="brand-name">SpendSense</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section">Overview</span>
          <a className="nav-item active" href="#">📊 Dashboard</a>
          <span className="nav-section">Categories</span>
          {["All", ...CATEGORIES].map(c => (
            <a key={c} className={`nav-item ${filterCat === c ? "active" : ""}`} href="#" onClick={e => { e.preventDefault(); setFilterCat(c); }}>
              <span>{c === "All" ? "🗂️" : CATEGORY_ICONS[c]}</span> {c}
            </a>
          ))}
        </nav>

        <button className="logout-btn" onClick={logout}>⬅ Logout</button>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-title">Expense Dashboard</h1>
            <p className="dash-sub">{expenses.length} transaction{expenses.length !== 1 ? "s" : ""} recorded</p>
          </div>
          <button className="add-btn" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Cancel" : "+ Add Expense"}
          </button>
        </header>

        {/* Stats Row */}
        <div className="stats-row">
          <StatCard label="Total Spent" value={`₹${total.toLocaleString("en-IN")}`} icon="💸" accent="#f97316" />
          <StatCard label="Transactions" value={expenses.length} icon="📋" accent="#3b82f6" />
          <StatCard label="Highest Spend" value={`₹${highestExpense.toLocaleString("en-IN")}`} icon="📈" accent="#ef4444" />
          <StatCard label="Categories" value={Object.values(catBreakdown).filter(v => v > 0).length} icon="🗂️" accent="#a855f7" />
        </div>

        {/* Category Bar Chart */}
        {total > 0 && (
          <div className="chart-section">
            <h3 className="section-title">Spending by Category</h3>
            <div className="chart-bars">
              {CATEGORIES.filter(c => catBreakdown[c] > 0).map(c => (
                <div key={c} className="bar-row">
                  <span className="bar-label">{CATEGORY_ICONS[c]} {c}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(catBreakdown[c] / total) * 100}%`, background: CATEGORY_COLORS[c] }}
                    />
                  </div>
                  <span className="bar-amount">₹{catBreakdown[c].toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        {showForm && (
          <div className="add-form-section">
            <h3 className="section-title">New Expense</h3>
            <div className="add-form-grid">
              <div className="field-group">
                <label>Title</label>
                <input type="text" placeholder="e.g. Zomato Order" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Amount (₹)</label>
                <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Category</label>
                <div className="cat-pills">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      className={`cat-pill ${category === c ? "selected" : ""}`}
                      style={category === c ? { background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c] } : {}}
                      onClick={() => setCategory(c)}
                    >
                      {CATEGORY_ICONS[c]} {c}
                    </button>
                  ))}
                </div>
              </div>
              <button className="submit-btn" onClick={addExpense} disabled={addLoading}>
                {addLoading ? <span className="spinner" /> : "Add Expense →"}
              </button>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="expenses-section">
          <h3 className="section-title">
            {filterCat === "All" ? "All Expenses" : `${CATEGORY_ICONS[filterCat]} ${filterCat}`}
            <span className="count-badge">{filtered.length}</span>
          </h3>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>🪙</p>
              <p>No expenses yet. Add your first one!</p>
            </div>
          ) : (
            <div className="expense-list">
              {[...filtered].reverse().map(item => (
                <div className="expense-item" key={item._id}>
                  <div className="expense-icon" style={{ background: `${CATEGORY_COLORS[item.category] || "#64748b"}22`, color: CATEGORY_COLORS[item.category] || "#64748b" }}>
                    {CATEGORY_ICONS[item.category] || "💡"}
                  </div>
                  <div className="expense-info">
                    <p className="expense-title">{item.title}</p>
                    <span className="expense-cat" style={{ color: CATEGORY_COLORS[item.category] || "#64748b" }}>
                      {item.category}
                    </span>
                  </div>
                  <p className="expense-amount">₹{Number(item.amount).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
