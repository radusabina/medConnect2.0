import React, { useState, useRef } from "react";
import "./AIForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";

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
      console.error("Error starting recording:", error);
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

  const switchLanguages = () => {
    setSourceLanguage((prev) => {
      const newTarget = targetLanguage;
      setTargetLanguage(prev);
      return newTarget;
    });
  };

  return (
    <>
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

        <button onClick={switchLanguages} className="switch-button">
          <FontAwesomeIcon icon={faExchangeAlt} />
        </button>

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

      <br />
      <br />

      <div className="recording-container">
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Stop recording" : "Start recording"}
        </button>

        {translatedAudioURL && (
          <div className="audio-container">
            <audio
              ref={(audioEl) => {
                if (audioEl) {
                  audioEl.pause();
                  audioEl.setAttribute("src", "");
                  audioEl.load();
                  audioEl.setAttribute(
                    "src",
                    translatedAudioURL + "?" + new Date().getTime()
                  );
                }
              }}
              controls
            ></audio>
          </div>
        )}
        <div className="translated-text-container">
          <textarea
            id="translatedText"
            value={translatedText}
            readOnly
            rows={5}
          />
        </div>
      </div>
    </>
  );
};

export default AIForm;
