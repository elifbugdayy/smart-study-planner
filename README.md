# Smart Study Planner

A React-based study planning application with a Flask backend.

## Setup

### Backend (Flask)
1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Frontend (React)
1. Install Node.js dependencies:
```bash
npm install
```

## Development

### Run React development server:
```bash
npm start
```
This will start the React app on http://localhost:3000

### Run Flask backend:
```bash
python app.py
```
This will start the Flask API on http://localhost:5000

**Note:** In development, you'll need to run both servers. The React app will proxy API requests to the Flask backend.

## Production Build

1. Build the React app:
```bash
npm run build
```

2. Run Flask server (it will serve the built React app):
```bash
python app.py
```

The Flask server will serve the React app from the `/build` directory.

