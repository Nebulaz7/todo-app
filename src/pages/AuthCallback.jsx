import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/SupabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Processing OAuth callback...");

        // Get the session after OAuth redirect
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("OAuth callback error:", error);
          navigate("/signin?error=oauth_failed");
          return;
        }

        if (data.session?.user) {
          console.log("OAuth successful, redirecting to dashboard");
          navigate(`/dashboard/${data.session.user.id}`);
        } else {
          console.log("No session found, redirecting to signin");
          navigate("/signin");
        }
      } catch (error) {
        console.error("Unexpected error in OAuth callback:", error);
        navigate("/signin?error=unexpected");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #f3f3f3",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <p>Completing sign in...</p>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
