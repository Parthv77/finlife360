import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

/* ─── DATA ─── */
const cityAvg = {
  kochi: 16000, bangalore: 22000, mumbai: 28000,
  delhi: 20000, chennai: 18000, hyderabad: 19000,
};

const animals = [
  { min: 75, emoji: "🦊", name: "The Fox",       color: "#f97316", desc: "Smart, calculative and invests wisely. You think before every rupee is spent." },
  { min: 55, emoji: "🐢", name: "The Tortoise",  color: "#10b981", desc: "Slow and steady saver. You may be cautious but you will win the race!" },
  { min: 35, emoji: "🦋", name: "The Butterfly", color: "#a855f7", desc: "You love experiences over savings. Life is enjoyed but the future needs attention." },
  { min: 0,  emoji: "🦁", name: "The Lion",      color: "#ef4444", desc: "Bold and confident spender. Great energy but savings need urgent attention!" },
];

const allChallenges = [
  { title: "No eating out for 7 days",        save: "Save ₹800",     icon: "🍱" },
  { title: "Set up ₹500 auto-save this week", save: "Build habit",   icon: "💰" },
  { title: "Track every expense for 3 days",  save: "Find leaks",    icon: "📊" },
  { title: "Cancel 1 unused subscription",    save: "Save ₹200–500", icon: "✂️" },
  { title: "Cook all meals for 5 days",       save: "Save ₹600",     icon: "🍳" },
  { title: "No impulse buys for 10 days",     save: "Save ₹1000+",   icon: "🛒" },
];

const tips = [
  "Save at least 20% of your income before spending on wants.",
  "Clear high-interest debt first — it drains your future wealth.",
  "Start a SIP of even ₹500/month — time is your biggest asset.",
  "Track every expense for 30 days — awareness is the first step.",
  "Build a 3-month emergency fund before any investment.",
];

const FEATURES = [
  { icon: "📊", title: "Health Score" },
  { icon: "🧓", title: "Financial Age" },
  { icon: "🦊", title: "Personality" },
  { icon: "🔮", title: "Simulator" },
  { icon: "👯", title: "Twin" },
  { icon: "🎯", title: "Challenges" },
];

const PIE_COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const EXPENSE_CATEGORIES = [
  { key: "rent",          label: "Rent / Housing",   icon: "🏠", color: "#7c3aed" },
  { key: "food",          label: "Food & Groceries",  icon: "🍛", color: "#10b981" },
  { key: "transport",     label: "Transport",         icon: "🚗", color: "#f59e0b" },
  { key: "entertainment", label: "Entertainment",     icon: "🎬", color: "#ef4444" },
  { key: "other",         label: "Other / Misc",      icon: "📦", color: "#06b6d4" },
];

/* ─── HELPERS ─── */
const fmt   = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ─── STYLES ─── */
const S = {
  page:   { minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#302b63 55%,#24243e 100%)", fontFamily: "'Segoe UI',sans-serif", color: "#fff", padding: "2rem 1rem" },
  inner:  { maxWidth: 760, margin: "0 auto" },
  card:   { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 24, padding: "1.75rem", marginBottom: "1.25rem" },
  title:  { fontSize: 18, fontWeight: 700, marginBottom: "1.2rem" },
  label:  { fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6, fontWeight: 500 },
  input:  { width: "100%", padding: "12px 16px", fontSize: 15, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, color: "#fff", outline: "none", boxSizing: "border-box" },
  btn:    { width: "100%", padding: 16, fontSize: 16, fontWeight: 700, background: "linear-gradient(90deg,#7c3aed,#4f46e5)", color: "#fff", border: "none", borderRadius: 16, cursor: "pointer", letterSpacing: 0.5, marginTop: 8 },
  btnSec: { width: "100%", padding: 14, fontSize: 15, fontWeight: 600, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, cursor: "pointer", marginTop: 6 },
  grid2:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  metric: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "1.25rem", textAlign: "center" },
};

/* ─── SUB-COMPONENTS ─── */
function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input type="number" value={value} onChange={onChange} placeholder={placeholder} style={S.input}
        onFocus={e => (e.target.style.borderColor = "rgba(167,139,250,0.9)")}
        onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
      />
    </div>
  );
}

