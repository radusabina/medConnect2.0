import os

from dotenv import load_dotenv
from google.cloud import speech, texttospeech
import openai
import io
import subprocess
from pydub import AudioSegment

load_dotenv()

credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
openai.api_key = os.getenv("openai_api_key")

speech_client = speech.SpeechClient()
tts_client = texttospeech.TextToSpeechClient()


def speech_to_text(audio_file_path, source_language):
    if audio_file_path.endswith(".wav"):
        audio = AudioSegment.from_wav(audio_file_path)
        audio = audio.set_channels(1)
        audio_file_path = "temp_mono.wav"
        audio.export(audio_file_path, format="wav")
    else:
        audio = AudioSegment.from_file(audio_file_path)
        audio = audio.set_channels(1)
        audio_file_path = "temp_mono.wav"
        audio.export(audio_file_path, format="wav")

    with io.open(audio_file_path, "rb") as audio_file:
        audio_content = audio_file.read()

    audio = speech.RecognitionAudio(content=audio_content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=48000,  # Ensure this matches your audio file
        language_code=source_language  # Source language (change if needed)
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
def translate_text(text, start_language, target_language):
    prompt = (f"Translate the following sentence to {target_language} in a natural and fluent way: {text}. The sentence"
              f" is written in { start_language}")

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.05,
        max_tokens=500
    )

    translation = response['choices'][0]['message']['content']
    return translation.strip()


def text_to_speech(translated_text, target_language):
    synthesis_input = texttospeech.SynthesisInput(text=translated_text)
    voice = texttospeech.VoiceSelectionParams(
        language_code=target_language,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    response = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

    with open("translated_audio.mp3", "wb") as out:
        out.write(response.audio_content)
    print("Audio content written to 'translated_audio.mp3'.")


def run_medConnect_application(input_audio_path, source_language, target_language):
    print("Step 1: Performing speech-to-text...")
    transcribed_text = "Source language:" + speech_to_text(input_audio_path, source_language) + "\n"
    print("Transcribed Text: ", transcribed_text)

    if transcribed_text:
        print("Step 2: Translating the text using OpenAI GPT...")
        translated_text = translate_text(transcribed_text, start_language=source_language, target_language=target_language)
        print("Translated Text: ", translated_text)

        print("Step 3: Converting translated text to speech...")
        text_to_speech(translated_text, target_language)

        transcribed_text += "Target language: " + translated_text + "\n"

        print("Translation complete. Audio saved as 'translated_audio.mp3'.")
        return transcribed_text
    else:
        print("Transcription failed, skipping translation and TTS.")