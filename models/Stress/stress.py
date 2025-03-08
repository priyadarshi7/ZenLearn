import streamlit as st
import cv2
import numpy as np
import mediapipe as mp
import pandas as pd
from datetime import datetime
from deepface import DeepFace
from collections import deque
import json
import os
import matplotlib.pyplot as plt
from scipy.stats import zscore
import plotly.express as px
import plotly.graph_objects as go
import time

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

CONFIG = {
    "data_path": "stress_data",
    "metadata_file": "metadata.csv",
    "report_path": "reports",
    "stress_map": {
        "angry": 80, "fear": 70, "sad": 60, 
        "disgust": 50, "neutral": 30, 
        "happy": 10, "surprise": 20
    }
}

class StressDetectionSystem:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(
            min_detection_confidence=0.6
        )
        self.stress_levels = deque(maxlen=300)
        self.metadata = []
        self._init_filesystem()
        
    def _init_filesystem(self):
        """Initialize required directories and files"""
        os.makedirs(CONFIG['data_path'], exist_ok=True)
        os.makedirs(CONFIG['report_path'], exist_ok=True)
        if not os.path.exists(os.path.join(CONFIG['data_path'], CONFIG['metadata_file'])):
            pd.DataFrame(columns=['timestamp', 'emotion', 'stress_level', 'face_x', 'face_y']).to_csv(
                os.path.join(CONFIG['data_path'], CONFIG['metadata_file']), index=False)

    def _save_metadata(self, data):
        """Save metadata to CSV"""
        df = pd.DataFrame([data])
        df.to_csv(os.path.join(CONFIG['data_path'], CONFIG['metadata_file']), 
                  mode='a', header=False, index=False)

    def analyze_frame(self, frame):
        """Analyze a single frame for stress detection"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        detections = self.face_detection.process(rgb_frame)
        
        if detections.detections:
            for detection in detections.detections:
                bboxC = detection.location_data.relative_bounding_box
                ih, iw, _ = frame.shape
                x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), int(bboxC.width * iw), int(bboxC.height * ih)
                
                # Ensure coordinates are within frame boundaries
                x = max(0, x)
                y = max(0, y)
                w = min(w, frame.shape[1] - x)
                h = min(h, frame.shape[0] - y)
                
                # Only proceed if we have a valid face region
                if w > 0 and h > 0:
                    face_roi = frame[y:y+h, x:x+w]
                    
                    try:
                        analysis = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                        emotion = analysis[0]['dominant_emotion']
                        stress_level = CONFIG['stress_map'].get(emotion, 0)
                        self.stress_levels.append(stress_level)
                        
                        current_metadata = {
                            'timestamp': datetime.now().isoformat(),
                            'emotion': emotion,
                            'stress_level': int(stress_level), 
                            'face_x': int(x + w/2),
                            'face_y': int(y + h/2)
                        }
                        
                        self.metadata.append(current_metadata)
                        
                        if len(self.metadata) % 10 == 0:
                            self._save_metadata(current_metadata)
                        
                        # Draw rectangle around detected face
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        
                        return frame, emotion, stress_level, (x, y, w, h), current_metadata
                    
                    except Exception as e:
                        st.error(f"Analysis error: {str(e)}")
                        return frame, None, None, None, None
        
        return frame, None, None, None, None

    def generate_json_report(self):
        """Generate JSON report with basic statistics"""
        if not self.metadata:
            return None
            
        df = pd.DataFrame(self.metadata)
        report = {
            "average_stress": float(df['stress_level'].mean()),
            "max_stress": int(df['stress_level'].max()),
            "stress_variance": float(df['stress_level'].var()),
            "dominant_emotion": str(df['emotion'].mode()[0]),
            "face_position_changes": int(len(df[['face_x', 'face_y']].diff().dropna())),
            "stress_peaks": int(len(df[zscore(df['stress_level']) > 2])) if len(df) > 1 else 0,
            "total_data_points": len(df),
            "session_duration_seconds": (pd.to_datetime(df['timestamp'].iloc[-1]) - 
                                         pd.to_datetime(df['timestamp'].iloc[0])).total_seconds() if len(df) > 1 else 0
        }
        
        report_file = os.path.join(CONFIG['report_path'], f"stress_report_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
        with open(report_file, 'w') as f:
            json.dump(report, f, cls=NumpyEncoder)
        
        return report

def main():
    st.set_page_config(page_title="Stress Detection System", 
                       page_icon="😌", 
                       layout="wide", 
                       initial_sidebar_state="expanded")
    
    # Custom CSS for vibrant UI
    st.markdown("""
    <style>
    .main {
        background-color: #f5f7f9;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 10px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 5px 5px 0px 0px;
        padding: 10px 20px;
        font-weight: 600;
    }
    .css-1v3fvcr {
        background-color: #f5f7f9;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Initialize session state variables
    if 'system' not in st.session_state:
        st.session_state.system = StressDetectionSystem()
    
    if 'is_recording' not in st.session_state:
        st.session_state.is_recording = False
        
    if 'current_stress' not in st.session_state:
        st.session_state.current_stress = 0
        
    if 'current_emotion' not in st.session_state:
        st.session_state.current_emotion = "neutral"
    
    if 'start_time' not in st.session_state:
        st.session_state.start_time = datetime.now()
        
    if 'frame_count' not in st.session_state:
        st.session_state.frame_count = 0
        
    if 'video_placeholder' not in st.session_state:
        st.session_state.video_placeholder = None
        
    if 'cap' not in st.session_state:
        st.session_state.cap = None
        
    # App title with emoji
    st.title("😌 Stress Detection System")
    
    # Create tabs for different sections
    tab1, tab2, tab3 = st.tabs(["Live Monitor", "Analytics", "About"])
    
    with tab1:
        col1, col2 = st.columns([3, 1])
        
        with col1:
            # Video capture placeholder
            st.subheader("Live Video Feed")
            st.session_state.video_placeholder = st.empty()
            
            # Controls row
            control_col1, control_col2, control_col3 = st.columns(3)
            
            with control_col1:
                if st.session_state.is_recording:
                    if st.button("Stop Recording", key="stop_btn", type="primary"):
                        if st.session_state.cap is not None and st.session_state.cap.isOpened():
                            st.session_state.cap.release()
                            st.session_state.cap = None
                        st.session_state.is_recording = False
                        st.rerun()
                else:
                    if st.button("Start Recording", key="start_btn", type="primary"):
                        # Initialize camera
                        if st.session_state.cap is None or not st.session_state.cap.isOpened():
                            st.session_state.cap = cv2.VideoCapture(0)
                            # Set properties - lower resolution for better performance
                            st.session_state.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                            st.session_state.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        
                        if st.session_state.cap.isOpened():
                            st.session_state.is_recording = True
                            st.session_state.start_time = datetime.now()
                            st.session_state.frame_count = 0
                        else:
                            st.error("Could not access webcam. Please check your camera permissions.")
            
            with control_col2:
                if st.button("Generate Report", key="report_btn"):
                    with st.spinner("Generating report..."):
                        if len(st.session_state.system.metadata) > 0:
                            report = st.session_state.system.generate_json_report()
                            if report:
                                st.success("Report generated successfully!")
                                st.json(report)
                        else:
                            st.warning("No data available for report generation.")
            
            with control_col3:
                if st.button("Reset Data", key="reset_btn"):
                    # Release camera if open
                    if st.session_state.cap is not None and st.session_state.cap.isOpened():
                        st.session_state.cap.release()
                        st.session_state.cap = None
                    
                    # Reset system instance
                    st.session_state.system = StressDetectionSystem()
                    st.session_state.current_stress = 0
                    st.session_state.current_emotion = "neutral"
                    st.session_state.is_recording = False
                    st.session_state.frame_count = 0
                    st.success("Data reset complete!")
                    st.rerun()
        
        with col2:
            # Current stress meter
            st.subheader("Current Status")
            
            # Current emotion with emoji
            emotion_emoji = {
                "angry": "😠", "fear": "😨", "sad": "😢", 
                "disgust": "🤢", "neutral": "😐", 
                "happy": "😊", "surprise": "😲"
            }
            
            current_emoji = emotion_emoji.get(st.session_state.current_emotion, "😐")
            st.markdown(f"<h1 style='text-align: center;'>{current_emoji}</h1>", unsafe_allow_html=True)
            
            st.markdown(f"<h3 style='text-align: center;'>{st.session_state.current_emotion.capitalize()}</h3>", 
                       unsafe_allow_html=True)
            
            # Stress level gauge
            fig = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = st.session_state.current_stress,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Stress Level"},
                gauge = {
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [0, 30], 'color': "green"},
                        {'range': [30, 70], 'color': "yellow"},
                        {'range': [70, 100], 'color': "red"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': st.session_state.current_stress
                    }
                }
            ))
            
            fig.update_layout(height=250, margin=dict(l=20, r=20, t=30, b=20))
            st.plotly_chart(fig, use_container_width=True)
            
            # Session info
            if st.session_state.is_recording:
                elapsed_time = datetime.now() - st.session_state.start_time
                minutes, seconds = divmod(elapsed_time.seconds, 60)
                st.info(f"Recording time: {minutes:02d}:{seconds:02d}")
            
            # Display data points collected
            st.metric("Data Points", len(st.session_state.system.metadata))
            
    with tab2:
        st.subheader("Stress Analytics")
        
        if not st.session_state.system.metadata:
            st.warning("No data available for analysis. Start recording to collect data.")
        else:
            # Convert metadata to DataFrame for analysis
            df = pd.DataFrame(st.session_state.system.metadata)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Create layout with columns
            chart_col1, chart_col2 = st.columns(2)
            
            with chart_col1:
                # Stress timeline chart
                st.subheader("Stress Level Over Time")
                
                # Create time series chart with Plotly
                fig = px.line(df, x='timestamp', y='stress_level', 
                            title='Stress Level Timeline',
                            labels={'stress_level': 'Stress Level (%)', 'timestamp': 'Time'})
                
                fig.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
                st.plotly_chart(fig, use_container_width=True)
                
                # Emotion distribution
                st.subheader("Emotion Distribution")
                emotion_counts = df['emotion'].value_counts().reset_index()
                emotion_counts.columns = ['Emotion', 'Count']
                
                fig = px.pie(emotion_counts, values='Count', names='Emotion', 
                           title='Detected Emotions',
                           color_discrete_sequence=px.colors.qualitative.Bold)
                           
                fig.update_traces(textposition='inside', textinfo='percent+label')
                fig.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
                st.plotly_chart(fig, use_container_width=True)
            
            with chart_col2:
                # Face position heatmap
                st.subheader("Stress Level by Face Position")
                
                fig = px.density_heatmap(df, x='face_x', y='face_y', z='stress_level',
                                      nbinsx=20, nbinsy=20, 
                                      labels={'face_x': 'X Position', 'face_y': 'Y Position'},
                                      title='Stress Level Heatmap by Face Position')
                                      
                fig.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
                st.plotly_chart(fig, use_container_width=True)
                
                # Movement vs Stress
                st.subheader("Movement vs Stress Level")
                
                # Calculate movement
                df['movement'] = np.sqrt(df['face_x'].diff()**2 + df['face_y'].diff()**2)
                df = df.dropna()  # Remove NaN values from difference calculation
                
                fig = px.scatter(df, x='movement', y='stress_level',
                               title='Movement vs Stress Level',
                               labels={'movement': 'Movement (pixels)', 'stress_level': 'Stress Level (%)'},
                               color='stress_level', color_continuous_scale='Viridis')
                               
                fig.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
                st.plotly_chart(fig, use_container_width=True)
                
            # Statistics section
            st.subheader("Summary Statistics")
            
            # Create metrics in columns
            metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)
            
            with metric_col1:
                st.metric("Average Stress", f"{df['stress_level'].mean():.1f}%")
            
            with metric_col2:
                st.metric("Max Stress", f"{df['stress_level'].max()}%")
            
            with metric_col3:
                if len(df) > 1:
                    st.metric("Stress Variance", f"{df['stress_level'].var():.1f}")
                else:
                    st.metric("Stress Variance", "N/A")
            
            with metric_col4:
                if not df['emotion'].empty:
                    st.metric("Dominant Emotion", df['emotion'].mode()[0].capitalize())
                else:
                    st.metric("Dominant Emotion", "N/A")
                    
            # Display raw data table with expander
            with st.expander("View Raw Data"):
                st.dataframe(df.sort_values('timestamp', ascending=False), use_container_width=True)
                
    with tab3:
        st.subheader("About Stress Detection System")
        
        st.markdown("""
        ### How it works
        
        This system uses computer vision and machine learning to detect stress levels from facial expressions:
        
        1. **Face Detection**: Mediapipe's face detection identifies faces in each frame
        2. **Emotion Analysis**: DeepFace analyzes the detected face to determine emotions
        3. **Stress Mapping**: Emotions are mapped to stress levels (e.g., Angry = 80%, Happy = 10%)
        4. **Data Collection**: Timestamps, emotions, stress levels, and face positions are recorded
        5. **Visualization**: Real-time analytics show your stress patterns
        
        ### Stress Level Color Codes
        
        - 🟢 **0-30%**: Low stress (Relaxed, Happy)
        - 🟡 **30-70%**: Moderate stress (Neutral, Disgust, Surprise)
        - 🔴 **70-100%**: High stress (Sad, Fear, Angry)
        
        ### Privacy Notice
        
        All data is processed locally on your device. No video or analysis data is sent to external servers.
        """)
        
        # System requirements
        with st.expander("System Requirements"):
            st.markdown("""
            - Python 3.7+
            - Webcam
            - Libraries: streamlit, opencv-python, mediapipe, deepface, pandas, numpy, plotly
            """)
            
        # How to use
        with st.expander("How to Use"):
            st.markdown("""
            1. Click "Start Recording" to begin stress detection
            2. Position your face clearly in the video feed
            3. Watch real-time stress analysis
            4. Click "Generate Report" for detailed insights
            5. Use "Reset Data" to clear all collected data
            """)
    
    # Video processing function - separate from the main UI rendering
    if st.session_state.is_recording and st.session_state.cap is not None:
        try:
            # Process a frame
            ret, frame = st.session_state.cap.read()
            
            if ret:
                # Process the frame
                processed_frame, emotion, stress_level, bbox, metadata = st.session_state.system.analyze_frame(frame)
                
                if emotion and stress_level is not None:
                    st.session_state.current_emotion = emotion
                    st.session_state.current_stress = stress_level
                
                    # Add overlay text
                    cv2.putText(processed_frame, f"Emotion: {emotion}", (30, 50),
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(processed_frame, f"Stress: {stress_level}%", (30, 100),
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Convert to RGB for Streamlit
                processed_frame_rgb = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)
                
                # Display the frame
                st.session_state.video_placeholder.image(processed_frame_rgb, channels="RGB", use_column_width=True)
                
                # Increment frame count
                st.session_state.frame_count += 1
                
                # Add small delay to control frame rate
                time.sleep(0.05)
                
                # Force refresh to get new frame
                st.rerun()
            else:
                st.error("Could not read frame from webcam.")
                st.session_state.is_recording = False
                if st.session_state.cap is not None and st.session_state.cap.isOpened():
                    st.session_state.cap.release()
                    st.session_state.cap = None
                    
        except Exception as e:
            st.error(f"Error processing video: {str(e)}")
            st.session_state.is_recording = False
            if st.session_state.cap is not None and st.session_state.cap.isOpened():
                st.session_state.cap.release()
                st.session_state.cap = None

if __name__ == "__main__":
    main()