function BarRow({ label, value, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
        <span>{label}</span><span style={{ fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 10, background: "rgba(255,255,255,0.1)", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ width: value + "%", height: "100%", background: color, borderRadius: 5, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

function AnimatedNumber({ target }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 40);
    const id = setInterval(() => {
      current += step;
      if (current >= target) { setDisplay(target); clearInterval(id); }
      else setDisplay(current);
    }, 30);
    return () => clearInterval(id);
  }, [target]);
  return <>{display}</>;
}

/* ══ SPLASH ══ */
function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => onDone(), 3200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "linear-gradient(135deg,#0f0c29 0%,#302b63 55%,#24243e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "opacity 0.6s", opacity: phase === 3 ? 0 : 1 }}>
      <div style={{ position: "relative", width: 140, height: 140, marginBottom: 32 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ position: "absolute", inset: i * 18, borderRadius: "50%", border: `2px solid rgba(167,139,250,${0.5 - i * 0.15})`, animation: `splinspin${i} ${2 + i * 0.5}s linear infinite` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s" }}>💎</div>
      </div>
      <div style={{ fontSize: 38, fontWeight: 900, background: "linear-gradient(90deg,#fff 0%,#c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease", marginBottom: 8 }}>
        FinLife360 Pro
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", letterSpacing: 1, opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.6s 0.2s", marginBottom: 40 }}>
        Your Money. Your Mirror.
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", padding: "0 1rem" }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "10px 14px", textAlign: "center", minWidth: 76, opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "translateY(0)" : "translateY(16px)", transition: `all 0.5s ease ${i * 0.08}s` }}>
            <div style={{ fontSize: 22 }}>{f.icon}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{f.title}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#10b981)", borderRadius: 2, transition: "width 2.8s linear", width: phase >= 1 ? "100%" : "0%" }} />
      </div>
      <style>{`
        @keyframes splinspin0{to{transform:rotate(360deg);}}
        @keyframes splinspin1{to{transform:rotate(-360deg);}}
        @keyframes splinspin2{to{transform:rotate(360deg);}}
      `}</style>
    </div>
  );
}

