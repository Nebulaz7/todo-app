import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../config/SupabaseClient";
import "./css/Dashboard.css";

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          navigate("/signin");
          return;
        }

        if (session.user.id !== id) {
          navigate(`/dashboard/${session.user.id}`);
          return;
        }

        setUser(session.user);
        await fetchTodos(session.user.id);
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Failed to verify authentication");
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        navigate("/signin");
      } else if (session.user.id !== id) {
        navigate(`/dashboard/${session.user.id}`);
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [id, navigate]);

  // Fetch todos from Supabase
  const fetchTodos = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTodos(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Failed to fetch todos");
    }
  };

  // Calculate statistics
  const calculateStats = (todosData) => {
    const now = new Date();
    const total = todosData.length;
    const completed = todosData.filter((todo) => todo.completed).length;
    const pending = total - completed;
    const overdue = todosData.filter(
      (todo) =>
        !todo.completed && todo.due_date && new Date(todo.due_date) < now
    ).length;

    setStats({ total, completed, pending, overdue });
  };

  // Filter todos based on active filter and search term
  useEffect(() => {
    let filtered = todos;

    // Apply filter
    switch (activeFilter) {
      case "upcoming":
        filtered = todos.filter((todo) => !todo.completed);
        break;
      case "completed":
        filtered = todos.filter((todo) => todo.completed);
        break;
      case "overdue":
        const now = new Date();
        filtered = todos.filter(
          (todo) =>
            !todo.completed && todo.due_date && new Date(todo.due_date) < now
        );
        break;
      default:
        break;
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (todo.description &&
            todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTodos(filtered);
  }, [todos, activeFilter, searchTerm]);

  // Add or update todo
  const handleSaveTodo = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return;
    try {
      const todoData = {
        ...formData,
        user_id: user.id,
        due_date: formData.due_date || null,
        completed: editingTodo ? editingTodo.completed : false, // Explicitly set completed field
      };

      if (editingTodo) {
        const { error } = await supabase
          .from("todos")
          .update(todoData)
          .eq("id", editingTodo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("todos").insert([todoData]);

        if (error) throw error;
      }

      await fetchTodos(user.id);
      setShowModal(false);
      setEditingTodo(null);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
      });
    } catch (error) {
      console.error("Error saving todo:", error);
      setError("Failed to save todo");
    }
  };

  // Toggle todo completion
  const toggleTodo = async (todoId, completed) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !completed })
        .eq("id", todoId);

      if (error) throw error;
      await fetchTodos(user.id);
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  // Delete todo (soft delete)
  const deleteTodo = async (todoId) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      const { error } = await supabase
        .from("todos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", todoId);

      if (error) throw error;
      await fetchTodos(user.id);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Edit todo
  const editTodo = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      due_date: todo.due_date ? todo.due_date.split("T")[0] : "",
    });
    setShowModal(true);
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Check if date is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div
        className="dashboard"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="dashboard"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/signin")}
            className="btn btn-primary"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-placeholder">
                {user.user_metadata?.full_name?.charAt(0) ||
                  user.email.charAt(0)}
              </div>
            )}
            <div className="user-details">
              <h2>
                {getGreeting()},{" "}
                {user.user_metadata?.full_name?.split(" ")[0] || "User"}!
              </h2>
              <p>Ready to be productive today?</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleSignOut} className="signout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon total">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 11H7v8h2v-8zm4-4h-2v12h2V7zm4-2h-2v14h2V5z" />
                </svg>
              </div>
            </div>
            <p className="stat-number">{stats.total}</p>
            <p className="stat-label">Total Tasks</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon completed">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
            <p className="stat-number">{stats.completed}</p>
            <p className="stat-label">Completed</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon pending">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
            <p className="stat-number">{stats.pending}</p>
            <p className="stat-label">Pending</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon overdue">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
              </div>
            </div>
            <p className="stat-number">{stats.overdue}</p>
            <p className="stat-label">Overdue</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <h3>Filters</h3>
            <ul className="nav-list">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("all")}
                >
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                  </svg>
                  All Tasks
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeFilter === "upcoming" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("upcoming")}
                >
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Upcoming
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeFilter === "completed" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("completed")}
                >
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Completed
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeFilter === "overdue" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("overdue")}
                >
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                  Overdue
                </button>
              </li>
            </ul>
          </aside>

          {/* Main Content */}
          <div className="main-content">
            {/* Search and Add Section */}
            <div className="search-add-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="add-todo-btn"
                onClick={() => {
                  setEditingTodo(null);
                  setFormData({
                    title: "",
                    description: "",
                    priority: "medium",
                    due_date: "",
                  });
                  setShowModal(true);
                }}
              >
                + Add Task
              </button>
            </div>

            {/* Todo List */}
            <div className="todo-list">
              {filteredTodos.length === 0 ? (
                <div className="empty-state">
                  <svg
                    className="empty-state-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 11H7v8h2v-8zm4-4h-2v12h2V7zm4-2h-2v14h2V5z" />
                  </svg>
                  <h3>No tasks found</h3>
                  <p>
                    {activeFilter === "all"
                      ? "Start by adding your first task!"
                      : `No ${activeFilter} tasks at the moment.`}
                  </p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`todo-item ${todo.completed ? "completed" : ""}`}
                  >
                    <div className="todo-header">
                      <div
                        className={`todo-checkbox ${
                          todo.completed ? "checked" : ""
                        }`}
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                      >
                        {todo.completed && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                      <div className="todo-content">
                        <h4
                          className={`todo-title ${
                            todo.completed ? "completed" : ""
                          }`}
                        >
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className="todo-description">{todo.description}</p>
                        )}
                        <div className="todo-meta">
                          <span className={`priority-badge ${todo.priority}`}>
                            {todo.priority}
                          </span>
                          {todo.due_date && (
                            <span
                              className={`due-date ${
                                isOverdue(todo.due_date) && !todo.completed
                                  ? "overdue"
                                  : ""
                              }`}
                            >
                              📅 {formatDate(todo.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="todo-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => editTodo(todo)}
                          title="Edit"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => deleteTodo(todo.id)}
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <h3>{editingTodo ? "Edit Task" : "Add New Task"}</h3>
            <form onSubmit={handleSaveTodo}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add a description..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTodo ? "Update" : "Add"} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
