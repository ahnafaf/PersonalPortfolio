import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import EarthScene from './components/EarthScene';
import LifeEvents from './components/LifeEvents';
import Projects from './components/Projects';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import './App.css';

const lifeEvents = [
    {
        name: 'Dhaka, Bangladesh',
        lat: 15.0906,
        lon: 192.3428,
        age: '0',
        description: "Born in Dhaka, in the vibrant capital of Bangladesh. I begun my life here, while I did have a very short stay here. I visited family every year after moving to Dubai. Embracing my time with my cousins and reflecting on how different both the countries can be."
    },
    {
        name: 'Dubai, United Arab Emirates',
        lat: 19.4752,
        lon: 140.0686,
        age: '3 months old',
        description: 'Moved to Dubai at just 3 months old. My parents, full of hope and ambition, started our new life in a modest environment. Growing up surrounded by tall sky scrapers juxtaposed by small cornershops, I witnessed its immense growth and development. The blend of traditional Arab culture with international influences shaped my early worldview.'
    },
    {
        name: 'New York, United States',
        lat: 34.9451,
        lon: 12.8719,
        age: '17 years old',
        description: 'At 17, I embarked on a trip to the United States with my family. During my trip here, going across to diners, strip malls and taking in the cultural influence helped me realize that it would ultimately be one of my dream desires to be able to study and gain experience somewhere within North America.'
    },
    {
        name: 'Manitoba, Canada',
        lat: 39.5288,
        lon: -8.9005,
        age: '20 years old',
        description: "I had moved to Canada, to pursue a Computer Science degree at the University of Manitoba. The adjustment from the desert climate of Dubai to the harsh Canadian winters was challenging but exhilarating. Over the past two years, I've immersed myself in a new culture, joined various student groups, and built a diverse network of friends from around the world. The Canadian emphasis on multiculturalism has allowed me to embrace my background while integrating into a new society. My journey so far has been both challenging and rewarding, where I hope that I can continue to work with people from all walks of life."
    }
];

function App() {
  const [loading, setLoading] = useState(true);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNextEvent = () => {
    if (isZoomedIn) {
      zoomOutAndRotate(1);
    } else {
      zoomInAndPan();
    }
  };

  const handlePrevEvent = () => {
    if (isZoomedIn) {
      zoomOutAndRotate(-1);
    } else {
      zoomInAndPan();
    }
  };

  const zoomInAndPan = () => {
    gsap.to('.earth-container', { 
      scale: 1.5, 
      duration: 1.5, 
      ease: "power2.inOut",
      onComplete: () => {
        setIsZoomedIn(true);
        showInfoPanel();
      }
    });
  };

  const zoomOutAndRotate = (direction) => {
    setCurrentEventIndex((prev) => (prev + direction + lifeEvents.length) % lifeEvents.length);
    hideInfoPanel();

    gsap.to('.earth-container', {
      scale: 1,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        setIsZoomedIn(false);
        showSwipeText();
      }
    });
  };

  const showInfoPanel = () => {
    gsap.to('.info-panel', { 
      x: 0, 
      duration: 0.5, 
      ease: "power4.out" 
    });
  };

  const hideInfoPanel = () => {
    gsap.to('.info-panel', { 
      x: '100%', 
      duration: 0.5, 
      ease: "power4.in" 
    });
  };

  const showSwipeText = () => {
    gsap.to('.swipe-text', { opacity: 1, duration: 0.5 });
  };

  const hideSwipeText = () => {
    gsap.to('.swipe-text', { opacity: 0, duration: 0.5 });
  };

  return (
    <div className="App">
      {loading && <LoadingScreen />}
      
      <Navigation 
        setShowProjects={setShowProjects} 
        isMobile={isMobile}
      />

      <div className="earth-container">
        <EarthScene 
          setLoading={setLoading}
          currentEvent={lifeEvents[currentEventIndex]}
        />
      </div>

      <div className="info-panel">
        <LifeEvents currentEvent={lifeEvents[currentEventIndex]} />
      </div>

      <div className="controls">
        <button onClick={handlePrevEvent} className="arrow-button left">
          <i className="fas fa-chevron-left"></i>
        </button>
        <button onClick={handleNextEvent} className="arrow-button right">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="swipe-text">
        Click on the left arrow to move forward in my life...
      </div>

      {showProjects && (
        <div className="projects-overlay">
          <Projects />
          <button onClick={() => setShowProjects(false)} className="close-projects">
            Close Projects
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
