import React, { useState, useEffect } from 'react';
import './LoadingScreen.css'; // You'll need to create this CSS file

const funnyTexts = [
    "Filling up the oceans...",
    "Blowing the clouds...",
    "Sculpting the mountains...",
    "Planting the forests...",
    "Painting the deserts..."
];

const LoadingScreen = ({ progress }) => {
    const [funnyText, setFunnyText] = useState(funnyTexts[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFunnyText(funnyTexts[Math.floor(Math.random() * funnyTexts.length)]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <h1>Loading Earth...</h1>
                <div className="loading-bar-container">
                    <div className="loading-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <p id="funnyText">{funnyText}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
