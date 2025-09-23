// src/components/AdminDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Sample data for the prototype
  const stats = {
    totalReports: 1247,
    todayReports: 23,
    totalUsers: 89,
    fakeReports: 843,
    realReports: 404,
    detectionRate: 68
  };

  const recentReports = [
    { id: 1, filename: 'profile_pic_001.jpg', decision: 'FAKE', confidence: 92.3, timestamp: '2025-01-15 14:30:22' },
    { id: 2, filename: 'vacation_photo.png', decision: 'REAL', confidence: 87.6, timestamp: '2025-01-15 13:15:44' },
    { id: 3, filename: 'document_scan.jpeg', decision: 'FAKE', confidence: 95.1, timestamp: '2025-01-15 12:45:18' },
    { id: 4, filename: 'selfie_image.jpg', decision: 'REAL', confidence: 76.8, timestamp: '2025-01-15 11:20:33' },
    { id: 5, filename: 'group_photo.png', decision: 'FAKE', confidence: 88.9, timestamp: '2025-01-15 10:05:57' }
  ];

  const detectionData = [
    { name: 'AI-Generated', value: stats.fakeReports },
    { name: 'Real', value: stats.realReports },
  ];

  const COLORS = ['#c2185b', '#14b8a6'];

  const MetricCard = ({ title, value, subtitle, color = 'cyan' }) => (
    <Card className="p-6">
      <div className="text-center">
        <div className="text-sm opacity-80 mb-2">{title}</div>
        <div className={`text-3xl font-black text-${color}-300 mb-1`}>{value}</div>
        <div className="text-xs opacity-70">{subtitle}</div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#0f1120] text-slate-200">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(1200px 600px at 70% 75%, rgba(40,30,120,.25), rgba(0,0,0,0))',
        }}
      />

      {/* Top Bar */}
      <div className="sticky top-0 z-20 w-full bg-[#121420]/90 border-b border-white/10 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-wide text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,.6)]">
              DeepFakeShield Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}
              className="px-4 py-1.5 rounded-xl border border-white/20 hover:border-white/40">
              Back to App
            </button>
            <button 
              className="px-4 py-1.5 rounded-xl border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="TOTAL REPORTS" 
            value={stats.totalReports.toLocaleString()} 
            subtitle="Overall"
            color="cyan"
          />
          <MetricCard 
            title="TODAY'S REPORTS" 
            value={stats.todayReports} 
            subtitle="Today"
            color="blue"
          />
          <MetricCard 
            title="TOTAL USERS" 
            value={stats.totalUsers} 
            subtitle="Registered"
            color="amber"
          />
          <MetricCard 
            title="DETECTION RATE" 
            value={`${stats.detectionRate}%`} 
            subtitle="AI Content"
            color="rose"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Detection Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <span>📊</span>
              Detection Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={detectionData} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {detectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#14b8a6]"></div>
                <span className="text-sm">Real: {stats.realReports}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#c2185b]"></div>
                <span className="text-sm">AI-Generated: {stats.fakeReports}</span>
              </div>
            </div>
          </Card>

          {/* Recent Reports */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                <span>🕒</span>
                Recent Reports
              </h3>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm border border-cyan-400/30">
                {recentReports.length}
              </span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0e1020] border border-white/5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-8 rounded-full ${report.decision === 'FAKE' ? 'bg-rose-500' : 'bg-teal-500'}`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate" title={report.filename}>
                        {report.filename}
                      </div>
                      <div className="text-xs opacity-70">{report.timestamp}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.decision === 'FAKE' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' 
                        : 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                    }`}>
                      {report.decision}
                    </span>
                    <span className="text-sm opacity-80">{report.confidence}%</span>
                    <button className="p-1 rounded hover:bg-white/10">
                      <span className="text-lg">👁️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Information */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
            <span>⚙️</span>
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0e1020] border border-white/5">
                <span className="font-medium">Admin User:</span>
                <span className="text-cyan-300">admin@deepfakeshield.com</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0e1020] border border-white/5">
                <span className="font-medium">User ID:</span>
                <span className="text-xs opacity-70">adm_9f8s7d6f5g4h</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0e1020] border border-white/5">
                <span className="font-medium">Server Status:</span>
                <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0e1020] border border-white/5">
                <span className="font-medium">Backend:</span>
                <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Connected
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button className="px-6 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 transition font-semibold flex items-center gap-2">
              <span>🔄</span>
              Refresh Data
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;