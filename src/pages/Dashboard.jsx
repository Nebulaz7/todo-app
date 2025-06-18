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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  // Theme effect
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

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

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    if (
      formData.due_date &&
      new Date(formData.due_date) < new Date().setHours(0, 0, 0, 0)
    ) {
      errors.due_date = "Due date cannot be in the past";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add or update todo
  const handleSaveTodo = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const todoData = {
        ...formData,
        user_id: user.id,
        due_date: formData.due_date || null,
        completed: editingTodo ? editingTodo.completed : false,
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
      setFormErrors({});
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
    setFormErrors({});
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
  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };
    return labels[priority] || "Medium";
  };

  const getPriorityClass = (priority) => {
    return priority || "medium";
  };

  const getPriorityValue = (sliderValue) => {
    if (sliderValue <= 2) return "low";
    if (sliderValue >= 4) return "high";
    return "medium";
  };

  const getSliderValue = (priority) => {
    const values = {
      low: 2,
      medium: 3,
      high: 4,
    };
    return values[priority] || 3;
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <div className="error-container">
          <span className="material-icons error-icon">error</span>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/signin")}
            className="btn btn-primary"
          >
            <span className="material-icons">login</span>
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className={`dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      data-theme={darkMode ? "dark" : "light"}
    >
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className="material-icons">
                {sidebarCollapsed ? "menu" : "menu_open"}
              </span>
            </button>
            <div className="user-info">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  <span className="material-icons">person</span>
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
          </div>
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="material-icons">
                {darkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button
              onClick={handleSignOut}
              className="signout-btn"
              title="Sign out"
            >
              <span className="material-icons">logout</span>
              <span className="btn-text">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <span className="material-icons">task_alt</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.total}</p>
              <p className="stat-label">Total Tasks</p>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">
              <span className="material-icons">check_circle</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.completed}</p>
              <p className="stat-label">Completed</p>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">
              <span className="material-icons">schedule</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.pending}</p>
              <p className="stat-label">Pending</p>
            </div>
          </div>

          <div className="stat-card overdue">
            <div className="stat-icon">
              <span className="material-icons">warning</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.overdue}</p>
              <p className="stat-label">Overdue</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-layout">
          {/* Sidebar */}
          <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-content">
              <nav className="nav-list">
                <button
                  className={`nav-item ${
                    activeFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("all")}
                  title="All Tasks"
                >
                  <span className="material-icons nav-icon">dashboard</span>
                  <span className="nav-label">All Tasks</span>
                  {stats.total > 0 && (
                    <span className="nav-badge">{stats.total}</span>
                  )}
                </button>

                <button
                  className={`nav-item ${
                    activeFilter === "upcoming" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("upcoming")}
                  title="Upcoming Tasks"
                >
                  <span className="material-icons nav-icon">upcoming</span>
                  <span className="nav-label">Upcoming</span>
                  {stats.pending > 0 && (
                    <span className="nav-badge">{stats.pending}</span>
                  )}
                </button>

                <button
                  className={`nav-item ${
                    activeFilter === "completed" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("completed")}
                  title="Completed Tasks"
                >
                  <span className="material-icons nav-icon">check_circle</span>
                  <span className="nav-label">Completed</span>
                  {stats.completed > 0 && (
                    <span className="nav-badge">{stats.completed}</span>
                  )}
                </button>

                <button
                  className={`nav-item ${
                    activeFilter === "overdue" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("overdue")}
                  title="Overdue Tasks"
                >
                  <span className="material-icons nav-icon">schedule</span>
                  <span className="nav-label">Overdue</span>
                  {stats.overdue > 0 && (
                    <span className="nav-badge danger">{stats.overdue}</span>
                  )}
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="main-content">
            {/* Search and Add Section */}
            <div className="content-header">
              <div className="search-container">
                <span className="material-icons search-icon">search</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>{" "}
              <button
                className="add-task-btn"
                onClick={() => {
                  setEditingTodo(null);
                  setFormData({
                    title: "",
                    description: "",
                    priority: "medium",
                    due_date: "",
                  });
                  setFormErrors({});
                  setShowModal(true);
                }}
                title="Add new task"
              >
                <span className="material-icons">add</span>
                <span className="btn-text">Add Task</span>
              </button>
            </div>

            {/* Task List */}
            <div className="task-list">
              {filteredTodos.length === 0 ? (
                <div className="empty-state">
                  <span className="material-icons empty-icon">task_alt</span>
                  <h3>No tasks found</h3>
                  <p>
                    {activeFilter === "all"
                      ? "Start by adding your first task!"
                      : `No ${activeFilter} tasks at the moment.`}
                  </p>
                  {activeFilter === "all" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingTodo(null);
                        setFormData({
                          title: "",
                          description: "",
                          priority: "medium",
                          due_date: "",
                        });
                        setFormErrors({});
                        setShowModal(true);
                      }}
                    >
                      <span className="material-icons">add</span>
                      Add Your First Task
                    </button>
                  )}
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`task-item ${
                      todo.completed ? "completed" : ""
                    } ${
                      isOverdue(todo.due_date) && !todo.completed
                        ? "overdue"
                        : ""
                    }`}
                  >
                    <div className="task-content">
                      <button
                        className={`task-checkbox ${
                          todo.completed ? "checked" : ""
                        }`}
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                        title={
                          todo.completed
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                      >
                        <span className="material-icons">
                          {todo.completed
                            ? "check_circle"
                            : "radio_button_unchecked"}
                        </span>
                      </button>

                      <div className="task-details">
                        <h4 className="task-title">{todo.title}</h4>
                        {todo.description && (
                          <p className="task-description">{todo.description}</p>
                        )}
                        <div className="task-meta">
                          <span
                            className={`priority-badge ${getPriorityClass(
                              todo.priority
                            )}`}
                          >
                            <span className="material-icons">flag</span>
                            {getPriorityLabel(todo.priority)}
                          </span>
                          {todo.due_date && (
                            <span className="due-date">
                              <span className="material-icons">event</span>
                              {formatDate(todo.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => editTodo(todo)}
                        title="Edit task"
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => deleteTodo(todo.id)}
                        title="Delete task"
                      >
                        <span className="material-icons">delete</span>
                      </button>
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
          <div
            className="modal"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className="modal-header">
              <h3 id="modal-title">
                <span className="material-icons">
                  {editingTodo ? "edit" : "add_task"}
                </span>
                {editingTodo ? "Edit Task" : "Add New Task"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                title="Close modal"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTodo} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="task-title">
                  Title <span className="required">*</span>
                </label>
                <input
                  id="task-title"
                  type="text"
                  className={`form-input ${formErrors.title ? "error" : ""}`}
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) {
                      setFormErrors({ ...formErrors, title: null });
                    }
                  }}
                  placeholder="Enter task title..."
                  maxLength="100"
                  required
                />
                {formErrors.title && (
                  <span className="error-message">{formErrors.title}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-description">
                  Description
                </label>
                <textarea
                  id="task-description"
                  className={`form-textarea ${
                    formErrors.description ? "error" : ""
                  }`}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) {
                      setFormErrors({ ...formErrors, description: null });
                    }
                  }}
                  placeholder="Add a description..."
                  maxLength="500"
                  rows="3"
                />
                {formErrors.description && (
                  <span className="error-message">
                    {formErrors.description}
                  </span>
                )}
              </div>{" "}
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">
                  Priority: {getPriorityLabel(formData.priority)}
                </label>
                <div className="priority-slider-container">
                  <input
                    id="task-priority"
                    type="range"
                    className="priority-slider"
                    min="1"
                    max="5"
                    value={getSliderValue(formData.priority)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: getPriorityValue(parseInt(e.target.value)),
                      })
                    }
                  />
                  <div className="priority-labels">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-due-date">
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  className={`form-input ${formErrors.due_date ? "error" : ""}`}
                  value={formData.due_date}
                  onChange={(e) => {
                    setFormData({ ...formData, due_date: e.target.value });
                    if (formErrors.due_date) {
                      setFormErrors({ ...formErrors, due_date: null });
                    }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
                {formErrors.due_date && (
                  <span className="error-message">{formErrors.due_date}</span>
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-cancel-add-task"
                  onClick={() => setShowModal(false)}
                >
                  <span className="material-icons">close</span>
                  Cancel
                </button>
                <button type="submit" className="btn btn-add-task">
                  <span className="material-icons">
                    {editingTodo ? "save" : "add"}
                  </span>
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
