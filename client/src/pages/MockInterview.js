import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const QUESTION_TIME = 120; // 2 minutes per question

export default function MockInterview() {
  const [step, setStep] = useState('setup');
  const [form, setForm] = useState({ role: '', details: '' });
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      // Auto-submit when time runs out
      if (answer.trim()) submitAnswer();
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft]);

  const resetTimer = () => { setTimeLeft(QUESTION_TIME); setTimerActive(true); };

  const timerColor = timeLeft > 60 ? '#10b981' : timeLeft > 30 ? '#f59e0b' : '#ef4444';
  const timerPct = (timeLeft / QUESTION_TIME) * 100;

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported'); return; }
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onresult = (e) => { setAnswer(Array.from(e.results).map(r => r[0].transcript).join('')); };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start(); setIsRecording(true);
  };
  const stopVoice = () => { recognitionRef.current?.stop(); setIsRecording(false); };

  const startInterview = async () => {
    if (!form.role) return;
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/interview/start', form);
      setInterview({ id: res.data.interviewId, role: res.data.role });
      setQuestions(res.data.questions);
      setStep('interview');
      resetTimer();
    } catch(err) { setError(err.response?.data?.message || 'Failed to start interview'); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setTimerActive(false);
    setEvalLoading(true);
    try {
      const res = await axios.post('/api/interview/answer', { interviewId: interview.id, questionIndex: currentQ, answer });
      setEvaluations(prev => [...prev, { ...res.data.evaluation, questionIndex: currentQ }]);
      setAnswer('');
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        resetTimer();
      } else {
        await completeInterview();
      }
    } catch(err) { setError('Failed to evaluate answer'); }
    finally { setEvalLoading(false); }
  };

  const completeInterview = async () => {
    try {
      const res = await axios.post('/api/interview/complete', { interviewId: interview.id });
      setResults(res.data); setStep('results');
    } catch(err) { setError('Failed to complete interview'); }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (step === 'setup') return (
    <div>
      <div className="page-header">
        <h1>🎤 Mock Interview</h1>
        <p>Curated Questions with instant feedback and a 2-minute timer per question</p>
      </div>
      <div style={{maxWidth:'540px'}}>
        <div className="card">
          <h3 style={{marginBottom:'1.5rem'}}>Start Your Interview Session</h3>
          {error && <div style={{background:'#fee2e2',color:'#991b1b',padding:'0.75rem',borderRadius:'8px',marginBottom:'1rem'}}>{error}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
            <div>
              <label style={lStyle}>Target Role *</label>
              <input className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="e.g. React Developer, Data Scientist, ML Engineer" />
            </div>
            <div>
              <label style={lStyle}>Additional Details <span style={{color:'#94a3b8'}}>(optional)</span></label>
              <textarea className="textarea" value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="e.g. entry level, 1 year experience..." style={{minHeight:'80px'}} />
            </div>
            <div style={{background:'#f8fafc',borderRadius:'8px',padding:'1rem'}}>
              {['10 questions (technical + behavioral)','⏱ 2 minute timer per question','Answer by typing or voice','Instant feedback after each','Final score and improvement tips'].map((item,i)=>(
                <div key={i} style={{fontSize:'0.85rem',color:'#64748b',padding:'0.2rem 0'}}>✓ {item}</div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg" onClick={startInterview} disabled={loading||!form.role} style={{justifyContent:'center'}}>
              {loading ? <><div className="spinner" style={{width:'16px',height:'16px',borderWidth:'2px'}}></div> Preparing...</> : ' Start Interview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 'interview') return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <div>
          <h2>🎤 {interview?.role} Interview</h2>
          <p style={{color:'#64748b'}}>Question {currentQ+1} of {questions.length}</p>
        </div>
        {/* Timer */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'2rem',fontWeight:800,color:timerColor,fontVariantNumeric:'tabular-nums'}}>{formatTime(timeLeft)}</div>
          <div style={{width:'100px',height:'6px',background:'#e2e8f0',borderRadius:'4px',marginTop:'0.25rem'}}>
            <div style={{width:`${timerPct}%`,height:'6px',background:timerColor,borderRadius:'4px',transition:'width 1s linear,background 0.5s'}}></div>
          </div>
          <div style={{fontSize:'0.72rem',color:'#94a3b8',marginTop:'0.2rem'}}>time remaining</div>
        </div>
      </div>

      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
        {questions.map((_,i)=>(
          <div key={i} style={{width:'28px',height:'28px',borderRadius:'50%',background:i<currentQ?'#10b981':i===currentQ?'#2563eb':'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',color:i<=currentQ?'white':'#94a3b8',fontWeight:600}}>{i+1}</div>
        ))}
      </div>

      <div style={{background:'#e2e8f0',borderRadius:'8px',height:'6px',marginBottom:'1.5rem'}}>
        <div style={{background:'#2563eb',height:'6px',borderRadius:'8px',width:`${(currentQ/questions.length)*100}%`,transition:'width 0.5s'}}></div>
      </div>

      <div className="card" style={{marginBottom:'1.5rem',borderTop:'4px solid #2563eb'}}>
        <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-start'}}>
          <div style={{width:'40px',height:'40px',background:'#dbeafe',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:700,color:'#1d4ed8',flexShrink:0}}>{currentQ+1}</div>
          <div>
            <p style={{fontSize:'0.8rem',color:'#64748b',marginBottom:'0.25rem',fontWeight:500}}>QUESTION {currentQ+1} · {questions[currentQ]?.type?.toUpperCase()}</p>
            <p style={{fontSize:'1.05rem',fontWeight:500,lineHeight:1.6}}>{questions[currentQ]?.question}</p>
          </div>
        </div>
      </div>

      {evaluations.length > 0 && currentQ > 0 && (
        <div className="card" style={{marginBottom:'1.5rem',background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
          <p style={{fontSize:'0.85rem',fontWeight:600,color:'#065f46',marginBottom:'0.25rem'}}>✅ Previous — Score: {evaluations[evaluations.length-1]?.score}/10</p>
          <p style={{fontSize:'0.85rem',color:'#166534'}}>{evaluations[evaluations.length-1]?.feedback}</p>
        </div>
      )}

      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
          <label style={{fontWeight:600,fontSize:'0.95rem'}}>Your Answer</label>
          <button onClick={isRecording?stopVoice:startVoice} className={`btn btn-sm ${isRecording?'btn-danger':'btn-secondary'}`}>
            {isRecording ? '⏹ Stop' : '🎙 Voice'}
          </button>
        </div>
        {isRecording && <div style={{background:'#fee2e2',color:'#991b1b',padding:'0.5rem',borderRadius:'6px',fontSize:'0.82rem',marginBottom:'0.75rem'}}>🔴 Recording... speak now</div>}
        <textarea className="textarea" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer or use voice recording..." style={{minHeight:'140px',marginBottom:'1rem'}} />
        {error && <div style={{background:'#fee2e2',color:'#991b1b',padding:'0.5rem',borderRadius:'6px',fontSize:'0.85rem',marginBottom:'0.75rem'}}>{error}</div>}
        <button className="btn btn-primary btn-lg" onClick={submitAnswer} disabled={evalLoading||!answer.trim()} style={{width:'100%',justifyContent:'center'}}>
          {evalLoading ? <><div className="spinner" style={{width:'16px',height:'16px',borderWidth:'2px'}}></div> Evaluating...</> : currentQ===questions.length-1?'✅ Submit & Finish':'Next Question →'}
        </button>
      </div>
    </div>
  );

  if (step === 'results' && results) {
    const overall = results.overallData;
    return (
      <div>
        <div className="page-header">
          <h1>📊 Interview Results</h1>
          <p>{interview?.role} Mock Interview — Completed</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'4rem',fontWeight:800,color:results.totalScore>=7?'#10b981':results.totalScore>=5?'#f59e0b':'#ef4444'}}>{results.totalScore}</div>
            <div style={{fontSize:'1rem',color:'#64748b'}}>out of 10</div>
            <div style={{marginTop:'0.5rem',fontSize:'1.1rem',fontWeight:600}}>{results.totalScore>=7?'Excellent! 🎉':results.totalScore>=5?'Good Job! 👍':'Keep Practicing 💪'}</div>
          </div>
          <div className="card">
            <h4 style={{marginBottom:'0.75rem'}}>📝 Overall Feedback</h4>
            <p style={{color:'#374151',lineHeight:1.7,fontSize:'0.9rem'}}>{overall?.overallFeedback}</p>
          </div>
        </div>
        <div className="grid-2" style={{marginBottom:'1.5rem'}}>
          <div className="card">
            <h4 style={{color:'#10b981',marginBottom:'0.75rem'}}>✅ Strong Areas</h4>
            {overall?.strongAreas?.map((a,i)=><div key={i} style={{padding:'0.35rem 0',fontSize:'0.9rem',borderBottom:'1px solid #f1f5f9'}}>• {a}</div>)}
          </div>
          <div className="card">
            <h4 style={{color:'#f59e0b',marginBottom:'0.75rem'}}>📈 Improve On</h4>
            {overall?.improvementAreas?.map((a,i)=><div key={i} style={{padding:'0.35rem 0',fontSize:'0.9rem',borderBottom:'1px solid #f1f5f9'}}>• {a}</div>)}
          </div>
        </div>
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <h4 style={{marginBottom:'0.75rem'}}>🚀 Next Steps</h4>
          {overall?.nextSteps?.map((s,i)=><div key={i} style={{display:'flex',gap:'0.75rem',padding:'0.4rem 0',fontSize:'0.9rem',borderBottom:'1px solid #f1f5f9'}}><span style={{fontWeight:700,color:'#2563eb'}}>{i+1}.</span><span>{s}</span></div>)}
        </div>
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <h4 style={{marginBottom:'1rem'}}>Question-by-Question Breakdown</h4>
          {evaluations.map((ev,i)=>(
            <div key={i} style={{padding:'0.75rem 0',borderBottom:'1px solid #f1f5f9'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.35rem'}}>
                <span style={{fontWeight:500,fontSize:'0.9rem'}}>Q{i+1}: {questions[i]?.question?.substring(0,60)}...</span>
                <span style={{fontWeight:700,color:ev.score>=7?'#10b981':ev.score>=5?'#f59e0b':'#ef4444'}}>{ev.score}/10</span>
              </div>
              <p style={{fontSize:'0.82rem',color:'#64748b'}}>{ev.feedback}</p>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={()=>{setStep('setup');setForm({role:'',details:''});setEvaluations([]);setCurrentQ(0);setResults(null);}}>🔄 Try Again</button>
      </div>
    );
  }
  return null;
}

const lStyle = {display:'block',fontSize:'0.9rem',fontWeight:500,color:'#374151',marginBottom:'0.4rem'};
