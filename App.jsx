import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import Auth from "./Auth.jsx";

const API_URL = "http://localhost:5000/api/tasks";

const emptyForm = {
title: "",
description: "",
priority: "Medium",
status: "Pending",
dueDate: "",
};

// Get the saved user only if a token and user are available.
function getSavedUser() {
try {
const token = localStorage.getItem("token");
const savedUser = localStorage.getItem("user");


if (!token || !savedUser) {
  return null;
}

return JSON.parse(savedUser);


} catch {
localStorage.removeItem("token");
localStorage.removeItem("user");
return null;
}
}

// Add the JWT token to authenticated API requests.
function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
     Authorization: `Bearer ${token}`,
    },
  };
}

function App() {
const [user, setUser] = useState(getSavedUser);

const [tasks, setTasks] = useState([]);
const [form, setForm] = useState(emptyForm);
const [editingId, setEditingId] = useState(null);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [priorityFilter, setPriorityFilter] = useState("All");

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [saving, setSaving] = useState(false);

// Handle expired or invalid authentication.
function handleRequestError(err, fallbackMessage) {
if (err.response?.status === 401) {
logout();
return;
}


setError(err.response?.data?.message || fallbackMessage);


}

// Log in after successful authentication.
function handleLogin(loggedInUser) {
setUser(loggedInUser);
setTasks([]);
setLoading(true);
setError("");
}

// Log out and clear the current session.
function logout() {
localStorage.removeItem("token");
localStorage.removeItem("user");


setUser(null);
setTasks([]);
setForm(emptyForm);
setEditingId(null);
setSearch("");
setStatusFilter("All");
setPriorityFilter("All");
setError("");
setLoading(false);


}

// Fetch tasks for the currently logged-in user.
async function fetchTasks() {
const token = localStorage.getItem("token");


if (!token) {
  setTasks([]);
  setLoading(false);
  return;
}

try {
  setError("");

  const response = await axios.get(API_URL, getAuthConfig());

  setTasks(response.data);
} catch (err) {
  handleRequestError(
    err,
    "Unable to load tasks. Check your backend server."
  );
} finally {
  setLoading(false);
}


}

// Load tasks when the authenticated user changes.
useEffect(() => {
if (user) {
fetchTasks();
} else {
setTasks([]);
setLoading(false);
}
}, [user]);

// Update form fields.
function handleChange(event) {
const { name, value } = event.target;


setForm((previous) => ({
  ...previous,
  [name]: value,
}));


}

// Create a task or update an existing task.
async function handleSubmit(event) {
event.preventDefault();


if (!form.title.trim()) {
  setError("Please enter a task title.");
  return;
}

const payload = {
  ...form,
  title: form.title.trim(),
  dueDate: form.dueDate || null,
};

try {
  setSaving(true);
  setError("");

  if (editingId) {
    await axios.put(
      `${API_URL}/${editingId}`,
      payload,
      getAuthConfig()
    );
  } else {
    await axios.post(API_URL, payload, getAuthConfig());
  }

  setForm(emptyForm);
  setEditingId(null);

  await fetchTasks();
} catch (err) {
  handleRequestError(
    err,
    "Unable to save task. Please try again."
  );
} finally {
  setSaving(false);
}


}

// Load a task into the form for editing.
function handleEdit(task) {
setEditingId(task._id);


setForm({
  title: task.title || "",
  description: task.description || "",
  priority: task.priority || "Medium",
  status: task.status || "Pending",
  dueDate: task.dueDate
    ? new Date(task.dueDate).toISOString().slice(0, 10)
    : "",
});

setError("");
window.scrollTo({ top: 0, behavior: "smooth" });


}

// Cancel editing.
function cancelEdit() {
setEditingId(null);
setForm(emptyForm);
setError("");
}

// Delete a task.
async function handleDelete(id) {
const confirmed = window.confirm(
"Are you sure you want to delete this task?"
);


if (!confirmed) return;

try {
  setError("");

  await axios.delete(`${API_URL}/${id}`, getAuthConfig());

  await fetchTasks();

  if (editingId === id) {
    cancelEdit();
  }
} catch (err) {
  handleRequestError(
    err,
    "Unable to delete task. Please try again."
  );
}


}

// Change a task's status.
async function handleStatusChange(task, newStatus) {
try {
setError("");


  await axios.put(
    `${API_URL}/${task._id}`,
    {
      title: task.title,
      description: task.description || "",
      priority: task.priority || "Medium",
      dueDate: task.dueDate || null,
      status: newStatus,
    },
    getAuthConfig()
  );

  await fetchTasks();
} catch (err) {
  handleRequestError(err, "Unable to update task status.");
}


}

// Search and filter tasks.
const filteredTasks = useMemo(() => {
const searchText = search.trim().toLowerCase();


return tasks.filter((task) => {
  const matchesSearch =
    (task.title || "").toLowerCase().includes(searchText) ||
    (task.description || "").toLowerCase().includes(searchText);

  const matchesStatus =
    statusFilter === "All" || task.status === statusFilter;

  const matchesPriority =
    priorityFilter === "All" || task.priority === priorityFilter;

  return matchesSearch && matchesStatus && matchesPriority;
});


}, [tasks, search, statusFilter, priorityFilter]);

// Dashboard statistics.
const completedCount = tasks.filter(
(task) => task.status === "Completed"
).length;

const pendingCount = tasks.filter(
(task) => task.status === "Pending"
).length;

const progressCount = tasks.filter(
(task) => task.status === "In Progress"
).length;

// Clear search and filter settings.
function clearFilters() {
setSearch("");
setStatusFilter("All");
setPriorityFilter("All");
}

// Show login or registration when logged out.
if (!user) {
return <Auth onLogin={handleLogin} />;
}

return ( <div className="app-container"> <header className="app-header"> <div> <p className="eyebrow">WORKSPACE</p> <h1>TaskFlow</h1>


      <p className="header-subtitle">
        Plan your work. Track your progress. Get things done.
      </p>

      <p className="header-subtitle">
        Welcome, <strong>{user.name}</strong>!
      </p>
    </div>

    <div className="header-actions">
      <div className="header-badge">✓ Stay Productive</div>

      <button
        type="button"
        className="secondary-button"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  </header>

  {error && (
    <div className="message error-message" role="alert">
      {error}

      <button
        type="button"
        className="message-close"
        onClick={() => setError("")}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  )}

  <section className="stats-grid">
    <div className="stat-card">
      <span className="stat-label">Total Tasks</span>
      <strong>{tasks.length}</strong>
      <span className="stat-note">All your tasks</span>
    </div>

    <div className="stat-card">
      <span className="stat-label">Pending</span>
      <strong>{pendingCount}</strong>
      <span className="stat-note">Waiting to start</span>
    </div>

    <div className="stat-card">
      <span className="stat-label">In Progress</span>
      <strong>{progressCount}</strong>
      <span className="stat-note">Currently working</span>
    </div>

    <div className="stat-card">
      <span className="stat-label">Completed</span>
      <strong>{completedCount}</strong>
      <span className="stat-note">Successfully finished</span>
    </div>
  </section>

  <main className="main-layout">
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">
            {editingId ? "UPDATE DETAILS" : "GET ORGANIZED"}
          </p>

          <h2>{editingId ? "Edit Task" : "Create a Task"}</h2>
        </div>

        <span className="heading-icon">
          {editingId ? "✎" : "+"}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Task Title *</label>

        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Complete React project"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description</label>

        <textarea
          id="description"
          name="description"
          placeholder="Add task details..."
          value={form.description}
          onChange={handleChange}
          rows="4"
        />

        <div className="form-row">
          <div>
            <label htmlFor="priority">Priority</label>

            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label htmlFor="status">Status</label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <label htmlFor="dueDate">Due Date</label>

        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
        />

        <button
          className="primary-button"
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : editingId
              ? "Save Changes"
              : "+ Add Task"}
        </button>

        {editingId && (
          <button
            className="secondary-button"
            type="button"
            onClick={cancelEdit}
          >
            Cancel Editing
          </button>
        )}
      </form>
    </section>

    <section className="panel tasks-panel">
      <div className="panel-heading tasks-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h2>My Tasks</h2>

          <p className="muted-text">
            {filteredTasks.length} of {tasks.length} tasks shown
          </p>
        </div>
      </div>

      <div className="filter-controls">
        <input
          type="search"
          placeholder="Search title or description..."
          aria-label="Search tasks"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="filter-row">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>

        <button
          type="button"
          className="clear-button"
          onClick={clearFilters}
        >
          Clear Search &amp; Filters
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Loading your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">☷</div>

          <h3>
            {tasks.length === 0
              ? "No tasks yet"
              : "No matching tasks"}
          </h3>

          <p>
            {tasks.length === 0
              ? "Create your first task using the form."
              : "Try another search or clear your filters."}
          </p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((task) => (
            <article className="task-card" key={task._id}>
              <div className="task-card-top">
                <div className="task-title-area">
                  <h3>{task.title}</h3>

                  <span
                    className={`priority-badge ${(task.priority || "Medium").toLowerCase()}`}
                  >
                    {task.priority || "Medium"} Priority
                  </span>
                </div>
              </div>

              {task.description && (
                <p className="task-description">
                  {task.description}
                </p>
              )}

              <div className="task-meta">
                <span
                  className={`status-badge ${(task.status || "Pending")
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {task.status || "Pending"}
                </span>

                {task.dueDate && (
                  <span className="due-date">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="task-actions">
                <select
                  aria-label={`Change status for ${task.title}`}
                  value={task.status || "Pending"}
                  onChange={(event) =>
                    handleStatusChange(task, event.target.value)
                  }
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>

                <button
                  type="button"
                  className="edit-button"
                  onClick={() => handleEdit(task)}
                >
                  ✎ Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  </main>

  <footer className="app-footer">
    TaskFlow · Built with React, Node.js, Express &amp; MongoDB
  </footer>
</div>


);
}

export default App;
