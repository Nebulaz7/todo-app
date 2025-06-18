import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add 404 class to body for specific styling
    document.body.classList.add("error-404");

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove("error-404");
    };
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // Create floating particles
  const createParticles = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push(
        <div
          key={i}
          className="particle"
          style={{
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * 3 + "s",
            animationDuration: Math.random() * 3 + 2 + "s",
          }}
        />
      );
    }
    return particles;
  };

  return (
    <div className="not-found-page">
      {/* Animated Background */}
      <div className="particles-container">{createParticles()}</div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Main Content */}
      <div className="error-content">
        {/* Animated 404 */}
        <div className="error-number">
          <span className="digit">4</span>
          <div className="zero-container">
            <div className="zero">
              <div className="zero-inner"></div>
            </div>
          </div>
          <span className="digit">4</span>
        </div>

        {/* Error Message */}
        <div className="error-message">
          <h1>Oops! Page Not Found</h1>
          <p>
            The page you're looking for seems to have vanished into the digital
            void. Don't worry, even the best explorers sometimes take a wrong
            turn!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleGoHome}>
            <span className="material-icons">home</span>
            Take Me Home
          </button>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            <span className="material-icons">arrow_back</span>
            Go Back
          </button>
        </div>

        {/* Fun Facts */}
        <div className="fun-fact">
          <div className="fact-icon">
            <span className="material-icons">lightbulb</span>
          </div>
          <p>
            <strong>Fun Fact:</strong> The first 404 error was discovered at
            CERN in 1992. You're now part of internet history!
          </p>
        </div>
      </div>

      {/* Animated Robot/Astronaut */}
      <div className="error-illustration">
        <div className="astronaut">
          <div className="astronaut-head">
            <div className="helmet">
              <div className="helmet-shine"></div>
              <div className="face">
                <div className="eye eye-left"></div>
                <div className="eye eye-right"></div>
                <div className="mouth"></div>
              </div>
            </div>
          </div>
          <div className="astronaut-body">
            <div className="chest-panel">
              <div className="button"></div>
              <div className="button"></div>
              <div className="screen"></div>
            </div>
          </div>
          <div className="astronaut-arms">
            <div className="arm arm-left"></div>
            <div className="arm arm-right"></div>
          </div>
        </div>

        {/* Floating "Lost" elements */}
        <div className="lost-items">
          <div className="lost-item item-1">
            <span className="material-icons">description</span>
          </div>
          <div className="lost-item item-2">
            <span className="material-icons">folder</span>
          </div>
          <div className="lost-item item-3">
            <span className="material-icons">image</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
