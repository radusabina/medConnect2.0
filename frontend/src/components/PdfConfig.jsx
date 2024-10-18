import React, { useState } from "react";
import "../styles/PdfConfig.css";

const PdfConfig = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState(""); // Text extras
  const [translatedText, setTranslatedText] = useState(""); // Text tradus
  const [pdfUrl, setPdfUrl] = useState(""); // URL pentru descărcarea PDF-ului
  const [downloadedFileName, setDownloadedFileName] = useState(""); // Numele fișierului descărcat
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Limba selectată (default: engleză)

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return; // Returnează dacă nu este selectat niciun fișier
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("targetLanguage", selectedLanguage); // Adaugă limba selectată în form data

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);

      if (response.ok) {
        // Accesează corect translatedText din responseData
        setTranslatedText(responseData.translatedText); // Asigură-te că folosești numele corect al proprietății
        console.log("Acesta este textul tradus:", responseData.translatedText); // Loghează textul tradus
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Upload error:", error); // Loghează eventualele erori
    }
  };

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
      <div className="patient-data-container">
        <h1>File Upload</h1>
        <p>
          You can upload PDF, DOCX, or PNG files and view the extracted content
          here.
        </p>

        <div className="file-upload">
          <input
            type="file"
            accept=".pdf, .docx, .png"
            onChange={handleFileChange}
          />
          <select value={selectedLanguage} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="ro">Romanian</option>
            <option value="fr">French</option>
            <option value="de">German</option> {/* Opțiune pentru germană */}
            <option value="es">Spanish</option> {/* Opțiune pentru spaniolă */}
            {/* Adaugă mai multe limbi după cum este necesar */}
          </select>
          <button onClick={handleUpload}>Upload File</button>
        </div>

        {pdfUrl && (
          <div className="download-link">
            <h2>Download Translated File</h2>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Download Here
            </a>
          </div>
        )}

        {downloadedFileName && (
          <div className="downloaded-file-name">
            <h2>Downloaded File Name:</h2>
            <p>{downloadedFileName}</p>
          </div>
        )}

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

        {extractedText && (
          <div className="text-to-translate-container">
            <h2>Text to Translate</h2>
            <div className="text-to-translate-box">
              {extractedText.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PdfConfig;
