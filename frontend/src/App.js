import Header from "./components/Header"; // Ensure this is imported if used
import React, { useState } from "react";
import AIForm from "./components/AIForm";
import PdfConfig from "./components/PdfConfig"; // Ensure this import is correct
import "./styles/App.css";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<AIForm />} />
          <Route path="/live-chat" element={<AIForm />} />
          <Route path="/pdf-config" element={<PdfConfig />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
