import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Difficulty = 'easy' | 'medium' | 'hard';

interface PlanItem {
  day: string;
  course: string;
  topic: string;
  difficulty: Difficulty;
  suggested_minutes: number;
  ai_hint?: string;
  part?: number | null;
  break_after?: number | null;
}

interface AiMeta {
  model: string;
  summary: string;
  tips: string[];
  exam_date?: string;
}

interface PlanResponse {
  student_name: string;
  exam_date: string;
  daily_hours: string;
  plan: PlanItem[];
  ai?: AiMeta;
}

type TimedPlanItem = PlanItem & { id: string };

const difficultyTone: Record<Difficulty, { badge: string; emoji: string }> = {
  easy: { badge: 'success', emoji: '😊' },
  medium: { badge: 'warning', emoji: '⚡' },
  hard: { badge: 'danger', emoji: '🔥' },
};

const StudyPlanView: React.FC = () => {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastHint, setLastHint] = useState<string | null>(null);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem('studyPlan');
    if (!storedPlan) {
      navigate('/');
      return;
    }
    setPlanData(JSON.parse(storedPlan) as PlanResponse);
  }, [navigate]);

  const totalMinutes = useMemo(() => {
    if (!planData) return 0;
    return planData.plan.reduce((sum, item) => sum + item.suggested_minutes, 0);
  }, [planData]);

  const tasks: TimedPlanItem[] = useMemo(() => {
    if (!planData) return [];
    return planData.plan.map((item, idx) => ({ ...item, id: `${idx}-${item.day}` }));
  }, [planData]);

  const groupedDays = useMemo(() => {
    const order: string[] = [];
    const map: Record<string, TimedPlanItem[]> = {};
    tasks.forEach((item) => {
      if (!map[item.day]) {
        map[item.day] = [];
        order.push(item.day);
      }
      map[item.day].push(item);
    });
    return order.map((day) => ({ day, items: map[day] }));
  }, [tasks]);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId) || null,
    [tasks, activeId]
  );

  useEffect(() => {
    if (!activeTask) {
      setIsRunning(false);
      setRemainingSeconds(0);
      return;
    }
    setRemainingSeconds(activeTask.suggested_minutes * 60);
    setIsRunning(false);
  }, [activeTask]);

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;
    const t = setInterval(() => {
      setRemainingSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds === 0 && activeTask) {
      setIsRunning(false);
      if (activeTask.break_after) {
        setLastHint(`Time is up! Take a ${activeTask.break_after}-minute break.`);
      } else {
        setLastHint('Time is up! Great job, move to the next item.');
      }
    }
  }, [remainingSeconds, activeTask]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = (task: TimedPlanItem) => {
    setActiveId(task.id);
    setRemainingSeconds(task.suggested_minutes * 60);
    setIsRunning(true);
    setLastHint(null);
  };

  const handlePause = () => setIsRunning(false);

  const handleResume = () => {
    if (!activeTask) return;
    setIsRunning(true);
  };

  if (!planData) return <div className="glass-card">Loading...</div>;

  return (
    <div className="page-grid">
      <div className="hero">
        <p className="eyebrow">AI mock output</p>
        <h1>
          Plan for {planData.student_name} <span className="accent">🎯</span>
        </h1>
        <p className="lead">
          Daily {planData.daily_hours} hours • {planData.plan.length} topics • {totalMinutes} minutes suggested
        </p>
        <div className="hero-badges">
          <span className="chip chip-solid">🤖 {planData.ai?.model || 'mock-gpt-study-001'}</span>
          <span className="chip chip-ghost">📅 {planData.exam_date || 'No exam date'}</span>
          <span className="chip chip-ghost">✨ Mock AI summary</span>
        </div>
      </div>

      <div className="glass-card">
        <div className="card-header-inline">
          <div>
            <p className="eyebrow">AI comment</p>
            <h3>Summary & tips</h3>
          </div>
          <div className="ai-pill">Simulated</div>
        </div>
        <p className="muted">{planData.ai?.summary || 'AI summary not available.'}</p>
        {lastHint && (
          <div className="chip chip-solid" style={{ marginTop: '10px' }}>
            {lastHint}
          </div>
        )}
        <div className="tips-row">
          {(planData.ai?.tips || []).map((tip, idx) => (
            <div key={idx} className="tip-pill">
              {tip}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <div className="card-header-inline">
          <div>
            <p className="eyebrow">Timeline</p>
            <h3>Suggestions by day</h3>
          </div>
          <div className="pill">
            <span className="dot" />
            {groupedDays.length} day(s)
          </div>
        </div>

        <div className="day-grid">
          {groupedDays.map((block, idx) => {
            const dayMinutes = block.items.reduce((sum, i) => sum + i.suggested_minutes, 0);
            return (
              <div key={block.day + idx} className="day-card">
                <div className="day-top">
                  <div className="day-left">
                    <span className="chip chip-solid">{block.day}</span>
                    <span className="muted small">• {dayMinutes} minutes total</span>
                  </div>
                  <div className="pill">
                    <span className="dot" />
                    {block.items.length} topic(s)
                  </div>
                </div>
                <div className="topic-grid">
                  {block.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="topic-card">
                      <div className="topic-head">
                        <span className="badge-neo">
                          {difficultyTone[item.difficulty].emoji} {item.difficulty}
                        </span>
                        <span className="chip chip-ghost">
                          ⏱️ {item.suggested_minutes} min{item.part ? ` • Part ${item.part}` : ''}
                        </span>
                      </div>
                      <h4>{item.course}</h4>
                      <p className="muted">{item.topic}</p>
                      <div className="chip chip-ghost">{item.ai_hint || 'AI hint'}</div>
                      {item.break_after ? (
                        <div className="chip chip-solid">
                          🧘 {item.break_after} min break
                        </div>
                      ) : null}
                      <div className="timer-row">
                        {activeId === item.id ? (
                          <>
                            <span className="chip chip-ghost">
                              ⌛ {formatTime(remainingSeconds)}
                            </span>
                            {isRunning ? (
                              <button className="btn-mini" onClick={handlePause}>
                                ⏸️ Pause
                              </button>
                            ) : (
                              <button className="btn-mini" onClick={handleResume}>
                                ▶ Resume
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="btn-mini" onClick={() => handleStart(item)}>
                            ▶ Start timer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="actions-row">
          <button onClick={() => navigate('/')} className="btn-ghost">
            ← Back and edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanView;
