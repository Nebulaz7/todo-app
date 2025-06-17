import { useState, useEffect } from "react";
import "./App.css";

import Container from "./components/Container.jsx";
import supabase from "./config/SupabaseClient.jsx";

const App = () => {
  const [item, setItem] = useState("");
  const [todo, setTodo] = useState([]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        console.log("User name:", session.user.user_metadata.name);
        console.log("User email:", session.user.email);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        console.log("User name:", session.user.user_metadata.full_name);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTodo = () => {
    if (item.trim() !== "") {
      setTodo([...todo, item]);
      setItem("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleSignout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Redirect to sign in page after successful sign out
      window.location.href = "/signin";
    } catch (error) {
      console.error("Error signing out:", error.message);
      alert("Error signing out. Please try again.");
    } finally {
      console.log("completed");
    }
  };

  return (
    <div>
      <h1>To-do List App</h1>
      <div>
        {user ? (
          <div>
            <h1>Welcome, {user.user_metadata.full_name}!</h1>
            <p>Email: {user.email}</p>
          </div>
        ) : (
          <h1>hey user</h1>
        )}
      </div>
      <button onClick={handleSignout}>sign out</button>

      <div className="header">
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Add a to-do item"
        />
        <button onClick={handleTodo} onKeyDown={handleKeyPress}>
          Add+
        </button>
      </div>

      <Container todo={todo} />
    </div>
  );
};

export default App;
