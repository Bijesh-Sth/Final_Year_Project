from typing import Union
import os

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import torch
from torchvision import models, transforms
from PIL import Image

app = FastAPI()

# Define data transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Define class labels
class_labels = ['fifty', 'five', 'fivehundred', 'hundred', 'ten', 'thousand', 'twenty']

# Load the pre-trained ResNet50 model
def load_model(model_path):
    model = models.resnet50(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = torch.nn.Linear(num_ftrs, len(class_labels))  # Adjust num_classes based on your model

    # Check if the file exists
    if os.path.isfile(model_path):
        print(f"Loading model weights from: {model_path}")
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.eval()
        return model
    else:
        print(f"Error: Model file '{model_path}' not found.")
        return None

# Function to make predictions
def predict_currency(model, image_path):
    img = Image.open(image_path).convert('RGB')
    img = transform(img)
    img = img.unsqueeze(0)  # Add batch dimension
    output = model(img)
    _, predicted_class = torch.max(output, 1)
    return predicted_class.item()

# create a hello world endpoint
@app.get("/")
def home():
    return "Hello World"

# FastAPI endpoint to receive image file and return predictions
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        with open("temp_image.jpg", "wb") as temp_image:
            temp_image.write(file.file.read())

        # Load the model
        model_path = '../currency/models/currencyref.pth'
        model = load_model(model_path)

        if model:
            # Make prediction
            prediction = predict_currency(model, "temp_image.jpg")

            # Map prediction to label
            predicted_label = class_labels[prediction]

            # Return prediction as JSON
            return JSONResponse(content={"class_id": prediction, "class_label": predicted_label})
    finally:
        # Remove the temporary image file
        os.remove("temp_image.jpg")

#uvicorn main:app --reload