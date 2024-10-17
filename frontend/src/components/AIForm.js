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

  return (
    <div className="container">
      <div>
        <h2>Înregistrare audio:</h2>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Oprește înregistrarea" : "Înregistrează"}
        </button>

        {/* Show audio player only when translatedAudioURL exists */}
        {translatedAudioURL && (
          <div>
            <audio
              key={translatedAudioURL}
              controls
              src={translatedAudioURL}
            ></audio>
            <button onClick={handlePlayAudio}>Redă audio</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIForm;
