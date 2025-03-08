import streamlit as st
import cv2
import mediapipe as mp
import numpy as np
from collections import deque
import time
from datetime import datetime
import pandas as pd
import os
import csv
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image

# Set page config for better appearance
st.set_page_config(
    page_title="Meditation Coach",
    page_icon="🧘",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize MediaPipe models globally to avoid reloading
@st.cache_resource
def load_mediapipe_models():
    mp_pose = mp.solutions.pose
    mp_face = mp.solutions.face_mesh
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    face = mp_face.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    return mp_pose, mp_face, pose, face

mp_pose, mp_face, pose, face = load_mediapipe_models()

# Constants
MOVEMENT_THRESHOLD = 0.015
POSTURE_ANGLE_THRESHOLD = 8
EAR_THRESHOLD = 0.20
CLOSED_FRAMES_THRESHOLD = 3

# Face mesh indices
LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]

# Initialize session state
if 'session_active' not in st.session_state:
    st.session_state.session_active = False
if 'session_data' not in st.session_state:
    st.session_state.session_data = {
        'start_time': time.time(),
        'total_frames': 0,
        'good_frames': 0,
        'mistakes': {
            'posture': 0,
            'eyes': 0,
            'movement': 0,
            'total': 0
        },
        'focus_score': 0.0,
        'feedback': []
    }
if 'movement_history' not in st.session_state:
    st.session_state.movement_history = []
if 'eye_closed_frames' not in st.session_state:
    st.session_state.eye_closed_frames = 0
if 'past_sessions' not in st.session_state:
    st.session_state.past_sessions = []
if 'camera_index' not in st.session_state:
    st.session_state.camera_index = 0

# Helper functions
def calculate_ear(eye_landmarks, frame_width, frame_height):
    """Calculate Eye Aspect Ratio for eye openness detection"""
    def get_point(index):
        return np.array([eye_landmarks[index].x * frame_width, 
                        eye_landmarks[index].y * frame_height])
    
    p1 = get_point(0)
    p2 = get_point(1)
    p3 = get_point(2)
    p4 = get_point(3)
    p5 = get_point(4)
    p6 = get_point(5)

    # Calculate EAR (Eye Aspect Ratio)
    vertical1 = np.linalg.norm(p2 - p6)
    vertical2 = np.linalg.norm(p3 - p5)
    horizontal = np.linalg.norm(p1 - p4)
    return (vertical1 + vertical2) / (2 * horizontal)

def check_posture(pose_landmarks, frame_width, frame_height):
    """Check if posture is correct based on spine angle"""
    try:
        # Get required landmarks
        left_shoulder = pose_landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = pose_landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        left_hip = pose_landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = pose_landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]

        # Calculate mid points
        mid_shoulder = np.array([(left_shoulder.x + right_shoulder.x)/2 * frame_width,
                               (left_shoulder.y + right_shoulder.y)/2 * frame_height])
        mid_hip = np.array([(left_hip.x + right_hip.x)/2 * frame_width,
                          (left_hip.y + right_hip.y)/2 * frame_height])

        # Calculate angle from vertical
        dx = mid_hip[0] - mid_shoulder[0]
        dy = mid_hip[1] - mid_shoulder[1]
        angle = np.degrees(np.arctan2(dx, dy))
        return abs(angle) < POSTURE_ANGLE_THRESHOLD
    except:
        return False

