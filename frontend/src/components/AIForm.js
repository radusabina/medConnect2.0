import React, { useState, useRef } from "react";
import "../styles/AIForm.css";

const AIForm = () => {
  const [inputData, setInputData] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("ro");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translations, setTranslations] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [translatedAudioURL, setTranslatedAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);

  const handleTranslationSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/ai-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: inputData,
          sourceLanguage,
          targetLanguage,
        }),
      });
      const data = await response.json();
      setTranslations((prev) => [
        ...prev,
        { original: inputData, translated: data.generated_text },
      ]);
      setInputData("");
    } catch (error) {
      console.error("Eroare la comunicarea cu serverul:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        const newAudioBlob = new Blob([event.data], { type: "audio/wav" });
        // Set the audioBlob and send it to the backend here
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
    const formData = new FormData();
    formData.append("audio", blob, "recording.wav"); // Adaugă blob-ul audio în FormData
    formData.append("sourceLanguage", sourceLanguage); // Adaugă limba sursă
    formData.append("targetLanguage", targetLanguage); // Adaugă limba țintă

    console.log(formData);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/data", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setTranslatedAudioURL(audioUrl);
      } else {
        console.error("Failed to get translated audio.");
      }
    } catch (error) {
      console.error("Eroare la trimiterea audio-ului:", error);
    }
  };

  const handlePlayAudio = () => {
    const audio = new Audio(translatedAudioURL); // Use only translatedAudioURL
    audio.play();
  };

  const handleSourceLanguageChange = (e) => setSourceLanguage(e.target.value);
  const handleTargetLanguageChange = (e) => setTargetLanguage(e.target.value);

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
      </div>
    </>
  );
};

export default AIForm;
