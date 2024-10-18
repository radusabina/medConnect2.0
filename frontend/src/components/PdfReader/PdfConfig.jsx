import React, { useState, useEffect } from "react";
import "./PdfConfig.css";

const PdfConfig = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ro");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setTranslatedText("");
    if (file) {
      handleUpload(file, sourceLanguage, targetLanguage);
    }
  };

  const handleSourceLanguageChange = (e) => {
    setSourceLanguage(e.target.value);
  };

  const handleTargetLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
  };

  const handleUpload = async (file, sourceLang, targetLang) => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceLanguage", sourceLang);
    formData.append("targetLanguage", targetLang);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);

      if (response.ok) {
        setTranslatedText(responseData.translatedText);
        setExtractedText(responseData.extractedText || "");
      } else {
        console.error("Error:", responseData);
        alert(`Error: ${responseData.message}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleUpload(selectedFile, sourceLanguage, targetLanguage);
    }
  }, [targetLanguage]);

  return (
    <div className="patient-data-container">
      <h1>Receipt Upload</h1>
      <p>
        You can upload PDF, DOCX, or PNG files and view the extracted content
        here.
      </p>

      <div className="file-upload">
        <div>
          <label htmlFor="targetLanguage">Source Language</label>
          <select value={sourceLanguage} onChange={handleSourceLanguageChange}>
            <option value="en">English</option>
            <option value="ro">Romanian</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
          </select>

          <label htmlFor="targetLanguage">Target Language</label>
          <select value={targetLanguage} onChange={handleTargetLanguageChange}>
            <option value="en">English</option>
            <option value="ro">Romanian</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        <input
          type="file"
          accept=".pdf, .docx, .png, .jpeg"
          onChange={handleFileChange}
        />
      </div>

      {extractedText && (
        <div className="extracted-text-container">
          <h2>Extracted Text</h2>
          <div className="extracted-text-box">
            {extractedText.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="translated-text-container">
        <textarea
          id="translatedText"
          value={translatedText}
          readOnly
          rows={5}
          style={{
            width: "80%",
            resize: "none",
            marginTop: 50,
            height: 200,
          }}
        />
      </div>
    </div>
  );
};

export default PdfConfig;