def save_session_report():
    """Generate and save session report as CSV and return dataframe"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    duration = time.time() - st.session_state.session_data['start_time']
    data = st.session_state.session_data
    
    # Calculate focus score
    if data['total_frames'] > 0:
        data['focus_score'] = (data['good_frames'] / data['total_frames']) * 100
    
    # Create directory if it doesn't exist
    os.makedirs('session_reports', exist_ok=True)
    
    # Create CSV report
    report_path = f"session_reports/meditation_report_{timestamp}.csv"
    with open(report_path, "w", newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Timestamp", timestamp])
        writer.writerow(["Duration (seconds)", duration])
        writer.writerow(["Focus Score (%)", data['focus_score']])
        writer.writerow(["Posture Errors", data['mistakes']['posture']])
        writer.writerow(["Eye Openings", data['mistakes']['eyes']])
        writer.writerow(["Movement Instances", data['mistakes']['movement']])
        writer.writerow(["Total Mistakes", data['mistakes']['total']])
    
    # Create DataFrame for report display
    df = pd.DataFrame({
        'Timestamp': [timestamp],
        'Duration': [f"{int(duration // 60)}:{int(duration % 60):02d}"],
        'Focus Score': [f"{data['focus_score']:.1f}%"],
        'Posture Errors': [data['mistakes']['posture']],
        'Eye Openings': [data['mistakes']['eyes']],
        'Movement Instances': [data['mistakes']['movement']],
        'Total Mistakes': [data['mistakes']['total']]
    })
    
    # Add to past sessions
    st.session_state.past_sessions.append({
        'timestamp': timestamp,
        'duration': duration,
        'focus_score': data['focus_score'],
        'mistakes': data['mistakes'].copy()
    })
    
    return df

def process_frame(frame):
    """Process a single frame for meditation monitoring"""
    # Flip frame horizontally
    frame = cv2.flip(frame, 1)
    frame_height, frame_width = frame.shape[:2]
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Increment frame counter
    st.session_state.session_data['total_frames'] += 1
    current_mistakes = []
    feedback_lines = []
    
    # Process frame with MediaPipe
    pose_results = pose.process(rgb_frame)
    face_results = face.process(rgb_frame)

    # Posture check
    posture_good = False
    if pose_results.pose_landmarks:
        posture_good = check_posture(pose_results.pose_landmarks.landmark, frame_width, frame_height)
        if not posture_good:
            current_mistakes.append('posture')
            feedback_lines.append("Straighten your back!")

    # Eye state check
    eyes_closed = False
    if face_results.multi_face_landmarks:
        face_landmarks = face_results.multi_face_landmarks[0].landmark
        left_ear = calculate_ear([face_landmarks[i] for i in LEFT_EYE_INDICES], frame_width, frame_height)
        right_ear = calculate_ear([face_landmarks[i] for i in RIGHT_EYE_INDICES], frame_width, frame_height)
        avg_ear = (left_ear + right_ear) / 2

        if avg_ear < EAR_THRESHOLD:
            st.session_state.eye_closed_frames += 1
            if st.session_state.eye_closed_frames >= CLOSED_FRAMES_THRESHOLD:
                feedback_lines.append("Eyes closed - good!")
                eyes_closed = True
            else:
                feedback_lines.append("Blinking detected")
        else:
            current_mistakes.append('eyes')
            st.session_state.eye_closed_frames = 0
            feedback_lines.append("Keep eyes closed!")

    # Movement detection
    movement_detected = False
    if pose_results.pose_landmarks:
        nose = pose_results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE.value]
        current_pos = np.array([nose.x, nose.y])
        
        if len(st.session_state.movement_history) > 0:
            movement_history_array = np.array(st.session_state.movement_history)
            avg_pos = np.mean(movement_history_array, axis=0)
            movement = np.linalg.norm(current_pos - avg_pos)
            if movement > MOVEMENT_THRESHOLD:
                current_mistakes.append('movement')
                feedback_lines.append("Stay still!")
                movement_detected = True
        
        # Update movement history (keep last 10 positions)
        st.session_state.movement_history.append(current_pos)
        if len(st.session_state.movement_history) > 10:
            st.session_state.movement_history.pop(0)

    # Update session data
    if not current_mistakes:
        st.session_state.session_data['good_frames'] += 1
        
    for mistake in set(current_mistakes):
        st.session_state.session_data['mistakes'][mistake] += 1
        st.session_state.session_data['mistakes']['total'] += 1

    # Calculate current focus score
    if st.session_state.session_data['total_frames'] > 0:
        st.session_state.session_data['focus_score'] = (st.session_state.session_data['good_frames'] / 
                                                       st.session_state.session_data['total_frames']) * 100
    
    # Update feedback
    st.session_state.session_data['feedback'] = feedback_lines[:3]
    
    # Draw feedback on frame
    y_offset = 30
    for line in feedback_lines[:3]:
        color = (0, 255, 0) if "good" in line.lower() else (0, 0, 255)
        cv2.putText(frame, line, (10, y_offset), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        y_offset += 30

    # Show real-time stats
    stats_text = f"Focus: {st.session_state.session_data['focus_score']:.1f}% | Mistakes: {st.session_state.session_data['mistakes']['total']}"
    cv2.putText(frame, stats_text, (10, frame_height - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    return frame

def reset_session_data():
    """Reset session data for a new meditation session"""
    st.session_state.session_data = {
        'start_time': time.time(),
        'total_frames': 0,
        'good_frames': 0,
        'mistakes': {
            'posture': 0,
            'eyes': 0,
            'movement': 0,
            'total': 0
        },
        'focus_score': 0.0,
        'feedback': []
    }
    st.session_state.movement_history = []
    st.session_state.eye_closed_frames = 0

def generate_progress_charts():
    """Generate charts to visualize progress across sessions"""
    if not st.session_state.past_sessions:
        return None, None
    
    # Prepare data for charts
    timestamps = []
    focus_scores = []
    mistake_types = {'posture': [], 'eyes': [], 'movement': []}
    
    for session in st.session_state.past_sessions:
        timestamps.append(session['timestamp'])
        focus_scores.append(session['focus_score'])
        for mistake_type in mistake_types.keys():
            mistake_types[mistake_type].append(session['mistakes'][mistake_type])
    
    # Focus score trend
    focus_df = pd.DataFrame({
        'Session': timestamps,
        'Focus Score': focus_scores
    })
    focus_chart = px.line(focus_df, x='Session', y='Focus Score', 
                         title='Focus Score Trend',
                         markers=True)
    focus_chart.update_layout(xaxis_title='Session', 
                             yaxis_title='Focus Score (%)',
                             yaxis_range=[0, 100])
    
    # Mistakes breakdown
    mistakes_df = pd.DataFrame({
        'Session': timestamps,
        'Posture': mistake_types['posture'],
        'Eyes': mistake_types['eyes'],
        'Movement': mistake_types['movement']
    })
    
    mistakes_chart = px.bar(mistakes_df.melt(id_vars=['Session'], 
                                          value_vars=['Posture', 'Eyes', 'Movement'],
                                          var_name='Mistake Type', 
                                          value_name='Count'),
                          x='Session', y='Count', color='Mistake Type',
                          title='Mistakes by Type Across Sessions',
                          barmode='group')
    
    return focus_chart, mistakes_chart

# Main app
def main():
    # Custom CSS
    st.markdown("""
        <style>
        .main {
            background-color: #f5f7f9;
        }
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
        }
        .stTabs [data-baseweb="tab"] {
            background-color: #f0f2f6;
            border-radius: 6px 6px 0px 0px;
            padding: 10px 16px;
            border: none;
        }
        .stTabs [aria-selected="true"] {
            background-color: #e0e5ec;
            border-bottom: 2px solid #4e8cff;
        }
        .stButton>button {
            width: 100%;
            border-radius: 6px;
            height: 3em;
            font-weight: bold;
        }
        .feedback-box {
            border-radius: 10px;
            padding: 20px;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .metric-box {
            border-radius: 10px;
            padding: 15px;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            text-align: center;
            margin-bottom: 15px;
        }
        </style>
    """, unsafe_allow_html=True)

    # App title and description
    st.title("🧘‍♀️ Meditation Coach")
    st.markdown("""
    This application helps improve your meditation practice by monitoring your **posture**, **eye closure**, and **movement**. 
    It provides real-time feedback and generates reports to track your progress over time.
    """)
    
    # Sidebar settings
    with st.sidebar:
        st.header("⚙️ Settings")
        
        # Camera selection
        st.subheader("Camera")
        camera_index = st.number_input("Camera Index", min_value=0, value=st.session_state.camera_index)
        if camera_index != st.session_state.camera_index:
            st.session_state.camera_index = camera_index
            st.experimental_rerun()
        
        st.divider()
        
        # Sensitivity settings
        st.subheader("Meditation Parameters")
        movement_threshold = st.slider("Movement Sensitivity", 0.005, 0.030, MOVEMENT_THRESHOLD, 0.001,
                                     help="Lower values detect smaller movements")
        posture_threshold = st.slider("Posture Threshold", 5, 15, POSTURE_ANGLE_THRESHOLD, 1,
                                    help="Higher values allow more posture deviation")
        ear_threshold = st.slider("Eye Closure Threshold", 0.15, 0.30, EAR_THRESHOLD, 0.01,
                                help="Adjust for your eye shape - lower values are more sensitive")
        
        # Session controls
        st.subheader("Session Controls")
        col1, col2 = st.columns(2)
        
        with col1:
            start_button = st.button("▶️ Start", use_container_width=True, 
                                    disabled=st.session_state.session_active)
        with col2:
            stop_button = st.button("⏹️ Stop", use_container_width=True,
                                   disabled=not st.session_state.session_active)
    
    # Main tabs
    tabs = st.tabs(["📹 Meditation Session", "📊 Analytics", "ℹ️ Guide"])
    
    # Tab 1: Meditation Session
    with tabs[0]:
        # Session active state
        if start_button:
            st.session_state.session_active = True
            reset_session_data()
        
        if stop_button and st.session_state.session_active:
            st.session_state.session_active = False
            report_df = save_session_report()
            st.success("Session completed! Report saved.")
            st.dataframe(report_df)
        
        # Video feed
        if st.session_state.session_active:
            # Create two columns for video and feedback
            col1, col2 = st.columns([7, 3])
            
            with col1:
                # Video placeholder
                video_placeholder = st.empty()
                
                # Run the webcam feed
                cap = cv2.VideoCapture(st.session_state.camera_index)
                
                # Check if camera opened successfully
                if not cap.isOpened():
                    st.error(f"Error: Camera index {st.session_state.camera_index} not available. Try a different index.")
                    st.session_state.session_active = False
                else:
                    try:
                        while st.session_state.session_active:
                            ret, frame = cap.read()
                            if not ret:
                                st.error("Failed to capture frame from camera.")
                                break
                            
                            # Process the frame
                            processed_frame = process_frame(frame)
                            
                            # Display the processed frame
                            video_placeholder.image(processed_frame, channels="BGR", use_container_width=True)
                    except Exception as e:
                        st.error(f"Error occurred: {str(e)}")
                    finally:
                        cap.release()
            
            with col2:
                # Real-time feedback box
                st.markdown("<div class='feedback-box'>", unsafe_allow_html=True)
                st.subheader("Real-time Feedback")
                
                # Display current focus score
                focus_score = st.session_state.session_data['focus_score']
                st.markdown(f"<h1 style='text-align: center; color: {'green' if focus_score > 80 else 'orange' if focus_score > 50 else 'red'};'>{focus_score:.1f}%</h1>", 
                          unsafe_allow_html=True)
                st.caption("Current Focus Score", unsafe_allow_html=True)
                
                # Display session time
                elapsed_time = time.time() - st.session_state.session_data['start_time']
                minutes, seconds = divmod(int(elapsed_time), 60)
                st.markdown(f"<h3 style='text-align: center;'>{minutes:02d}:{seconds:02d}</h3>", 
                          unsafe_allow_html=True)
                st.caption("Session Time", unsafe_allow_html=True)
                
                # Display feedback messages
                st.subheader("Feedback")
                for feedback in st.session_state.session_data['feedback']:
                    color = "green" if "good" in feedback.lower() else "red"
                    st.markdown(f"<p style='color: {color};'>{feedback}</p>", unsafe_allow_html=True)
                
                # Display mistake counters
                st.subheader("Mistakes")
                mistake_cols = st.columns(3)
                mistake_types = ["posture", "eyes", "movement"]
                mistake_labels = ["Posture", "Eyes", "Movement"]
                
                for i, (col, mtype, label) in enumerate(zip(mistake_cols, mistake_types, mistake_labels)):
                    with col:
                        st.markdown(f"<div class='metric-box'><h3>{st.session_state.session_data['mistakes'][mtype]}</h3><p>{label}</p></div>", 
                                  unsafe_allow_html=True)
                
                st.markdown("</div>", unsafe_allow_html=True)
        else:
            # When no session is active
            st.info("Click the 'Start' button in the sidebar to begin your meditation session.")
            
            # Display instructions
            st.subheader("How It Works")
            st.markdown("""
            1. **Find a comfortable position** - Sit in a stable, comfortable position with a straight back.
            2. **Close your eyes** - The app will detect if your eyes are open.
            3. **Stay still** - Minimize body movement during meditation.
            4. **Focus on your breath** - Let the app monitor your physical state while you focus inward.
            
            The app will provide real-time feedback and track your progress over time.
            """)
    
    # Tab 2: Analytics
    with tabs[1]:
        st.header("Your Meditation Journey")
        
        if st.session_state.past_sessions:
            # Generate progress charts
            focus_chart, mistakes_chart = generate_progress_charts()
            
            # Display latest session details
            st.subheader("Latest Session Details")
            last_session = st.session_state.past_sessions[-1]
            
            # Create metrics
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Focus Score", f"{last_session['focus_score']:.1f}%")
            with col2:
                mins, secs = divmod(int(last_session['duration']), 60)
                st.metric("Duration", f"{mins:02d}:{secs:02d}")
            with col3:
                st.metric("Total Mistakes", last_session['mistakes']['total'])
            with col4:
                best_score = max([s['focus_score'] for s in st.session_state.past_sessions])
                st.metric("Best Score", f"{best_score:.1f}%")
            
            # Display charts
            st.plotly_chart(focus_chart, use_container_width=True)
            st.plotly_chart(mistakes_chart, use_container_width=True)
            
            # Session history table
            st.subheader("Session History")
            history_data = []
            for session in reversed(st.session_state.past_sessions):
                mins, secs = divmod(int(session['duration']), 60)
                history_data.append({
                    'Timestamp': session['timestamp'],
                    'Duration': f"{mins:02d}:{secs:02d}",
                    'Focus Score': f"{session['focus_score']:.1f}%",
                    'Posture Errors': session['mistakes']['posture'],
                    'Eye Openings': session['mistakes']['eyes'],
                    'Movement Instances': session['mistakes']['movement'],
                    'Total Mistakes': session['mistakes']['total']
                })
            
            history_df = pd.DataFrame(history_data)
            st.dataframe(history_df, use_container_width=True)
            
        else:
            st.info("Complete your first meditation session to see analytics here.")
            
    # Tab 3: Guide
    with tabs[2]:
        st.header("Meditation Guide")
        
        # Tips for effective meditation
        st.subheader("Tips for Effective Meditation")
        st.markdown("""
        - **Start small** - Begin with 5-10 minute sessions and gradually increase.
        - **Consistent schedule** - Try to meditate at the same time each day.
        - **Comfortable position** - Sit with a straight spine but without tension.
        - **Breath awareness** - Focus on the sensation of breathing as an anchor.
        - **Be patient** - Don't judge yourself when your mind wanders; gently return focus.
        - **Body scan** - Regularly check for tension in your body and release it.
        - **Use the app's feedback** - Let the app guide you to improve posture and stillness.
        """)
        
        # How the app works
        st.subheader("How the App Works")
        st.markdown("""
        This app uses your camera and machine learning to detect:
        
        1. **Posture analysis** - We track key body points to measure spine alignment.
        2. **Eye state detection** - We analyze eye aspect ratio to detect eye closure.
        3. **Movement tracking** - We monitor overall body movement to encourage stillness.
        
        All processing happens locally on your machine, and no video is recorded or sent anywhere.
        """)
        
        # Interpreting your scores
        st.subheader("Interpreting Your Focus Score")
        st.markdown("""
        - **90-100%** - Excellent meditation posture and stillness.
        - **70-90%** - Very good focus, minor adjustments needed.
        - **50-70%** - Good effort, but more practice required.
        - **Below 50%** - Beginning stage, focus on the basics of posture and stillness.
        
        Remember that meditation is a practice, and scores are just a tool to help you improve.
        What matters most is consistency and your internal experience.
        """)

if __name__ == "__main__":
    main()
