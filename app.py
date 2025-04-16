import cv2
import streamlit as st
import numpy as np

RTSP_URL = "rtsp://mediamtx.local/stream"

st.set_page_config(page_title="Motion Detector", page_icon="🎥")

st.title("Motion Detector")

video_placeholder = st.empty()

cap = cv2.VideoCapture(RTSP_URL)

if not cap.isOpened():
    st.error("Could not open stream.")
else:
    while True:
        ret, frame = cap.read()
        
        if not ret:
            st.warning("Stream off.")
            break
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        video_placeholder.image(frame_rgb, channels="RGB", use_column_width=True)

cap.release()
