import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Star, History } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import Mistakes from './pages/Mistakes';
import Favorites from './pages/Favorites';
import StudyHistory from './pages/History';
import Browse from './pages/Browse';

function AppLayout() {
  const location = useLocation();
  const hideSidebar = location.pathname.startsWith('/study') || location.pathname.startsWith('/browse');

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-slate-950 flex font-sans selection:bg-blue-500/30">
      {/* Sidebar - conditionally hidden */}
      {!hideSidebar && (
        <aside className="w-72 glass border-r border-slate-700/50 flex flex-col relative z-20">
          <div className="p-8 flex items-center gap-4">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
              BetterExam
            </h1>
            <p className="text-slate-400 text-sm mt-2">智能高效刷题平台</p>
          </div>
          <nav className="flex-1 px-4 space-y-3 mt-4">
            <Link to="/" className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-slate-700/50 transition-all font-medium text-slate-300 hover:text-white">
              <div className="p-2 bg-blue-500/10 rounded-xl"><LayoutDashboard size={20} className="text-blue-400" /></div>
              <span>题库大厅</span>
            </Link>
            <Link to="/mistakes" className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-slate-700/50 transition-all font-medium text-slate-300 hover:text-white">
              <div className="p-2 bg-red-500/10 rounded-xl"><BookOpen size={20} className="text-red-400" /></div>
              <span>错题本</span>
            </Link>
            <Link to="/favorites" className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-slate-700/50 transition-all font-medium text-slate-300 hover:text-white">
              <div className="p-2 bg-yellow-500/10 rounded-xl"><Star size={20} className="text-yellow-400" /></div>
              <span>收藏夹</span>
            </Link>
            <Link to="/history" className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-slate-700/50 transition-all font-medium text-slate-300 hover:text-white">
              <div className="p-2 bg-emerald-500/10 rounded-xl"><History size={20} className="text-emerald-400" /></div>
              <span>刷题记录</span>
            </Link>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main id="main-scroll-container" className={`flex-1 relative z-10 h-screen overflow-y-auto custom-scrollbar ${hideSidebar ? '' : 'p-8'}`}>
        <div className={hideSidebar ? "w-full" : "max-w-6xl mx-auto"}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/study/:paperId" element={<Study />} />
            <Route path="/mistakes" element={<Mistakes />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<StudyHistory />} />
            <Route path="/browse/:paperId" element={<Browse />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
