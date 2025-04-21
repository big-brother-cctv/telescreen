import os
import streamlit as st

STREAM_URL = os.getenv("RTSP_URL", "http://mediamtx:8888/stream.m3u8")

st.set_page_config(page_title="Gaticam", page_icon="🎥")

st.title("Gaticam")

st.markdown(f"""
    <video width="640" height="480" controls>
        <source src="{STREAM_URL}" type="application/x-mpegURL">
        Your browser does not support the video tag.
    </video>
""", unsafe_allow_html=True)
