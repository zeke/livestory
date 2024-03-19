import cv2
import time
from PIL import Image
import numpy as np
import os

# Folder
folder = "frames"

# Create the frames folder if it doesn't exist
frames_dir = os.path.join(os.getcwd(), folder)
os.makedirs(frames_dir, exist_ok=True)

# Initialize the webcam
cap = cv2.VideoCapture(0)

# Check if the webcam is opened correctly
if not cap.isOpened():
    raise IOError("Cannot open webcam")

# Wait for the camera to initialize and adjust light levels
time.sleep(2)

while True:
    ret, frame = cap.read()
    if ret:
        # Get the dimensions of the frame
        height, width, _ = frame.shape

        # Calculate the size of the square crop
        crop_size = min(height, width)

        # Calculate the coordinates for cropping
        start_x = (width - crop_size) // 2
        start_y = (height - crop_size) // 2
        end_x = start_x + crop_size
        end_y = start_y + crop_size

        # Crop the frame to a square
        cropped_frame = frame[start_y:end_y, start_x:end_x]

        # Resize the cropped frame to 512x512
        resized_frame = cv2.resize(cropped_frame, (512, 512))

        # Define the filename with the timestamp
        filename = os.path.join(frames_dir, f"me.jpg")

        # Save the resized frame as a PNG file
        cv2.imwrite(filename, resized_frame)

        print(f"Frame captured, cropped, resized, and saved as {filename}")
    else:
        print("Failed to capture frame")

    # Wait for 2 seconds
    time.sleep(2)

# Release the camera and close all windows
cap.release()
cv2.destroyAllWindows()
