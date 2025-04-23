from flask import Flask, request, jsonify
from flask_cors import CORS  
from ultralytics import YOLO  
import cv2
import numpy as np

app = Flask(__name__)

CORS(app)

model = YOLO('best.pt')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        
    results = model(img, imgsz=640, conf=0.3)
    
    r = results[0]

    boxes    = r.boxes.xyxy.cpu().numpy().tolist()
    confidences = r.boxes.conf.cpu().numpy().tolist()
    classes     = r.boxes.cls.cpu().numpy().tolist()

    detections = []
    for box, c, cls in zip(boxes, confidences, classes):
        if c < 0.3:             
            continue
        x1, y1, x2, y2 = map(int, box)
        detections.append({
            "class_id":   int(cls),
            "class_name": model.names[int(cls)], 
            "confidence": float(c),
            "bbox":       [x1, y1, x2, y2]
        })
    return jsonify(detections)  
    
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)