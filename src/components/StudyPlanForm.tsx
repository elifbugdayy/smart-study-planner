import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type Difficulty = 'easy' | 'medium' | 'hard';

interface TopicInput {
  course: string;
  topic: string;
  difficulty: Difficulty;
}

interface FormState {
  student_name: string;
  exam_date: string;
  daily_hours: string;
  topics: TopicInput[];
}

interface PlanItem {
  day: string;
  course: string;
  topic: string;
  difficulty: Difficulty;
  suggested_minutes: number;
  ai_hint?: string;
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

const StudyPlanForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>({
    student_name: '',
    exam_date: '',
    daily_hours: '3',
    topics: [{ course: '', topic: '', difficulty: 'medium' }],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (index: number, field: keyof TopicInput, value: string) => {
    setFormData(prev => {
      const topics = [...prev.topics];
      topics[index] = { ...topics[index], [field]: value } as TopicInput;
      return { ...prev, topics };
    });
  };

  const addTopic = () =>
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, { course: '', topic: '', difficulty: 'medium' }],
    }));

  const removeTopic = (index: number) => {
    if (formData.topics.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('student_name', formData.student_name);
    formDataToSend.append('exam_date', formData.exam_date);
    formDataToSend.append('daily_hours', formData.daily_hours);

    formData.topics.forEach((item, idx) => {
      if (item.topic.trim()) {
        formDataToSend.append(`course_${idx + 1}`, item.course || '');
        formDataToSend.append(`topic_${idx + 1}`, item.topic);
        formDataToSend.append(`difficulty_${idx + 1}`, item.difficulty);
      }
    });

    try {
      const response = await fetch('/api/generate-plan', { method: 'POST', body: formDataToSend });
      if (!response.ok) throw new Error('API error');

      const data = (await response.json()) as PlanResponse;
      sessionStorage.setItem('studyPlan', JSON.stringify(data));
      navigate('/plan');
    } catch (err) {
      console.error(err);
      alert('Could not generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-grid">
      <div className="hero">
        <p className="eyebrow">AI mock engine • playful UI</p>
        <h1>
          🚀 AI-powered <span className="accent">study coach</span>
        </h1>
        <p className="lead">
          Add topics, choose difficulty, and let the (mock) AI build a colorful plan with breaks.
        </p>
        <div className="hero-badges">
          <span className="chip chip-ghost">🧠 Mock AI active</span>
          <span className="chip chip-ghost">🎨 Theme switcher</span>
          <span className="chip chip-ghost">⚡ Animated controls</span>
        </div>
      </div>

      <div className="glass-card">
        <div className="card-header-inline">
          <div>
            <p className="eyebrow">Build your plan</p>
            <h3>Fluid form</h3>
          </div>
          <div className="ai-pill">🤖 Mock AI</div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="input-stack">
            <label className="form-label">Your name</label>
            <input
              type="text"
              name="student_name"
              className="input-neo"
              placeholder="Elif"
              value={formData.student_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid-two">
            <div className="input-stack">
              <label className="form-label">Exam date (YYYY-MM-DD)</label>
              <input
                type="text"
                name="exam_date"
                className="input-neo"
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
                pattern="\d{4}-\d{2}-\d{2}"
                maxLength={10}
                value={formData.exam_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-stack">
              <label className="form-label">Daily available study hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                name="daily_hours"
                className="input-neo"
                value={formData.daily_hours}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="topics-header">
            <div>
              <p className="eyebrow">Topic list</p>
              <h4>One topic per row</h4>
              <p className="muted">Pick difficulty; AI adjusts time and break suggestions.</p>
            </div>
            <button type="button" className="btn-ghost" onClick={addTopic}>
              + Add topic
            </button>
          </div>

          <div className="topics-wrap">
            {formData.topics.map((item, index) => (
              <div key={index} className="topic-row-neo">
                <div className="input-stack">
                  <label className="form-label">Course</label>
                  <input
                    type="text"
                    className="input-neo"
                    placeholder="e.g. Data Structures"
                    value={item.course}
                    onChange={e => handleTopicChange(index, 'course', e.target.value)}
                    required
                  />
                </div>
                <div className="input-stack">
                  <label className="form-label">Topic</label>
                  <input
                    type="text"
                    className="input-neo"
                    placeholder="e.g. Arrays"
                    value={item.topic}
                    onChange={e => handleTopicChange(index, 'topic', e.target.value)}
                    required
                  />
                </div>
                <div className="input-stack">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="input-neo select"
                    value={item.difficulty}
                    onChange={e => handleTopicChange(index, 'difficulty', e.target.value as Difficulty)}
                  >
                    <option value="easy">Easy 😊</option>
                    <option value="medium">Medium 🙂</option>
                    <option value="hard">Hard 🔥</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn-ghost danger"
                  onClick={() => removeTopic(index)}
                  disabled={formData.topics.length === 1}
                  title="Remove this topic"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="submit-row">
            <div className="pill">
              <span className="dot" />
              Mock AI responds • no real API key required
            </div>
            <button type="submit" className="btn-primary-neo" disabled={isLoading}>
              {isLoading ? '⏳ Generating plan...' : '🚀 Generate with AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyPlanForm;
