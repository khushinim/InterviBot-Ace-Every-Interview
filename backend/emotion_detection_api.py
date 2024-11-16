from flask import Flask, request, jsonify
from deepface import DeepFace
import cv2
import numpy as np
import base64
from io import BytesIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Function to convert base64 string to image
def base64_to_image(base64_str):
    try:
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        return None

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

        # Detect emotion using DeepFace
        result = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False)

        # If no emotions are detected (optional safeguard)
        if not result:
            return jsonify({"error": "No emotion detected"}), 500

        # Return the dominant emotion detected
        return jsonify({"emotion": result[0]['dominant_emotion']})

    except Exception as e:
        # Handle any exceptions that occur during the processing
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred while processing the image"}), 500

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5001)
