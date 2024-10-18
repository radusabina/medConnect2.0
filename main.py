from flask import Flask, request, jsonify, send_file, url_for
from flask_cors import CORS
from pytesseract import pytesseract

from pdfTranslator import generate_unique_filename, preprocess_image
from speechToText import convert_audio_format, run_medConnect_application, translate_text
import os
from PIL import Image
from docx import Document
from googletrans import Translator
import fitz


app = Flask(__name__)
CORS(app, origins="*")


@app.route('/api/data', methods=['GET', 'POST'])
def handle_data():
    if request.method == 'POST':
        audio_file = request.files.get('audio')
        source_language = request.form.get('sourceLanguage')
        target_language = request.form.get('targetLanguage')

        if audio_file:
            audio_file.save("recording.wav")

            if os.path.exists("recording.wav"):
                print("File saved successfully.")
                print("File size:", os.path.getsize("recording.wav"))
            else:
                print("File not saved.")
                return jsonify({"message": "Audio file not saved."}), 500

            convert_audio_format()
            input_audio = "output.wav"
            transcribed_text = run_medConnect_application(input_audio, source_language, target_language)
            translated_audio_path = "translated_audio.mp3"

            if os.path.exists(translated_audio_path):
                audio_url = url_for('get_translated_audio', _external=True)

                return jsonify({
                    "transcribed_text": transcribed_text,
                    "audio_url": audio_url
                })

            else:
                return jsonify({"message": "Translated audio not found!"}), 404
        return jsonify({"message": "No audio received!"}), 400
    else:
        return jsonify({"message": "This is your data"}), 200


@app.route('/audio', methods=['GET'])
def get_translated_audio():
    translated_audio_path = "translated_audio.mp3"
    if os.path.exists(translated_audio_path):
        return send_file(translated_audio_path, as_attachment=False, mimetype="audio/mpeg")
    else:
        return jsonify({"message": "Audio file not found!"}), 404


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file was sent.", 400

    file = request.files['file']

    print("Pana aici merge")

    if file.filename == '':
        return "The filename is empty.", 400

    extracted_text = ''  # Initialize extracted text
    output_pdf_path = None  # Initialize path for PDF
    target_language = request.form.get('targetLanguage', 'en')  # Get target language from form data

    try:
        # Process the uploaded file without saving the original
        if file and file.filename.endswith('.pdf'):
            print("Pana aici merge pdf exista")
            # Extract text from PDF without saving it
            doc = fitz.open(stream=file.read(), filetype='pdf')  # Open PDF directly from file stream
            for page in doc:
                text = page.get_text()
                extracted_text += text
            doc.close()
            print("S-a citit fisierul")

        elif file and file.filename.endswith('.docx'):
            # Extract text from DOCX without saving it
            doc = Document(file)  # Open DOCX directly from file
            for paragraph in doc.paragraphs:
                extracted_text += paragraph.text + '\n'

        elif file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
            image = Image.open(file.stream)  # Open image directly from file stream
            preprocessed_image = preprocess_image(image)
            extracted_text = pytesseract.image_to_string(preprocessed_image)
            print(extracted_text)

        else:
            return "Invalid file format. Please upload a PDF, DOCX, or image.", 400

        translated_text = translate_text(extracted_text, "en", "ro")
        print("S-a tradus textul")

        print(translated_text)

        return jsonify({"translatedText": translated_text})

    except Exception as e:
        return f"An error occurred: {str(e)}", 500


if __name__ == '__main__':
    app.run(debug=True)