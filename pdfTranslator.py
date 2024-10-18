import pytesseract
import os
import cv2


pytesseract.pytesseract.tesseract_cmd = os.getenv("tesseract")


def generate_unique_filename(directory, base_name, extension):
    counter = 1
    while True:
        file_name = f"{base_name}{counter}.{extension}"
        file_path = os.path.join(directory, file_name)
        if not os.path.exists(file_path):
            return file_path
        counter += 1


import cv2
import numpy as np

def preprocess_image(image):
    if isinstance(image, str):
        image = cv2.imread(image)

    if image is None:
        raise ValueError("Image not found or unable to read.")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Aplicarea unui threshold
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

    return thresh


