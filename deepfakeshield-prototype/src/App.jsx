import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Single-file prototype that mimics the 4 screenshots & flows:
// 1) Anonymous landing -> 2) Login -> 3) Dashboard upload -> 4) History/Insights
// Tailwind is available in this preview. No backend required.

const BG = ({ children }) => (
  <div className="min-h-screen w-full bg-[#0f1120] text-slate-200">
    <div className="fixed inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(1200px 600px at 70% 75%, rgba(40,30,120,.25), rgba(0,0,0,0))',
      }}
    />
    {children}
  </div>
);

const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[#15172b]/90 backdrop-blur rounded-2xl shadow-xl border border-white/10 ${className}`}
    style={{ boxShadow: '0 0 30px rgba(0,255,255,.08)' }}
  >
    {children}
  </motion.div>
);

const Brand = () => (
  <div className="flex items-center gap-2">
    <span className="text-2xl font-extrabold tracking-wide text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,.6)]">
      DeepFakeShield
    </span>
  </div>
);

const TopBar = ({ isAuthed, onHome, onLogin, onLogout }) => (
  <div className="sticky top-0 z-20 w-full bg-[#121420]/90 border-b border-white/10 backdrop-blur">
    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
      <Brand />
      <div className="flex items-center gap-3">
        <button onClick={onHome}
          className="px-4 py-1.5 rounded-xl border border-white/20 hover:border-white/40">
          Home
        </button>
        {isAuthed ? (
          <button onClick={onLogout}
            className="px-4 py-1.5 rounded-xl border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10">
            Logout
          </button>
        ) : (
          <button onClick={onLogin}
            className="px-4 py-1.5 rounded-xl border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10">
            Login / Sign Up
          </button>
        )}
      </div>
    </div>
  </div>
);

function Landing({ onCTALogin }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-20 pb-24">
      <Card className="p-10">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-black text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,.6)]">
            DeepFakeShield
          </h1>
          <p className="mt-3 text-cyan-200/80">AI‑Generated Image Detection & Harm Prevention</p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-xl bg-[#0c1622] p-6 border border-white/10"/>
            <div className="rounded-xl bg-[#0d0f1a] p-12 border-2 border-dashed border-cyan-500/30"/>
            <button onClick={onCTALogin}
              className="mx-auto w-full md:w-1/2 h-12 rounded-xl bg-blue-700 hover:bg-blue-600 transition font-semibold">
              Login / Sign Up
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Login({ onLoggedIn }) {
  return (
    <div className="mx-auto max-w-xl px-4 pt-16">
      <Card className="p-8">
        <h2 className="text-center text-3xl font-extrabold mb-6">Login to DeepFakeShield</h2>
        <div className="space-y-4">
          <input placeholder="Email address" className="w-full h-11 px-3 rounded-lg bg-[#0e1020] border border-white/10" />
          <input type="password" placeholder="Password" className="w-full h-11 px-3 rounded-lg bg-[#0e1020] border border-white/10" />
          <button onClick={onLoggedIn} className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold">Login</button>
          <button onClick={onLoggedIn} className="w-full h-11 rounded-lg border border-white/20 hover:bg-white/5">Sign in with Google</button>
          <p className="text-center text-sm text-emerald-300 mt-2">Need an account? <span className="underline">Register</span></p>
        </div>
      </Card>
    </div>
  );
}

function Dashboard({ file, onFileSelect, onScan }) {
  const inputRef = useRef(null);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 pb-16">
      <Card className="p-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,.6)]">DeepFakeShield</h2>
          <p className="mt-2 text-cyan-200/80">AI‑Generated Image Detection & Harm Prevention</p>
        </div>

        <div className="mt-6 rounded-xl bg-[#0c1622] p-5 border border-white/10" />

        <div
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-black/30 p-10 text-center cursor-pointer hover:bg-white/5"
        >
          <div className="text-5xl mb-4">🗂️</div>
          <p className="font-semibold">Drag & drop an image here</p>
          <p className="text-sm opacity-70">or click to browse</p>
          <p className="text-xs mt-1 opacity-60">PNG • JPG • JPEG • WEBP</p>
          {file && <p className="mt-3 text-emerald-300">Selected: {file.name}</p>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
                 onChange={(e) => onFileSelect(e.target.files?.[0] || null)} />
        </div>

        <button
          disabled={!file}
          onClick={onScan}
          className={`mt-6 w-full h-12 rounded-xl font-semibold ${file ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-900/40 cursor-not-allowed'}`}
        >
          Scan Image
        </button>

        <div className="mt-8 flex justify-center">
          <button className="px-5 py-2 rounded-xl border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10">Logout</button>
        </div>
      </Card>
    </div>
  );
}

function History({ scans, onRefresh, onExport }) {
  const counts = useMemo(() => {
    const total = scans.length;
    const ai = scans.filter(s => s.decision === 'FAKE').length;
    const real = total - ai;
    return { total, ai, real };
  }, [scans]);

  const data = [
    { name: 'AI-generated', value: counts.ai },
    { name: 'Real', value: counts.real },
  ];
  const COLORS = ['#c2185b', '#14b8a6'];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,.6)]">History & Insights</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-70">Updated: {new Date().toLocaleTimeString()}</span>
            <button onClick={onRefresh} className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/5">Refresh</button>
            <button onClick={onExport} className="px-3 py-1.5 rounded-lg border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10">Export CSV</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Metric title="Total" value={counts.total} />
          <Metric title="AI-generated" value={counts.ai} badge={`${Math.round((counts.ai/(counts.total||1))*100)}%`} color="rose" />
          <Metric title="Real" value={counts.real} badge={`${Math.round((counts.real/(counts.total||1))*100)}%`} color="cyan" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <Table scans={scans} />
          </Card>
        </div>
      </Card>
    </div>
  );
}

