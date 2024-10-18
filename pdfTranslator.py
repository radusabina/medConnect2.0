import pytesseract
import os


pytesseract.pytesseract.tesseract_cmd = os.getenv("tesseract")


def generate_unique_filename(directory, base_name, extension):
    counter = 1
    while True:
        file_name = f"{base_name}{counter}.{extension}"
        file_path = os.path.join(directory, file_name)
        if not os.path.exists(file_path):
            return file_path
        counter += 1


def preprocess_image(image):
    gray_image = image.convert('L')
    binary_image = gray_image.point(lambda x: 0 if x < 128 else 255, '1')
    return binary_image




# Initialize 'uploads' directory
if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)