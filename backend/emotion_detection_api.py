import logging
from flask import Flask, request, jsonify
from deepface import DeepFace
import cv2
import numpy as np
import base64
from io import BytesIO
from flask_cors import CORS

# Setup logging for debugging
logging.basicConfig(level=logging.DEBUG, filename='app.log', format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Function to convert base64 string to image
def base64_to_image(base64_str):
    try:
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logging.error(f"Error converting base64 to image: {e}")
        return None

# Function to detect faces using Haar Cascade
def detect_face(image):
    # Convert the image to grayscale for face detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Detect faces in the image
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) == 0:
        return None  # No face detected

    # For simplicity, return the first detected face
    x, y, w, h = faces[0]
    face = image[y:y+h, x:x+w]
    return face

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    try:
        # Get the image from the request body
        data = request.get_json()
        base64_img = data['image']  # Image received in base64 format
        image = base64_to_image(base64_img)

        # If image is invalid or couldn't be decoded
        if image is None:
            return jsonify({"error": "Invalid image format"}), 400

        # Detect face in the image using Haar Cascade
        face = detect_face(image)

        if face is None:
            return jsonify({"error": "No face detected in the image"}), 400

        # Detect emotion using DeepFace
        result = DeepFace.analyze(face, actions=['emotion'], enforce_detection=False)

        # If no emotions are detected (optional safeguard)
        if not result or not result[0].get('dominant_emotion'):
            return jsonify({"error": "No emotion detected"}), 500

        # Return the dominant emotion detected
        return jsonify({"emotion": result[0]['dominant_emotion']})

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An error occurred while processing the image"}), 500

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5001)
