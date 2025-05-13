function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function showLoading(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<div class="loading"></div>';
    return originalText;
  }

  function hideLoading(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
  }

  function showPopup(message) {
    popup.textContent = message;
    popup.style.display = "block";
    setTimeout(() => popup.style.display = "none", 2000);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }