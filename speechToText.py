import os

from dotenv import load_dotenv
from google.cloud import speech, texttospeech
import openai
import io
import subprocess
from pydub import AudioSegment

load_dotenv()

# Setați variabila de mediu GOOGLE_APPLICATION_CREDENTIALS
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
openai_key = os.getenv("openai_api_key")

speech_client = speech.SpeechClient()
tts_client = texttospeech.TextToSpeechClient()


def speech_to_text(audio_file_path):
    if audio_file_path.endswith(".wav"):
        audio = AudioSegment.from_wav(audio_file_path)
        audio = audio.set_channels(1)  # Convert to mono
        audio_file_path = "temp_mono.wav"  # Temporary WAV file for processing
        audio.export(audio_file_path, format="wav")  # Export as WAV for processing
    else:
        audio = AudioSegment.from_file(audio_file_path)
        audio = audio.set_channels(1)  # Convert to mono
        audio_file_path = "temp_mono.wav"  # Temporary WAV file for processing
        audio.export(audio_file_path, format="wav")  # Export as WAV for processing

    with io.open(audio_file_path, "rb") as audio_file:
        audio_content = audio_file.read()

    audio = speech.RecognitionAudio(content=audio_content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=48000,  # Ensure this matches your audio file
        language_code="en-US"  # Source language (change if needed)
    )

    response = speech_client.recognize(config=config, audio=audio)

    # Check if there are any results
    if not response.results:
        print("No transcription results found.")
        return ""

    # Extract the transcribed text
    for result in response.results:
        return result.alternatives[0].transcript


def convert_audio_format(input_file="recording.wav", output_file="output.wav"):
    if os.path.exists(output_file):
        os.remove(output_file)
        print(f"Deleted existing file: {output_file}")

    # Prepare the ffmpeg command
    command = ["ffmpeg", "-i", input_file, "-acodec", "pcm_s16le", "-ar", "48000", output_file]

    try:
        subprocess.run(command, check=True)
        print(f"Converted {input_file} to {output_file} successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while converting audio: {e}")


# Function to translate text using OpenAI (ChatGPT)
def translate_text(text, start_language="Romanian",target_language="English"):
    prompt = (f"Translate the following sentence to {target_language} in a natural and fluent way: {text}. The sentence"
              f" is written in { start_language}")

    response = openai.ChatCompletion.create(api_key=openai_key,
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.05,
        max_tokens=200
    )

    translation = response['choices'][0]['message']['content']
    return translation.strip()  # Adjusted to the new response format


# Function to convert translated text to speech using Google Cloud Text-to-Speech
def text_to_speech(translated_text, target_language_code="ro-RO"):
    synthesis_input = texttospeech.SynthesisInput(text=translated_text)
    voice = texttospeech.VoiceSelectionParams(
        language_code=target_language_code,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    response = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

    with open("translated_audio.mp3", "wb") as out:
        out.write(response.audio_content)
    print("Audio content written to 'translated_audio.mp3'.")


# Main function to run the Medu application
def run_medu_application(input_audio_path):
    print("Step 1: Performing speech-to-text...")
    transcribed_text = speech_to_text(input_audio_path)
    print("Transcribed Text: ", transcribed_text)

    if transcribed_text:  # Proceed only if transcription was successful
        print("Step 2: Translating the text using OpenAI GPT...")
        translated_text = translate_text(transcribed_text, target_language="Romanian")
        print("Translated Text: ", translated_text)

        print("Step 3: Converting translated text to speech...")
        text_to_speech(translated_text, target_language_code="ro-RO")

        print("Translation complete. Audio saved as 'translated_audio.mp3'.")
    else:
        print("Transcription failed, skipping translation and TTS.")

