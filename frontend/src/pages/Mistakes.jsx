import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, BookOpen, Clock } from 'lucide-react';

export default function Mistakes() {
  const [mistakes, setMistakes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/mistakes')
      .then(res => res.json())
      .then(data => setMistakes(data));
  }, []);

  const removeMistake = (qId) => {
    fetch(`http://localhost:3001/api/mistake/${qId}`, { method: 'DELETE' })
      .then(() => {
        setMistakes(prev => prev.filter(m => m.question_id !== qId));
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <BookOpen size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-red-500/20 rounded-2xl shadow-inner">
               <AlertTriangle className="text-red-400" size={32} />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">专属错题本</h2>
          </div>
          <p className="text-slate-400 text-lg ml-1">消灭这些拦路虎，你的水平会得到质的飞跃。</p>
        </div>
        <div className="relative z-10 glass px-6 py-4 rounded-2xl text-center">
            <div className="text-sm text-slate-400 font-medium mb-1">待复习错题数</div>
            <div className="text-4xl font-black text-red-400">{mistakes.length}</div>
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 glass rounded-3xl border-dashed border-2 border-slate-700">
           <div className="text-8xl mb-6">🎉</div>
           <h3 className="text-3xl font-bold text-slate-300">太棒了，目前你的错题本是空的！</h3>
           <p className="mt-4 text-lg">继续保持，去试卷大厅多刷几道题吧。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {mistakes.map((m) => {
            const q = m.question;
            if(!q) return null;
            const options = Array.isArray(q.options) ? q.options : [];
            const optionChars = ['A', 'B', 'C', 'D', 'E', 'F'];

            return (
              <div key={m.id} className="glass rounded-3xl p-8 relative overflow-hidden group hover:border-slate-600 transition-all flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => removeMistake(m.question_id)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors shadow-lg" title="我已完全掌握，移出错题本">
                      <Trash2 size={16} /> 移出
                   </button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-4 py-1.5 text-xs font-black text-red-300 bg-red-500/20 rounded-full border border-red-500/30 flex items-center gap-1.5">
                    <AlertTriangle size={12}/> 做错过 {m.error_count} 次
                  </div>
                  <div className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 rounded-full flex items-center gap-1.5">
                     <Clock size={12} /> {new Date(m.last_error_time).toLocaleDateString()}
                  </div>
                </div>

                {q.group_content && (
                    <div className="mb-6 p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-300 prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{__html: q.group_content}}></div>
                )}
                
                <h3 className="text-xl font-medium mb-8 text-slate-200 leading-relaxed flex-1" dangerouslySetInnerHTML={{__html: q.content}}></h3>
                
                <div className="grid grid-cols-1 gap-3 mt-auto">
                  {options.map((opt, i) => {
                    const isCorrect = q.correct_answer === optionChars[i];
                    return (
                      <div key={i} className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${isCorrect ? 'border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-slate-700 glass opacity-60'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                          {optionChars[i]}
                        </div>
                        <span className={isCorrect ? 'text-green-100 font-medium' : 'text-slate-400'} dangerouslySetInnerHTML={{__html: opt}}></span>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
