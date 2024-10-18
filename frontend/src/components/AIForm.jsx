import React, { useState, useRef } from "react";
import "../styles/AIForm.css";

const AIForm = () => {
  const [sourceLanguage, setSourceLanguage] = useState("ro");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translations, setTranslations] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [translatedAudioURL, setTranslatedAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        const newAudioBlob = new Blob([event.data], { type: "audio/wav" });
        sendAudioToBackend(newAudioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Eroare la începutul înregistrării:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (blob) => {
    setTranslatedAudioURL(null);

    const formData = new FormData();
    formData.append("audio", blob, "recording.wav");
    formData.append("sourceLanguage", sourceLanguage);
    formData.append("targetLanguage", targetLanguage);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/data", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { audio_url, transcribed_text } = await response.json();

        setTranslatedText((prevText) => prevText + "\n" + transcribed_text);

        setTranslatedAudioURL(audio_url);
      } else {
        console.error("Failed to get translated audio.");
      }
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  };

  const handleSourceLanguageChange = (e) => setSourceLanguage(e.target.value);
  const handleTargetLanguageChange = (e) => setTargetLanguage(e.target.value);

  return (
    <>
      <div className="navbar">
        <nav>
          <label className="logo">MedConnect</label>
          <ul className="nav-links">
            <li>
              <a href="/pdf-config">Pdf Config</a>
            </li>
            <li>
              <a href="/live-chat">Live Chat</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="language-select-container">
        <div>
          <label htmlFor="sourceLanguage">Source language</label>
          <select
            id="sourceLanguage"
            value={sourceLanguage}
            onChange={handleSourceLanguageChange}
          >
            <option value="ro">Romanian</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div>
          <label htmlFor="targetLanguage">Target Language</label>
          <select
            id="targetLanguage"
            value={targetLanguage}
            onChange={handleTargetLanguageChange}
          >
            <option value="ro">Romanian</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      <br></br>
      <br></br>

      <div className="recording-container">
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Stop recording" : "Start recording"}
        </button>

        {translatedAudioURL && (
          <div className="audio-container">
            <audio
              key={translatedAudioURL}
              controls
              src={translatedAudioURL}
            ></audio>
          </div>
        )}
        <div className="translated-text-container">
          <textarea
            id="translatedText"
            value={translatedText}
            readOnly
            rows={5}
            style={{
              width: "70%",
              resize: "none",
              marginTop: 50,
              height: 200,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default AIForm;
