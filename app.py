from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)  # Enable CORS for development


@app.route("/api/generate-plan", methods=["POST"])
def generate_plan():
    """API endpoint to generate study plan (mock AI flavored)."""
    student_name = request.form.get("student_name", "").strip()
    exam_date = request.form.get("exam_date", "")
    daily_hours = request.form.get("daily_hours", "1")

    courses: list[str] = []
    topics: list[str] = []
    difficulties: list[str] = []

    i = 1
    while True:
        course = request.form.get(f"course_{i}")
        topic = request.form.get(f"topic_{i}")
        diff = request.form.get(f"difficulty_{i}")
        if not course and not topic:
            break

        if topic:
            courses.append((course or "").strip() or "General")
            topics.append(topic.strip())
            difficulties.append((diff or "medium").lower())
        i += 1

    plan = generate_simple_plan(courses, topics, difficulties, daily_hours)
    ai_meta = build_mock_ai_meta(student_name, exam_date, daily_hours, courses, topics)

    return jsonify({
        "student_name": student_name or "Student",
        "exam_date": exam_date,
        "daily_hours": daily_hours,
        "plan": plan,
        "ai": ai_meta,
    })


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve React app for all routes."""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


def generate_simple_plan(courses, topics, difficulties, daily_hours):
    """Calculate durations, split across days if needed, and add break hints."""
    try:
        hours = float(daily_hours)
    except (TypeError, ValueError):
        hours = 1.0

    daily_quota = int(hours * 60)
    n_topics = len(topics)
    if n_topics == 0:
        return []

    base_minutes = max(20, daily_quota // n_topics)

    plan = []
    day = 1
    used_today = 0

    for idx, topic in enumerate(topics):
        course = courses[idx] if idx < len(courses) else "General"
        level = difficulties[idx] if idx < len(difficulties) else "medium"
        level = (level or "medium").lower()

        if level == "easy":
            suggested = base_minutes - 10
        elif level == "hard":
            suggested = base_minutes + 15
        else:
            suggested = base_minutes

        suggested = max(15, suggested)

        remaining = suggested
        part = 1

        while remaining > 0:
            # If daily quota is full, move to the next day
            if used_today >= daily_quota:
                day += 1
                used_today = 0

            available = max(daily_quota - used_today, 0)
            # If no minutes left today, roll over to next day
            if available == 0:
                day += 1
                used_today = 0
                available = daily_quota

            chunk = remaining if remaining <= available else available
            remaining -= chunk
            used_today += chunk

            break_after = 0
            if chunk >= 45:
                break_after = 5
            if chunk >= 80:
                break_after = 10

            task = {
                "day": f"Day {day}",
                "course": course,
                "topic": topic,
                "difficulty": level,
                "suggested_minutes": chunk,
                "ai_hint": pick_hint(level),
                "part": part if remaining > 0 or part > 1 else None,
                "break_after": break_after or None,
            }
            plan.append(task)
            part += 1

    return plan


def build_mock_ai_meta(student_name, exam_date, daily_hours, courses, topics):
    """Return mocked AI metadata shown on the UI."""
    name = student_name or "you"
    focus = topics[:2] if topics else ["focus", "consistency"]
    course_label = courses[0] if courses else "your main course"

    summary = (
        f"Simulated AI suggests a balanced plan for {name}. "
        f"Lean on {course_label}, keep daily pace ~{daily_hours}h, "
        f"and touch {', '.join(focus)} early."
    )
    tips = [
        "⚡ Start with a 20-minute warm-up problem.",
        "🧠 After hard topics, do a 5-minute recall test.",
        "⏱️ After 45-50 minutes of focus, take a 5-10 minute break.",
        "🌙 Stop 30 minutes before sleep for quick review.",
    ]
    return {
        "model": "mock-gpt-study-001",
        "summary": summary,
        "tips": tips,
        "exam_date": exam_date,
    }


def pick_hint(level):
    """Lightweight hint based on difficulty."""
    if level == "easy":
        return "Quick win 🎯"
    if level == "hard":
        return "Deep focus 🔥"
    return "Steady pace 🚀"


if __name__ == "__main__":
    app.run(debug=True, port=5000)
