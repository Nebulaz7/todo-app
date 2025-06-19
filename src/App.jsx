import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import supabase from "./config/SupabaseClient.jsx";

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Add intro class to body for intro page styling
    document.body.classList.add("intro");

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove("intro");
    };
  }, []);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          // If user is already signed in, redirect to dashboard
          navigate(`/dashboard/${session.user.id}`);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        navigate(`/dashboard/${session.user.id}`);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGetStarted = () => {
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  // Function to create animated stars
  const createStars = () => {
    const stars = [];
    const predefinedStars = [
      { top: "20%", left: "10%", size: "2px", delay: "0s" },
      { top: "10%", left: "30%", size: "1px", delay: "1s" },
      { top: "30%", left: "70%", size: "3px", delay: "0.5s" },
      { top: "70%", left: "20%", size: "2px", delay: "2s" },
      { top: "80%", left: "80%", size: "1px", delay: "1.5s" },
      { top: "15%", left: "85%", size: "2px", delay: "3s" },
      { top: "60%", left: "5%", size: "1px", delay: "2.5s" },
      { top: "40%", left: "90%", size: "2px", delay: "0.8s" },
      { top: "90%", left: "40%", size: "1px", delay: "1.8s" },
      { top: "5%", left: "60%", size: "3px", delay: "2.2s" },
      { top: "50%", left: "15%", size: "1px", delay: "3.5s" },
      { top: "25%", left: "45%", size: "2px", delay: "1.2s" },
      { top: "75%", left: "65%", size: "1px", delay: "2.8s" },
      { top: "35%", left: "25%", size: "2px", delay: "0.3s" },
      { top: "85%", left: "15%", size: "1px", delay: "1.7s" },
    ];

    // Add predefined stars
    predefinedStars.forEach((star, index) => {
      stars.push(
        <div
          key={`predefined-${index}`}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      );
    });

    // Add random stars
    for (let i = 0; i < 20; i++) {
      const size = Math.random() * 3 + 1;
      stars.push(
        <div
          key={`random-${i}`}
          className="star"
          style={{
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            width: size + "px",
            height: size + "px",
            animationDelay: Math.random() * 3 + "s",
          }}
        />
      );
    }

    return stars;
  };

  return (
    <div className="intro-page">
      {/* Animated Background Elements */}
      <div className="stars">{createStars()}</div>

      {/* Floating Planets */}
      <div className="planet planet-1"></div>
      <div className="planet planet-2"></div>
      <div className="planet planet-3"></div>

      {/* Cosmic Dust Particles */}
      <div className="cosmic-dust"></div>
      <div className="cosmic-dust"></div>
      <div className="cosmic-dust"></div>
      <div className="cosmic-dust"></div>
      <div className="cosmic-dust"></div>

      {/* Main Content */}
      <div className="intro-content">
        <div className="logo">
          <span className="material-icons">task_alt</span>
        </div>
        <h1>TaskFlow</h1>
        <p>Simple task management for productive people</p>
        <button className="cta-button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default App;
