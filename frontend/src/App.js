import React, { useState } from "react";
import AIForm from "./components/AIForm/AIForm.jsx";
import PdfConfig from "./components/PdfReader/PdfConfig.jsx";
import "./styles/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Router>
        <Routes>
          <Route path="/" element={<AIForm />} />
          <Route path="/live-chat" element={<AIForm />} />
          <Route path="/pdf-config" element={<PdfConfig />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
