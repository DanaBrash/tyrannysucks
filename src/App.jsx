import React from "react";
import ContactForm from "./components/ContactForm.jsx";
import './App.css';
import './components/ContactForm.css'

export default function App() {
  return (
    <div className="page">
        <div className="hero-banner full-bleed">
            <div className="title">
                <h1 className="page-title">Tyranny Sucks!</h1>
            </div>
        </div>
      <div className="card">
        <h1 className="card-title">Contact</h1>
        <ContactForm />
      </div>
    </div>
  );
}
