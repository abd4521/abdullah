function checkAuthState() {
    auth.onAuthStateChanged(user => {
      currentUser = user;
      
      if (user) {
        userGreeting.textContent = `Hello, ${user.displayName || user.email.split('@')[0]}`;
        userGreeting.style.display = "inline";
        authButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        authButton.onclick = logout;
        
        loadUserCart(user.uid);
        loadUserWishlist(user.uid);
        loadUserOrders(user.uid);
      } else {
        userGreeting.textContent = "";
        userGreeting.style.display = "none";
        authButton.innerHTML = '<i class="far fa-user"></i> Login';
        authButton.onclick = openAuthModal;
      }
    });
  }

  function openAuthModal() {
    authModal.style.display = "flex";
    switchAuthTab('login');
  }

  function closeAuthModal() {
    authModal.style.display = "none";
    loginError.textContent = "";
    signupError.textContent = "";
    resetError.textContent = "";
  }

  function switchAuthTab(tab) {
    if (tab === "login") {
      document.querySelector(".auth-tab:nth-child(1)").classList.add("active");
      document.querySelector(".auth-tab:nth-child(2)").classList.remove("active");
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
      resetPasswordForm.classList.remove("active");
    } else if (tab === "signup") {
      document.querySelector(".auth-tab:nth-child(1)").classList.remove("active");
      document.querySelector(".auth-tab:nth-child(2)").classList.add("active");
      loginForm.classList.remove("active");
      signupForm.classList.add("active");
      resetPasswordForm.classList.remove("active");
    }
  }

  function showPasswordReset() {
    loginForm.classList.remove("active");
    signupForm.classList.remove("active");
    resetPasswordForm.classList.add("active");
  }

  async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    
    if (!validateEmail(email)) {
      loginError.textContent = "Please enter a valid email address";
      return;
    }
    
    if (password.length < 6) {
      loginError.textContent = "Password must be at least 6 characters";
      return;
    }
    
    const btn = document.querySelector('#loginForm .btn-confirm');
    const originalText = showLoading(btn);
    
    try {
      await auth.signInWithEmailAndPassword(email, password);
      closeAuthModal();
    } catch (error) {
      loginError.textContent = error.message;
    } finally {
      hideLoading(btn, originalText);
    }
  }

  async function signup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();
    
    if (!name) {
      signupError.textContent = "Please enter your name";
      return;
    }
    
    if (!validateEmail(email)) {
      signupError.textContent = "Please enter a valid email address";
      return;
    }
    
    if (password.length < 6) {
      signupError.textContent = "Password must be at least 6 characters";
      return;
    }
    
    if (password !== confirmPassword) {
      signupError.textContent = "Passwords don't match";
      return;
    }
    
    const btn = document.querySelector('#signupForm .btn-confirm');
    const originalText = showLoading(btn);
    
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      closeAuthModal();
    } catch (error) {
      signupError.textContent = error.message;
    } finally {
      hideLoading(btn, originalText);
    }
  }

  async function sendPasswordReset() {
    const email = document.getElementById("resetEmail").value.trim();
    
    if (!validateEmail(email)) {
      resetError.textContent = "Please enter a valid email address";
      resetError.style.color = "var(--danger-color)";
      return;
    }
    
    const btn = document.querySelector('#resetPasswordForm .btn-confirm');
    const originalText = showLoading(btn);
    
    try {
      await auth.sendPasswordResetEmail(email);
      resetError.textContent = "";
      resetError.style.color = "var(--success-color)";
      resetError.textContent = "Password reset email sent. Please check your inbox.";
    } catch (error) {
      resetError.style.color = "var(--danger-color)";
      resetError.textContent = error.message;
    } finally {
      hideLoading(btn, originalText);
    }
  }

  async function logout() {
    const btn = authButton;
    const originalText = showLoading(btn);
    
    try {
      await auth.signOut();
      saveCart();
      saveWishlist();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      hideLoading(btn, originalText);
    }
  }