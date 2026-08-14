# modern-to-do-list
A modern, responsive To-Do List web app built with HTML5, Tailwind CSS, and vanilla JavaScript — glassmorphism UI, dark/light mode, priorities, search &amp; filters, and localStorage persistence.
# 📝 Modern To-Do List

A clean, modern, and fully responsive To-Do List web application built with **HTML5**, **Tailwind CSS**, and **vanilla JavaScript** — no frameworks, no build tools, just open and run.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Features

- ✅ Add, edit, complete, and delete tasks
- 🎯 Priority levels (Low / Medium / High) with color-coded badges
- 🔍 Real-time search by task title
- 🗂️ Filter tasks — All / Active / Completed
- 📊 Progress bar with live completion percentage
- 🧹 "Clear Completed" to remove all finished tasks at once
- 💾 Persistent storage via browser `localStorage` (tasks survive refresh)
- 🌗 Dark / Light mode toggle with saved preference
- 🔔 Toast notifications for add / edit / complete / delete actions
- 🗑️ Delete confirmation modal to prevent accidental removal
- 💎 Modern glassmorphism UI with gradient background and smooth animations
- 📱 Fully responsive — works on mobile, tablet, and desktop

## 🖥️ Tech Stack

- **HTML5** — semantic, accessible markup
- **Tailwind CSS** (via CDN) — utility-first styling
- **Vanilla JavaScript** — no frameworks or libraries
- **Font Awesome** — icon set
- **localStorage** — client-side persistence

## 📂 Project Structure

```
modern-todo-list/
├── index.html      # Markup, layout, and Tailwind configuration
├── script.js       # All application logic (tasks, filters, storage, UI)
└── README.md        # Project documentation
```

## 🚀 Getting Started

No installation or build step required.

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/modern-todo-list.git
   cd modern-todo-list
   ```
2. Open `index.html` directly in your browser, **or** serve it locally:
   ```bash
   python3 -m http.server
   ```
   then visit `http://localhost:8000`.

## 🧩 How It Works

Tasks are stored as objects in an array and synced to `localStorage` on every change:

```js
{
  id: 1735000000000,
  title: "Complete JavaScript practice",
  priority: "High",
  completed: false,
  createdAt: "2026-08-14T10:30:00.000Z"
}
```

Key functions in `script.js`:

| Function | Purpose |
|---|---|
| `addTask()` | Adds a new task from the input field |
| `toggleTask(id)` | Marks a task complete / active |
| `editTask(id)` / `saveEditedTask(id)` | Enters and saves edit mode |
| `deleteTask(id)` | Removes a task (with confirmation) |
| `filterTasks()` / `searchTasks()` | Applies status filter and search query |
| `clearCompleted()` | Removes all completed tasks |
| `renderTasks()` | Re-renders the task list |
| `updateProgress()` | Updates the progress bar and counts |
| `saveTasks()` / `loadTasks()` | Reads/writes tasks to `localStorage` |
| `showToast()` | Displays toast notifications |

## 📸 Preview

*(Add a screenshot or GIF of the app here once deployed)*

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
