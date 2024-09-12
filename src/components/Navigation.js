import React, { useState } from 'react';
import './Navigation.css'; // You'll need to create this CSS file

const Navigation = ({ setShowProjects, isMobile }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavClick = (e, targetId) => {
        e.preventDefault();
        if (targetId === 'projects') {
            setShowProjects(true);
        }
        // Add other navigation logic here
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    return (
        <nav className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
            {isMobile && (
                <button id="mobile-menu" onClick={toggleMenu}>
                    {isMenuOpen ? 'Close' : 'Menu'}
                </button>
            )}
            <ul className="nav-list">
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a></li>
                <li><a href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>Projects</a></li>
                <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a></li>
            </ul>
        </nav>
    );
};

export default Navigation;
