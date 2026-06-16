import { useState, useEffect } from 'react';
import { History, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

export default function StudyHistory() {
  const [history, setHistory] = useState([]);
  const [papers, setPapers] = useState({});

  useEffect(() => {
    Promise.all([
        fetch('http://10.250.196.253:3001/api/history').then(res => res.json()),
        fetch('http://10.250.196.253:3001/api/papers').then(res => res.json())
    ]).then(([hData, pData]) => {
        setHistory(hData);
        
        const pMap = {};
        pData.forEach(p => pMap[p.id] = p.name);
        setPapers(pMap);
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <TrendingUp size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl shadow-inner">
               <History className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">刷题记录</h2>
          </div>
          <p className="text-slate-400 text-lg ml-1">每一次练习，都是进步的脚印。</p>
        </div>
        <div className="relative z-10 flex gap-4">
            <div className="glass px-6 py-4 rounded-2xl text-center">
                <div className="text-sm text-slate-400 font-medium mb-1">累计刷卷</div>
                <div className="text-4xl font-black text-emerald-400">{history.length}</div>
            </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 glass rounded-3xl border-dashed border-2 border-slate-700">
           <div className="text-8xl mb-6">🏃</div>
           <h3 className="text-3xl font-bold text-slate-300">还没有任何刷题记录！</h3>
           <p className="mt-4 text-lg">去题库大厅选一张卷子开始你的第一次挑战吧。</p>
        </div>
      ) : (
        <div className="glass rounded-[2rem] overflow-hidden border border-slate-700/50">
            <table className="w-full text-left">
                <thead className="bg-slate-800/50 border-b border-slate-700/50">
                    <tr>
                        <th className="p-6 text-slate-400 font-medium">考试时间</th>
                        <th className="p-6 text-slate-400 font-medium">试卷名称</th>
                        <th className="p-6 text-slate-400 font-medium">得分/总题数</th>
                        <th className="p-6 text-slate-400 font-medium">准确率</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                    {history.map((h, idx) => {
                        const accuracy = h.total > 0 ? Math.round((h.score / h.total) * 100) : 0;
                        return (
                            <tr key={h.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Calendar size={16} className="text-slate-500" />
                                        {new Date(h.study_time).toLocaleString()}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className="font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-lg">
                                        {papers[h.paper_id] || `试卷 ${h.paper_id}`}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-white">{h.score}</span>
                                        <span className="text-slate-500">/ {h.total}</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden w-32">
                                            <div className={`h-full rounded-full ${accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${accuracy}%`}}></div>
                                        </div>
                                        <span className={`font-bold ${accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{accuracy}%</span>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
