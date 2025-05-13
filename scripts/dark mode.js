function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    darkMode = !darkMode;
    localStorage.setItem("darkMode", darkMode);
  }