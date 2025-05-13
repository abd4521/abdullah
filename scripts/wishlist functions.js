function toggleWishlist(productId) {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    
    const index = wishlist.indexOf(productId);
    if (index === -1) {
      wishlist.push(productId);
    } else {
      wishlist.splice(index, 1);
    }
    
    saveWishlist();
    renderProducts();
    
    if (currentUser) {
      saveUserWishlist(currentUser.uid);
    }
  }

  function saveWishlist() {
    localStorage.setItem("timelessTrendsWishlist", JSON.stringify(wishlist));
  }

  function loadWishlist() {
    const savedWishlist = localStorage.getItem("timelessTrendsWishlist");
    if (savedWishlist) {
      wishlist = JSON.parse(savedWishlist);
    }
  }

  async function saveUserWishlist(userId) {
    try {
      await db.collection("userWishlists").doc(userId).set({
        wishlist: wishlist,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  }

  async function loadUserWishlist(userId) {
    try {
      const doc = await db.collection("userWishlists").doc(userId).get();
      if (doc.exists) {
        wishlist = doc.data().wishlist || [];
        renderProducts();
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }

  async function viewWishlist() {
    if (!currentUser) {
      openAuthModal();
      return;
    }

    try {
      const wishlist = await fetchWishlistFromFirebase();

      const wishlistModal = document.createElement("div");
      wishlistModal.className = "modal";
      wishlistModal.style.display = "flex";
      wishlistModal.innerHTML = `
        <div class="modal-content">
          <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
          <h2>Your Wishlist</h2>
          <div id="wishlistItems" style="margin-top: 15px;">
            ${wishlist.length === 0 ? "<p>Your wishlist is empty.</p>" : ""}
          </div>
        </div>
      `;

      document.body.appendChild(wishlistModal);

      const wishlistItems = wishlistModal.querySelector("#wishlistItems");
      if (wishlist.length > 0) {
        for (const productId of wishlist) {
          const product = products.find(p => p.id === productId);
          if (product) {
            const productCard = document.createElement("div");
            productCard.className = "product-card";
            productCard.innerHTML = `
              <img src="${product.image}" alt="${product.name}" loading="lazy">
              <h3>${product.name}</h3>
              <p>PKR ${product.price.toLocaleString()}</p>
              <div class="product-actions">
                <button class="wishlist-btn active" onclick="toggleWishlist('${product.id}')">❤️</button>
                <button class="cart-button" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                  <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
              </div>
            `;
            wishlistItems.appendChild(productCard);
          }
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      showPopup("Failed to load wishlist. Please try again.");
    }
  }

  async function fetchWishlistFromFirebase() {
    if (!currentUser) return [];
    
    try {
      const doc = await db.collection("userWishlists").doc(currentUser.uid).get();
      return doc.exists ? doc.data().wishlist || [] : [];
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return [];
    }
  }