const Metric = ({ title, value, badge, color = 'slate' }) => (
  <div className="rounded-2xl bg-[#0e1020] border border-white/10 p-4">
    <div className="text-sm opacity-80">{title}</div>
    <div className="mt-1 text-3xl font-black">{value}</div>
    {badge && (
      <span className={`mt-2 inline-block text-xs px-2 py-1 rounded-full bg-${color}-500/20 border border-${color}-400/30 text-${color}-300`}>{badge}</span>
    )}
  </div>
);

const Table = ({ scans }) => (
  <div className="overflow-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-black/40">
        <tr>
          <Th>#</Th>
          <Th>Filename</Th>
          <Th>Decision</Th>
          <Th>Confidence</Th>
          <Th>Threshold</Th>
          <Th>Timestamp</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {scans.map((s, i) => (
          <tr key={i} className="border-t border-white/10">
            <Td>{i + 1}</Td>
            <Td className="whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis">{s.filename}</Td>
            <Td className={s.decision === 'FAKE' ? 'text-rose-400' : 'text-teal-300'}>{s.decision}</Td>
            <Td>{s.confidence}%</Td>
            <Td>{s.threshold}%</Td>
            <Td>{s.timestamp}</Td>
            <Td><button className="px-2 py-1 rounded-lg text-amber-300 bg-amber-500/10 border border-amber-400/30">Report</button></Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Th = ({ children }) => (
  <th className="text-left px-3 py-2 font-semibold">{children}</th>
);
const Td = ({ children, className='' }) => (
  <td className={`px-3 py-2 ${className}`}>{children}</td>
);

export default function DeepFakeShieldPrototype() {
  const [view, setView] = useState('landing'); // landing | login | dashboard | history
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [scans, setScans] = useState(sampleScans.slice(0, 0));

  // navigation helpers
  const goHome = () => setView(user ? 'dashboard' : 'landing');
  const goLogin = () => setView('login');
  const doLogout = () => { setUser(null); setView('landing'); };

  const handleLoggedIn = () => { setUser({ email: 'demo@user.com' }); setView('dashboard'); };
  const handleScan = () => {
    if (!file) return;
    const fakeScore = Math.floor(50 + Math.random() * 50); // 50–99
    const isFake = Math.random() < 0.33; // ~33% fake like screenshot
    const newEntry = {
      filename: file.name,
      decision: isFake ? 'FAKE' : 'REAL',
      confidence: isFake ? fakeScore : Math.floor(50 + Math.random() * 40),
      threshold: 80,
      timestamp: new Date().toISOString().replace('T',' ').slice(0,19),
    };
    setScans(prev => [newEntry, ...prev].slice(0, 15));
    setView('history');
  };

  const refresh = () => setScans([...scans]);
  const exportCSV = () => {
    const header = ['#','Filename','Decision','Confidence','Threshold','Timestamp'];
    const rows = scans.map((s,i)=>[i+1,s.filename,s.decision,`${s.confidence}%`,`${s.threshold}%`,s.timestamp]);
    const csv = [header, ...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'deepfakeshield_history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <BG>
      <TopBar isAuthed={!!user} onHome={goHome} onLogin={goLogin} onLogout={doLogout} />

      {view === 'landing' && (
        <Landing onCTALogin={goLogin} />
      )}

      {view === 'login' && (
        <Login onLoggedIn={handleLoggedIn} />
      )}

      {view === 'dashboard' && (
        <Dashboard file={file} onFileSelect={setFile} onScan={handleScan} />
      )}

      {view === 'history' && (
        <History scans={scans} onRefresh={refresh} onExport={exportCSV} />
      )}

      <Footer />
    </BG>
  );
}

const Footer = () => (
  <footer className="mt-16 border-t border-white/10 bg-[#141722]">
    <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
      <div>
        <div className="text-lg font-semibold">DeepFakeShield</div>
        <p className="opacity-70 mt-2">Protecting digital authenticity with advanced AI detection.</p>
      </div>
      <div>
        <div className="font-semibold">Resources</div>
        <ul className="opacity-80 space-y-1 mt-2">
          <li>FAQ</li>
          <li>Blog</li>
          <li>Tutorials</li>
        </ul>
      </div>
      <div>
        <div className="font-semibold">Company</div>
        <ul className="opacity-80 space-y-1 mt-2">
          <li>About Us</li>
          <li>Contact</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs opacity-70 pb-6">© {new Date().getFullYear()} DeepFakeShield. All rights reserved.</div>
  </footer>
);

// Sample data resembling your 4th screenshot (used for first render after scans happen)
const sampleScans = [
  { filename: 'WhatsApp_Image_2025-09-02_at_22.55.10.jpeg', decision: 'FAKE', confidence: 67.36, threshold: 80, timestamp: '2025-09-03 15:27:30' },
  { filename: 'WhatsApp_Image_2025-09-02_at_22.55.50.jpeg', decision: 'FAKE', confidence: 67.36, threshold: 80, timestamp: '2025-09-03 15:01:46' },
  { filename: 'WhatsApp_Image_2025-09-01_at_20.15.00.jpeg', decision: 'REAL', confidence: 75.81, threshold: 80, timestamp: '2025-09-01 15:02:05' },
  { filename: 'WhatsApp_Image_2025-09-01_at_20.10.20.jpeg', decision: 'REAL', confidence: 52.61, threshold: 80, timestamp: '2025-09-01 14:55:43' },
  { filename: 'ChatGPT_Image_Sep_1_2025_11_59_40.png', decision: 'FAKE', confidence: 97.64, threshold: 80, timestamp: '2025-09-01 14:51:26' },
];
