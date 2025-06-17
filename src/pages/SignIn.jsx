import React, { useState } from "react";
import "./css/SignIn.css";
import supabase from "../config/SupabaseClient";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Add Google sign-in logic here
    console.log("Google sign-in clicked");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/", // Adjust this URL based on your app's routing
      },
    });

    if (error) {
      console.log(error);
      setFetchError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
      return;
    }

    if (data) {
      console.log(data);
      setFetchError(null);
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 17) return "Good Afternoon!";
    return "Good Evening!";
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        {/* Greeting Section */}
        <div className="greeting-section">
          <h1 className="greeting-title">{getGreeting()}</h1>
          <p className="greeting-subtitle">
            Welcome to your personal todo app. Sign in to organize your tasks
            and boost your productivity.
          </p>
        </div>

        {/* Sign In Form */}
        <div className="signin-form">
          <button
            onClick={handleGoogleSignIn}
            className={`google-signin-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {!isLoading && (
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? "Signing you in..." : "Continue with Google"}
          </button>
          {fetchError && <p className="error-message">{fetchError}</p>}
        </div>

        {/* Footer */}
        <div className="signin-footer">
          <p className="footer-text">What you'll get:</p>
          <div className="features-list">
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              Organize tasks
            </div>
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Track progress
            </div>
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              Stay productive
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
