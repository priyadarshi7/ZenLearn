# ZenLearn

ZenLearn is an AI-powered wellness and learning platform that integrates meditation, stress management, a chatbot assistant, and VR experiences to enhance user well-being and knowledge. This repository contains both the frontend and backend components of the application.

## Features
- **Meditation Module** – Guided meditation sessions for relaxation.
- **AI Chatbot** – Intelligent assistant for answering wellness and learning-related queries.
- **Stress Management** – AI-powered stress analysis and recommendations.
- **VR Integration** – Immersive experiences for mindfulness and education.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js, Python (FastAPI)
- **Database:** MongoDB
- **AI & ML:** 
  - **Libraries & Frameworks:** MediaPipe, OpenCV, LangChain, DeepFace
  - **Models & APIs:** Groq, OpenAI, Gemini, DeepSeek, LLaMA 3, Eleven Labs

---

## Setup Instructions

### Frontend Setup (React App)
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

The frontend should now be running on `http://localhost:3000` (or another available port).

### Backend Setup (Node.js)
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server using Nodemon:
   ```sh
   nodemon index.js
   ```

### Python Backend Services (FastAPI)
Each module (meditation, chatbot, stress, VR) runs as a separate FastAPI backend. Run them individually as follows:

1. Navigate to each module’s folder (`meditation`, `chatbot`, `stress`, `VR`).
2. Install required dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```sh
   uvicorn main:app --host 0.0.0.0 --port <PORT>
   ```
   (Replace `<PORT>` with unique ports for each module, e.g., 8001, 8002, etc.)

---

## API Endpoints
| Service       | Endpoint            | Description |
|--------------|---------------------|-------------|
| Meditation   | `/meditation`       | Meditation session APIs |
| Chatbot      | `/chatbot`          | AI assistant responses |
| Stress       | `/stress`           | Stress analysis APIs |
| VR           | `/vr`               | VR experience APIs |

Each FastAPI service has its own `docs` endpoint for testing:
- Example: `http://localhost:8001/docs`

---

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

## License
This project is licensed under the MIT License.

For any questions or collaboration requests, feel free to reach out!

---
**Author:** Priyadarshi7