/* ══ MAIN APP ══ */
export default function App() {
  const [splash,  setSplash]  = useState(true);
  const [step,    setStep]    = useState(1);
  const [visible, setVisible] = useState(false);

  const [form, setForm] = useState({
    income: "", savings: "", debt: "", age: "", city: "kochi",
  });

  /* Real expense inputs per category */
  const [expCat, setExpCat] = useState({
    rent: "", food: "", transport: "", entertainment: "", other: "",
  });

  const [result,   setResult]   = useState(null);
  const [extraSav, setExtraSav] = useState(0);
  const [cutExp,   setCutExp]   = useState(0);
  const [years,    setYears]    = useState(5);

  useEffect(() => { if (!splash) setTimeout(() => setVisible(true), 50); }, [splash]);

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setE = (k) => (e) => setExpCat({ ...expCat, [k]: e.target.value });

  /* total expenses = sum of all categories */
  const totalExpenses = Object.values(expCat).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  function calculate() {
    const income  = parseFloat(form.income)  || 0;
    const savings = parseFloat(form.savings) || 0;
    const debt    = parseFloat(form.debt)    || 0;
    const age     = parseFloat(form.age)     || 22;
    const city    = form.city;
    const expenses = totalExpenses;

    if (!income)           { alert("Please enter your monthly income!"); return; }
    if (income <= 0)       { alert("Income must be greater than zero!"); return; }
    if (expenses === 0)    { alert("Please fill in at least one expense category!"); return; }
    if (savings < 0)       { alert("Savings cannot be negative!"); return; }
    if (debt < 0)          { alert("Debt cannot be negative!"); return; }
    if (age < 16 || age > 80) { alert("Please enter a valid age between 16 and 80!"); return; }

    const savingsRate  = clamp((savings / income) * 100, 0, 100);
    const expenseRatio = clamp((expenses / income) * 100, 0, 100);
    const debtBurden   = clamp((debt / (income * 12)) * 100, 0, 100);
    const surplusAmt   = income - expenses;

    let score = 0;
    score += clamp(savingsRate * 1.5, 0, 35);
    score += clamp(35 - expenseRatio * 0.4, 0, 35);
    score += clamp(30 - debtBurden * 0.5, 0, 30);
    score = clamp(Math.round(score), 0, 100);

    /* Financial Age — always between 18 and 75, relative to actual age */
    let finAge;
    if (score >= 65) finAge = Math.round(age - ((score - 65) / 35) * 5);
    else             finAge = Math.round(age + ((65 - score) / 65) * 12);
    finAge = clamp(finAge, 18, 75);

    /* Real expense breakdown from user input */
    const expBreakdown = EXPENSE_CATEGORIES.map(cat => ({
      name:  cat.label,
      value: parseFloat(expCat[cat.key]) || 0,
      color: cat.color,
      icon:  cat.icon,
    })).filter(e => e.value > 0);

    /* Biggest spending category */
    const topSpend = [...expBreakdown].sort((a, b) => b.value - a.value)[0];

    const animal     = animals.find(a => score >= a.min);
    const avg        = cityAvg[city];
    const diff       = expenses - avg;
    const challenges = [...allChallenges].sort(() => 0.5 - Math.random()).slice(0, 3);
    const tip        = tips[Math.floor(Math.random() * tips.length)];

    let grade, gradeColor;
    if      (score >= 80) { grade = "A+"; gradeColor = "#10b981"; }
    else if (score >= 65) { grade = "A";  gradeColor = "#34d399"; }
    else if (score >= 50) { grade = "B";  gradeColor = "#f59e0b"; }
    else if (score >= 35) { grade = "C";  gradeColor = "#fb923c"; }
    else                  { grade = "D";  gradeColor = "#ef4444"; }

    setResult({ income, expenses, savings, debt, age, city, savingsRate, expenseRatio, debtBurden, surplusAmt, score, finAge, animal, avg, diff, challenges, tip, expBreakdown, topSpend, grade, gradeColor });
    setStep(2);
    window.scrollTo(0, 0);
  }

  function getProjected() {
    if (!result) return 0;
    const newExp     = result.expenses * (1 - cutExp / 100);
    const newSurplus = result.income - newExp + extraSav;
    return Math.max(newSurplus * 12 * years * 1.08, 0);
  }

  function getChartData() {
    if (!result) return [];
    return Array.from({ length: years + 1 }, (_, i) => {
      const newExp     = result.expenses * (1 - cutExp / 100);
      const newSurplus = result.income - newExp + extraSav;
      return { year: `Yr ${i}`, amount: Math.round(Math.max(newSurplus * 12 * i * 1.08, 0)) };
    });
  }

  const scoreColor = result
    ? result.score >= 65 ? "#10b981" : result.score >= 40 ? "#f59e0b" : "#ef4444"
    : "#7c3aed";
  const scoreLabel = result
    ? result.score >= 65 ? "Healthy 💚" : result.score >= 40 ? "At Risk ⚠️" : "Critical 🔴"
    : "";

  /* ══ RENDER ══ */
  return (
    <>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}

      <div style={{ ...S.page, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s ease" }}>
        <div style={S.inner}>

          {/* HEADER */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "6px 20px", fontSize: 12, color: "#c4b5fd", marginBottom: 16, letterSpacing: 1.5 }}>
              PERSONAL FINANCE DASHBOARD
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(90deg,#fff 0%,#c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              FinLife360 Pro
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", margin: 0 }}>Your Money. Your Mirror.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
              {[1, 2].map(d => (
                <div key={d} style={{ width: step === d ? 32 : 10, height: 10, borderRadius: 5, background: step === d ? "#7c3aed" : "rgba(255,255,255,0.2)", transition: "all 0.4s ease" }} />
              ))}
            </div>
          </div>

          {/* ─── STEP 1: FORM ─── */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.5s ease" }}>

              {/* Basic Info */}
              <div style={S.card}>
                <div style={S.title}>📋 Basic Information</div>
                <div style={S.grid2}>
                  <Field label="Monthly Income (₹)"  value={form.income}  onChange={setF("income")}  placeholder="e.g. 25000" />
                  <Field label="Monthly Savings (₹)" value={form.savings} onChange={setF("savings")} placeholder="e.g. 4000" />
                </div>
                <div style={S.grid2}>
                  <Field label="Total Debt (₹)" value={form.debt} onChange={setF("debt")} placeholder="e.g. 10000" />
                  <Field label="Your Age"        value={form.age}  onChange={setF("age")}  placeholder="e.g. 21" />
                </div>
                <div>
                  <label style={S.label}>City</label>
                  <select value={form.city} onChange={setF("city")} style={S.input}>
                    {Object.keys(cityAvg).map(c => (
                      <option key={c} value={c} style={{ background: "#302b63" }}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div style={S.card}>
                <div style={S.title}>💸 Monthly Expense Breakdown</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 18 }}>
                  Enter how much you spend in each category. Leave blank if not applicable.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <div key={cat.key}>
                      <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{cat.icon}</span>{cat.label}
                      </label>
                      <input
                        type="number"
                        value={expCat[cat.key]}
                        onChange={setE(cat.key)}
                        placeholder="e.g. 5000"
                        style={{ ...S.input, borderLeft: `3px solid ${cat.color}` }}
                        onFocus={e => (e.target.style.borderColor = cat.color)}
                        onBlur={e  => { e.target.style.borderLeftColor = cat.color; e.target.style.borderTopColor = "rgba(255,255,255,0.2)"; e.target.style.borderRightColor = "rgba(255,255,255,0.2)"; e.target.style.borderBottomColor = "rgba(255,255,255,0.2)"; }}
                      />
                    </div>
                  ))}
                </div>

                {/* Live total */}
                <div style={{ marginTop: 20, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 14, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Total Monthly Expenses</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#c4b5fd" }}>{fmt(totalExpenses)}</span>
                </div>
              </div>

              <button style={S.btn} onClick={calculate}>Generate My Financial Report →</button>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20, justifyContent: "center" }}>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 50, padding: "6px 14px", fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{f.icon}</span>{f.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 2: DASHBOARD ─── */}
          {step === 2 && result && (
            <div style={{ animation: "fadeUp 0.5s ease" }}>

              {/* Score Hero */}
              <div style={{ ...S.card, textAlign: "center", background: "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(79,70,229,0.25))", border: "1px solid rgba(167,139,250,0.35)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Financial Health Score</div>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div style={{ fontSize: 100, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                    <AnimatedNumber target={result.score} />
                  </div>
                  <div style={{ position: "absolute", top: 0, right: -50, background: result.gradeColor, color: "#fff", fontWeight: 900, fontSize: 18, borderRadius: 12, padding: "4px 10px" }}>
                    {result.grade}
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor, margin: "6px 0 20px" }}>{scoreLabel}</div>
                <div style={{ height: 18, background: "rgba(255,255,255,0.1)", borderRadius: 9, overflow: "hidden", marginBottom: 28 }}>
                  <div style={{ width: result.score + "%", height: "100%", background: scoreColor, borderRadius: 9, transition: "width 1.4s ease" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <BarRow label="Savings Rate"    value={clamp(Math.round(result.savingsRate), 0, 100)}        color="#10b981" />
                  <BarRow label="Expense Control" value={clamp(Math.round(100 - result.expenseRatio), 0, 100)} color="#7c3aed" />
                  <BarRow label="Debt Burden"     value={clamp(Math.round(result.debtBurden), 0, 100)}         color="#ef4444" />
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: "1.25rem" }}>
                {[
                  { label: "FINANCIAL AGE",   value: result.finAge + " yrs", color: result.finAge > result.age ? "#f87171" : "#34d399", note: result.finAge > result.age ? "Older than actual" : "Younger than actual" },
                  { label: "MONTHLY SURPLUS", value: fmt(result.surplusAmt), color: result.surplusAmt >= 0 ? "#34d399" : "#f87171",     note: result.surplusAmt >= 0 ? "You're saving!" : "Overspending!" },
                  { label: "SAVINGS RATE",    value: Math.round(result.savingsRate) + "%", color: "#c4b5fd",                             note: result.savingsRate >= 20 ? "Great rate!" : "Aim for 20%+" },
                ].map(m => (
                  <div key={m.label} style={S.metric}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 6, fontWeight: 600, letterSpacing: 0.8 }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.note}</div>
                  </div>
                ))}
              </div>

              {/* Real Expense Breakdown */}
              <div style={S.card}>
                <div style={S.title}>💸 Your Actual Expense Breakdown</div>
                {result.topSpend && (
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{EXPENSE_CATEGORIES.find(c => c.label === result.topSpend.name)?.icon}</span>
                    Your biggest expense is <strong style={{ color: "#f59e0b" }}>{result.topSpend.name}</strong> at <strong style={{ color: "#f59e0b" }}>{fmt(result.topSpend.value)}/month</strong>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 0 200px", height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={result.expBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                          {result.expBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#1e1b4b", border: "1px solid #4f46e5", borderRadius: 10, color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    {result.expBreakdown.map((item, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{item.name}</span>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                              {Math.round((item.value / result.expenses) * 100)}%
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{fmt(item.value)}</span>
                          </div>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: Math.round((item.value / result.expenses) * 100) + "%", height: "100%", background: item.color, borderRadius: 3, transition: "width 1s ease" }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Total</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{fmt(result.expenses)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animal */}
              <div style={{ ...S.card, textAlign: "center" }}>
                <div style={S.title}>✨ Your Financial Personality</div>
                <div style={{ fontSize: 80, marginBottom: 12, animation: "bounce 1s ease" }}>{result.animal.emoji}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: result.animal.color, marginBottom: 10 }}>{result.animal.name}</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 380, margin: "0 auto", lineHeight: 1.8 }}>{result.animal.desc}</div>
              </div>

              {/* Financial Twin */}
              <div style={S.card}>
                <div style={S.title}>👯 Your Financial Twin</div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 18, padding: "1.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>You have the financial habits of a</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#c4b5fd", marginBottom: 12 }}>{result.finAge}-year-old Indian professional</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                    Your actual age: <strong style={{ color: "#fff" }}>{result.age} yrs</strong>
                    &nbsp;→&nbsp; Financial age: <strong style={{ color: result.finAge > result.age ? "#f87171" : "#34d399" }}>{result.finAge} yrs</strong>
                  </div>
                  <div style={{ display: "inline-block", fontSize: 14, fontWeight: 600, color: result.diff > 0 ? "#f87171" : "#34d399", padding: "8px 20px", background: result.diff > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", borderRadius: 50 }}>
                    {result.diff > 0
                      ? `You spend ${fmt(Math.abs(result.diff))} MORE than avg in ${result.city.charAt(0).toUpperCase() + result.city.slice(1)}`
                      : `You spend ${fmt(Math.abs(result.diff))} LESS than avg in ${result.city.charAt(0).toUpperCase() + result.city.slice(1)}`}
                  </div>
                </div>
              </div>

              {/* What-If Simulator */}
              <div style={S.card}>
                <div style={S.title}>🔮 What If Simulator</div>
                {[
                  { label: "Extra savings/month (₹)", val: extraSav, setVal: setExtraSav, min: 0, max: 10000, step: 500, display: fmt(extraSav) },
                  { label: "Cut expenses by",         val: cutExp,   setVal: setCutExp,   min: 0, max: 50,    step: 5,   display: cutExp + "%" },
                  { label: "Years to project",        val: years,    setVal: setYears,    min: 1, max: 10,    step: 1,   display: years + " yrs" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", minWidth: 180 }}>{s.label}</span>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.setVal(Number(e.target.value))} style={{ flex: 1, accentColor: "#7c3aed" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#c4b5fd", minWidth: 70, textAlign: "right" }}>{s.display}</span>
                  </div>
                ))}
                <div style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 18, padding: "1.5rem", textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Projected savings in {years} years</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: "#34d399" }}>{fmt(getProjected())}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                    New monthly surplus: <span style={{ fontWeight: 700, color: "#a78bfa" }}>{fmt(clamp(result.income - result.expenses * (1 - cutExp / 100) + extraSav, 0, Infinity))}</span>
                  </div>
                </div>
                <div style={{ marginTop: 20, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={v => "₹" + (v / 1000).toFixed(0) + "k"} axisLine={false} tickLine={false} />
                      <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#1e1b4b", border: "1px solid #4f46e5", borderRadius: 10, color: "#fff" }} />
                      <Area type="monotone" dataKey="amount" stroke="#7c3aed" fill="url(#grad)" strokeWidth={3} dot={{ fill: "#7c3aed", r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Challenges */}              <div style={S.card}>
                <div style={S.title}>🎯 Your Monthly Challenges</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {result.challenges.map((c, i) => (
                    <div key={i}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1rem", transition: "transform 0.2s", cursor: "default" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>{c.save}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Card */}
              <div style={{ ...S.card, background: "linear-gradient(135deg,rgba(124,58,237,0.28),rgba(16,185,129,0.15))", border: "1px solid rgba(167,139,250,0.3)" }}>
                <div style={S.title}>📄 Your Shareable Report Card</div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 18, padding: "1.5rem" }}>
                  <div style={{ textAlign: "center", fontSize: 19, fontWeight: 800, marginBottom: 20, color: "#c4b5fd" }}>FinLife360 Financial Report</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Health Score",    value: result.score + "/100 (" + result.grade + ")", color: scoreColor },
                      { label: "Financial Age",   value: result.finAge + " yrs",                        color: "#f59e0b" },
                      { label: "Personality",     value: result.animal.emoji + " " + result.animal.name.replace("The ", ""), color: result.animal.color },
                      { label: "5-Year Wealth",   value: fmt(getProjected()),                           color: "#10b981" },
                      { label: "Monthly Surplus", value: fmt(result.surplusAmt),                        color: result.surplusAmt >= 0 ? "#34d399" : "#f87171" },
                      { label: "Top Expense",     value: result.topSpend ? result.topSpend.name : "N/A", color: "#f59e0b" },
                    ].map(item => (
                      <div key={item.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "1rem", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                    💡 {result.tip}
                  </div>
                </div>
              </div>

              <button style={S.btnSec} onClick={() => { setStep(1); setResult(null); setExtraSav(0); setCutExp(0); setYears(5); window.scrollTo(0, 0); }}>
                ← Start Over
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes bounce { 0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);} }
      `}</style>
    </>
  );
}