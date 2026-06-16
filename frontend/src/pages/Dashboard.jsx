import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Play } from 'lucide-react';

export default function Dashboard() {
  const [papers, setPapers] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/papers').then(res => res.json()),
      fetch('http://localhost:3001/api/history').then(res => res.json())
    ]).then(([papersData, historyData]) => {
      setPapers(papersData);
      setHistory(historyData);
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-bold text-white tracking-tight">试卷大厅</h2>
        <p className="text-slate-400 mt-2 text-lg">选择一张试卷开始你今天的刷题之旅吧！</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {papers.map(paper => (
          <div key={paper.id} className="glass rounded-3xl p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl shadow-inner">
                <FileText className="text-blue-400" size={28} />
              </div>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{paper.name || `试卷卷宗 ${paper.id}`}</h3>
            <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed">{paper.description || '本卷暂无详细描述，直接开始挑战吧！'}</p>
            
            {(() => {
              const paperHistory = history.filter(h => h.paper_id === paper.id);
              const timesTaken = paperHistory.length;
              const bestScore = timesTaken > 0 ? Math.max(...paperHistory.map(h => h.score)) : 0;
              
              return (
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 group-hover:border-blue-500/30 transition-colors">
                    <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">挑战次数</p>
                    <p className="text-2xl font-black text-slate-300">{timesTaken} <span className="text-sm font-normal text-slate-500">次</span></p>
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 group-hover:border-green-500/30 transition-colors">
                    <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">客观最佳得分</p>
                    <p className="text-2xl font-black text-green-400">{timesTaken > 0 ? bestScore : '--'}</p>
                  </div>
                </div>
              );
            })()}

            <div className="mt-8 relative z-10 flex flex-col gap-3">
              <Link to={`/study/${paper.id}`} className="flex items-center justify-center w-full gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/25 font-bold text-lg hover:shadow-blue-500/40 hover:-translate-y-0.5">
                <Play size={20} fill="currentColor" />
                <span>进入模拟考试</span>
              </Link>
              <Link to={`/browse/${paper.id}`} className="flex items-center justify-center w-full gap-2 py-3 glass hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all font-semibold">
                <FileText size={18} />
                <span>查阅模式 (直接看题与答案)</span>
              </Link>
            </div>
          </div>
        ))}
        {papers.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">
            <div className="inline-block p-6 rounded-full glass mb-4">
              <FileText size={48} className="text-slate-600" />
            </div>
            <p className="text-xl">加载中或没有找到试卷数据...</p>
          </div>
        )}
      </div>
    </div>
  );
}
