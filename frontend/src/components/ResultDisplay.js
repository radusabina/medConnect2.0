// src/components/ResultDisplay.js
import React from 'react';

const ResultDisplay = ({ translations }) => {
    return (
        <div>
            <h2>Conversația:</h2>
            <ul>
                {translations.map((entry, index) => (
                    <li key={index}>
                        <strong>{entry.original}</strong> - {entry.translated}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ResultDisplay;
