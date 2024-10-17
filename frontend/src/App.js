import Header from "./components/Header";
import React, { useState } from "react";
import AIForm from "./components/AIForm";
import "./styles/App.css";
import axios from "axios";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/data", {
        name: inputValue,
      });
      setResponseMessage(response.data.message);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <AIForm />
      </main>
    </div>
  );
}

export default App;
