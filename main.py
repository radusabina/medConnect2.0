import cv2
import numpy as np
from flask import Flask, request, jsonify, send_file, url_for
from flask_cors import CORS
from pytesseract import pytesseract

from pdfTranslator import generate_unique_filename, preprocess_image
from speechToText import convert_audio_format, run_medConnect_application, translate_text
import os
import tempfile
from PIL import Image, ImageEnhance
from docx import Document
import fitz


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


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
    source_language = request.form.get('sourceLanguage')
    target_language = request.form.get('targetLanguage')

    print(
        source_language, target_language
    )
    if file.filename == '':
        return "The filename is empty.", 400

    extracted_text = ''

    try:
        if file and file.filename.endswith('.pdf'):
            doc = fitz.open(stream=file.read(), filetype='pdf')
            for page in doc:
                text = page.get_text()
                extracted_text += text
            doc.close()

        elif file and file.filename.endswith('.docx'):
            doc = Document(file)
            for paragraph in doc.paragraphs:
                extracted_text += paragraph.text + '\n'



        elif file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
            image = Image.open(file)
            image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            preprocessed_image = preprocess_image(image_cv)
            extracted_text = pytesseract.image_to_string(preprocessed_image, lang='eng')




        else:
            return "Invalid file format. Please upload a PDF, DOCX, or image.", 400

        translated_text = translate_text(extracted_text, source_language, target_language)

        return jsonify({"translatedText": translated_text})

    except Exception as e:
        print(e)
        return f"An error occurred: {str(e)}", 500


if __name__ == '__main__':
    app.run(debug=True)