import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, ArrowLeft, Loader2, Trophy, Star, LayoutList, LayoutTemplate, Send, ArrowDownToLine, ArrowUpToLine, FastForward, FileText, ChevronLeft } from 'lucide-react';

export default function Study() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { qId: 'A' }
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
  const [splitPaneMode, setSplitPaneMode] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
        fetch(`http://localhost:3001/api/questions?paper_id=${paperId}`).then(res => res.json()),
        fetch(`http://localhost:3001/api/favorites`).then(res => res.json())
    ]).then(([qData, fData]) => {
        setQuestions(qData);
        setLoading(false);
        if (Array.isArray(fData)) {
            setFavorites(new Set(fData.map(f => f.question_id)));
        }
    });
  }, [paperId]);

  const handleSelect = (qId, optionChar) => {
    if (showResult) return;
    setAnswers(prev => ({ ...prev, [qId]: optionChar }));
  };

  const toggleFavorite = (qId) => {
      const isFav = favorites.has(qId);
      if (isFav) {
          fetch(`http://localhost:3001/api/favorite/${qId}`, { method: 'DELETE' })
            .then(() => setFavorites(prev => { const next = new Set(prev); next.delete(qId); return next; }));
      } else {
          fetch(`http://localhost:3001/api/favorite`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question_id: qId, paper_id: paperId })
          }).then(() => setFavorites(prev => { const next = new Set(prev); next.add(qId); return next; }));
      }
  };

  const submitPaper = () => {
    if (showResult) return;
    let currentScore = 0;
    
    questions.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer === q.correct_answer) {
            currentScore++;
        } else if (userAnswer !== q.correct_answer) {
            fetch('http://localhost:3001/api/mistake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: q.id, paper_id: paperId })
            });
        }
    });

    setScore(currentScore);
    setShowResult(true);

    fetch('http://localhost:3001/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: paperId, score: currentScore, total: questions.length })
    });
  };

  const jumpToContinue = () => {
      // Find the first question that doesn't have an answer
      const target = questions.find(q => !answers[q.id]);
      if (target) {
          const el = document.getElementById(`question-${target.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
          // If all answered, jump to the last question
          const last = questions[questions.length - 1];
          if (last) {
              const el = document.getElementById(`question-${last.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  };

  const handleExit = () => {
      if (!showResult && Object.keys(answers).length > 0) {
          setShowExitConfirm(true);
      } else {
          navigate('/');
      }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  if (questions.length === 0) return (
    <div className="text-center py-20 text-slate-400 text-xl">该试卷暂无题目。</div>
  );

  const optionChars = ['A', 'B', 'C', 'D', 'E', 'F'];
  const answeredCount = Object.keys(answers).length;

  // Group questions for List Mode
  const groups = [];
  let currentGroup = null;
  questions.forEach(q => {
      if (currentGroup && currentGroup.group_id === q.group_id && currentGroup.content === q.group_content) {
          currentGroup.questions.push(q);
      } else {
          currentGroup = {
              group_id: q.group_id,
              content: q.group_content,
              questions: [q]
          };
          groups.push(currentGroup);
      }
  });

  const renderQuestionCard = (q, idxOverride) => {
      const idx = idxOverride !== undefined ? idxOverride : questions.findIndex(xq => xq.id === q.id);
      const options = Array.isArray(q.options) ? q.options : [];
      const selectedOption = answers[q.id];
      const isFav = favorites.has(q.id);

      return (
          <div id={`question-${q.id}`} key={q.id} className="glass rounded-[2rem] p-10 border-t border-slate-600/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none text-9xl font-black">
                Q{idx + 1}
              </div>
              
              <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
                  {viewMode === 'list' && q.group_content && (
                      <button onClick={() => {
                          const el = document.getElementById(`group-content-${q.group_id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }} className="p-3 rounded-xl glass text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-lg group relative" title="回到题干">
                          <FileText size={24} />
                          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              回到题干
                          </div>
                      </button>
                  )}
                  <button onClick={() => toggleFavorite(q.id)} className={`p-3 rounded-xl transition-all shadow-lg group relative ${isFav ? 'bg-yellow-500 text-white shadow-yellow-500/30' : 'glass text-slate-400 hover:text-yellow-400 hover:border-yellow-500/30'}`} title="收藏此题">
                      <Star size={24} fill={isFav ? 'currentColor' : 'none'} />
                      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {isFav ? '取消收藏' : '收藏此题'}
                      </div>
                  </button>
              </div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <span className="px-4 py-1.5 text-sm font-bold tracking-widest text-indigo-300 uppercase bg-indigo-500/20 rounded-full border border-indigo-500/30 shadow-inner">
                  {q.type === 'choice' ? '单选题' : q.type === 'multi_choice' ? '多选题' : q.type === 'boolean' ? '判断题' : q.type}
                </span>
                <span className="text-slate-400 font-medium">分值: {q.score} 分</span>
              </div>
              <h3 className="text-2xl font-medium leading-relaxed text-slate-100 relative z-10 mb-8" dangerouslySetInnerHTML={{__html: q.content}}></h3>

              <div className="space-y-4 relative z-10">
                {options.map((opt, i) => {
                  const char = optionChars[i];
                  const isSelected = selectedOption === char;
                  const isCorrect = q.correct_answer === char;
                  
                  let btnClass = "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-6 text-lg group relative overflow-hidden ";
                  
                  if (!showResult) {
                    btnClass += isSelected 
                      ? "bg-blue-600/20 border-blue-500 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                      : "glass border-transparent hover:border-slate-600 hover:bg-slate-800 text-slate-300";
                  } else {
                    if (isCorrect) btnClass += "bg-green-500/20 border-green-500 text-green-100 shadow-[0_0_20px_rgba(34,197,94,0.15)]";
                    else if (isSelected) btnClass += "bg-red-500/20 border-red-500 text-red-100";
                    else btnClass += "glass border-transparent opacity-40";
                  }

                  return (
                    <button key={i} onClick={() => handleSelect(q.id, char)} className={btnClass} disabled={showResult}>
                      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl font-bold text-base transition-all ${
                        isSelected && !showResult ? 'bg-blue-500 text-white' : 
                        showResult && isCorrect ? 'bg-green-500 text-white' :
                        showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                        'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                      }`}>
                        {showResult && isCorrect ? <Check size={20} /> : showResult && isSelected && !isCorrect ? <X size={20} /> : char}
                      </div>
                      <span className="leading-relaxed relative z-10" dangerouslySetInnerHTML={{__html: opt}}></span>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                 <div className="mt-8 p-6 rounded-2xl glass border border-slate-700/50 flex items-center gap-4 relative z-10">
                     {selectedOption === q.correct_answer ? (
                         <div className="flex items-center gap-3 text-green-400 font-bold"><Check size={24}/> 回答正确</div>
                     ) : (
                         <div className="flex items-center gap-3 text-red-400 font-bold">
                             <X size={24}/> 
                             回答错误。正确答案是 <span className="text-2xl ml-2">{q.correct_answer}</span>
                         </div>
                     )}
                 </div>
              )}
          </div>
      );
  };

  return (
    <div className="min-h-screen w-full relative flex">
      {/* Top Left Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <button onClick={handleExit} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-xl font-medium">
          <ChevronLeft size={20} /> 返回大厅
        </button>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in">
           <div className="glass p-8 rounded-3xl max-w-md w-full shadow-2xl border border-slate-700">
               <h2 className="text-2xl font-bold text-white mb-4">确认要退出吗？</h2>
               <p className="text-slate-400 mb-8">你还有未提交的作答记录，现在退出进度将会丢失。</p>
               <div className="flex gap-4">
                  <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl glass text-slate-300 hover:text-white transition-all font-medium">取消</button>
                  <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all font-medium">确认退出</button>
               </div>
           </div>
        </div>
      )}

      {/* Right Toolbar */}
      <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50 flex flex-col gap-4">
        {!showResult ? (
            <div className="glass p-4 rounded-2xl flex flex-col items-center shadow-2xl border border-blue-500/20 text-center w-20">
                <div className="text-xs text-blue-300 font-medium mb-1 uppercase tracking-wider opacity-80">进度</div>
                <div className="text-xl font-black text-blue-400">{answeredCount}</div>
                <div className="w-8 h-px bg-slate-700 my-1"></div>
                <div className="text-sm font-bold text-slate-400">{questions.length}</div>
            </div>
        ) : (
            <div className="glass p-4 rounded-2xl flex flex-col items-center shadow-2xl border border-green-500/30 text-center w-20 bg-green-500/10">
                <div className="text-xs text-green-300 font-medium mb-1 uppercase tracking-wider opacity-80">得分</div>
                <div className="text-xl font-black text-green-400">{score}</div>
                <div className="w-8 h-px bg-green-500/30 my-1"></div>
                <div className="text-sm font-bold text-green-500/70">{questions.length}</div>
            </div>
        )}

        <button onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')} className="p-4 rounded-2xl glass hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-xl group relative">
            {viewMode === 'card' ? <LayoutList size={24}/> : <LayoutTemplate size={24}/>}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {viewMode === 'card' ? '切换长列表模式' : '切换单题卡片模式'}
            </div>
        </button>

        <button onClick={() => setSplitPaneMode(!splitPaneMode)} className={`p-4 rounded-2xl transition-all shadow-xl group relative ${splitPaneMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'glass text-slate-400 hover:text-white hover:bg-slate-700'}`}>
            <LayoutList size={24} className={splitPaneMode ? "rotate-90" : ""} />
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {splitPaneMode ? '关闭分屏吸附' : '开启分屏吸附 (左右布局)'}
            </div>
        </button>

        {viewMode === 'list' && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-700/50">
                <button onClick={() => document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' })} className="p-4 rounded-2xl glass hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-xl group relative">
                    <ArrowUpToLine size={24}/>
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">回到顶部</div>
                </button>
                <button onClick={() => {
                    const c = document.getElementById('main-scroll-container');
                    if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
                }} className="p-4 rounded-2xl glass hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-xl group relative">
                    <ArrowDownToLine size={24}/>
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">滑到底部</div>
                </button>
                {!showResult && (
                    <button onClick={jumpToContinue} className="p-4 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-all shadow-xl group relative">
                        <FastForward size={24}/>
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">跳转最靠后未答题</div>
                    </button>
                )}
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-8 md:px-24 pt-24 pb-32 max-w-[1400px] mx-auto w-full">
          {showResult && viewMode === 'card' && (
              <div className="glass p-8 rounded-3xl mb-8 flex flex-col items-center justify-center border-t-4 border-green-500 animate-in zoom-in max-w-4xl mx-auto">
                  <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4"><Trophy size={40} /></div>
                  <h2 className="text-3xl font-black text-white">考试完成</h2>
                  <p className="text-slate-400 mt-2">准确率: {Math.round((score/questions.length)*100)}%</p>
              </div>
          )}

          {viewMode === 'list' && (
              <div className="space-y-16">
                  {groups.map((g, gIdx) => {
                      const isSplit = splitPaneMode && g.content;
                      return (
                          <div key={gIdx} className={`relative ${isSplit ? 'flex items-start gap-8' : 'block'}`}>
                              {/* Group Content */}
                              {g.content && (
                                  <div id={`group-content-${g.group_id}`} className={`${isSplit ? 'w-1/2 sticky top-8 max-h-[90vh] overflow-y-auto custom-scrollbar' : 'mb-8'}`}>
                                      <div className="p-8 bg-slate-800/80 border border-slate-600/50 rounded-3xl text-slate-300 prose prose-invert prose-lg max-w-none shadow-xl" dangerouslySetInnerHTML={{__html: g.content}}></div>
                                  </div>
                              )}
                              
                              {/* Questions */}
                              <div className={`${isSplit ? 'w-1/2 space-y-8' : 'space-y-8'}`}>
                                  {g.questions.map(q => renderQuestionCard(q))}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}

          {viewMode === 'card' && (
              <div className="relative">
                  {(() => {
                      const q = questions[currentIndex];
                      const isSplit = splitPaneMode && q.group_content;

                      return (
                          <div className={`transition-all ${isSplit ? 'flex gap-8 items-start' : 'max-w-4xl mx-auto'}`}>
                              {isSplit && (
                                  <div className="w-1/2 sticky top-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                      <div className="p-8 bg-slate-800/80 border border-slate-600/50 rounded-3xl text-slate-300 prose prose-invert prose-lg max-w-none shadow-xl" dangerouslySetInnerHTML={{__html: q.group_content}}></div>
                                  </div>
                              )}

                              <div className={`${isSplit ? 'w-1/2' : 'w-full'}`}>
                                  {!isSplit && q.group_content && (
                                      <div className="mb-8 p-8 bg-slate-800/80 border border-slate-600/50 rounded-3xl text-slate-300 prose prose-invert prose-lg max-w-none shadow-xl" dangerouslySetInnerHTML={{__html: q.group_content}}></div>
                                  )}
                                  {renderQuestionCard(q, currentIndex)}
                              </div>
                          </div>
                      );
                  })()}
              </div>
          )}
      </div>

      {/* Floating Bottom Action Bar (Only for Card mode or List mode bottom) */}
      <div className={`fixed bottom-8 z-50 transition-all ${viewMode === 'card' ? 'left-1/2 -translate-x-1/2' : 'right-32'} flex items-center gap-4 p-3 glass rounded-[2rem] border border-slate-700/50 shadow-2xl`}>
          {viewMode === 'card' && (
              <>
                  <button 
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} 
                    disabled={currentIndex === 0}
                    className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all shadow-md">
                      <ArrowLeft size={24} />
                  </button>
                  
                  <div className="px-6 font-bold text-xl text-slate-300 min-w-[120px] text-center">
                      {currentIndex + 1} <span className="text-slate-500 mx-1">/</span> {questions.length}
                  </div>

                  <button 
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} 
                    disabled={currentIndex === questions.length - 1}
                    className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all shadow-md">
                      <ArrowRight size={24} />
                  </button>

                  <div className="w-px h-10 bg-slate-700 mx-2"></div>
              </>
          )}

          {!showResult ? (
              <button onClick={submitPaper} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-1">
                  <Send size={20} /> 立即交卷
              </button>
          ) : (
              <button onClick={() => navigate('/history')} className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xl transition-all">
                  查看记录
              </button>
          )}
      </div>
    </div>
  );
}
