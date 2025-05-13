function openAdminLogin() {
    document.getElementById("adminLoginModal").style.display = "flex";
  }

  function closeAdminLogin() {
    document.getElementById("adminLoginModal").style.display = "none";
    document.getElementById("adminLoginError").textContent = "";
  }

  async function adminLogin() {
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    if (!email || !password) {
      document.getElementById("adminLoginError").textContent = "Please fill all fields.";
      return;
    }

    try {
      // Sign in with Firebase Authentication
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Check if the user is an admin
      const userDoc = await db.collection("admins").doc(user.uid).get();
      if (userDoc.exists && userDoc.data().role === "admin") {
        // Redirect to admin dashboard
        window.location.href = "admin-dashboard.html";
      } else {
        // Log out the user if they are not an admin
        await auth.signOut();
        document.getElementById("adminLoginError").textContent = "You are not authorized as an admin.";
      }
    } catch (error) {
      console.error("Admin login error:", error);
      document.getElementById("adminLoginError").textContent = error.message;
    }
  }