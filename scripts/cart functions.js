function addToCart(productId, productName, price, image, quantity = 1, variant = null) {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    
    if (cart[productId]) {
      cart[productId].quantity += quantity;
    } else {
      cart[productId] = { 
        name: productName, 
        price: price, 
        quantity: quantity, 
        image: image,
        variant: variant
      };
    }
    
    showPopup(`${productName} added to cart!`);
    saveCart();
    
    if (currentUser) {
      saveUserCart(currentUser.uid);
    }
  }

  function removeFromCart(productId) {
    if (cart[productId]) {
      delete cart[productId];
      saveCart();
      openCart();
      
      if (currentUser) {
        saveUserCart(currentUser.uid);
      }
    }
  }

  function updateQuantity(productId, change) {
    if (cart[productId]) {
      cart[productId].quantity += change;
      
      if (cart[productId].quantity <= 0) {
        delete cart[productId];
      }
      
      saveCart();
      openCart();
      
      if (currentUser) {
        saveUserCart(currentUser.uid);
      }
    }
  }

  function openCart() {
    cartItemsList.innerHTML = "";
    let totalPrice = 0;
    
    if (Object.keys(cart).length === 0) {
      cartItemsList.innerHTML = "<p style='text-align: center;'>Your cart is empty</p>";
    } else {
      const fragment = document.createDocumentFragment();
      
      for (let productId in cart) {
        const item = cart[productId];
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        
        cartItem.innerHTML = `
          <div style="display: flex; gap: 10px;">
            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover;">
            <div class="cart-item-info">
              <p class="cart-item-name">${item.name}</p>
              ${item.variant ? `<p class="cart-item-variant">${formatVariant(item.variant)}</p>` : ''}
              <p class="cart-item-price">PKR ${item.price.toLocaleString()} x ${item.quantity}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateQuantity('${productId}', -1)">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity('${productId}', 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${productId}')">Remove</button>
          </div>
        `;
        
        fragment.appendChild(cartItem);
      }
      
      cartItemsList.appendChild(fragment);
    }
    
    updateTotalPrice(totalPrice);
    cartModal.style.display = "flex";
  }

  function formatVariant(variant) {
    if (!variant) return '';
    
    // Exclude certain properties from being displayed
    const excludedProps = ['price', 'stock', 'image', 'isDefault'];
    const variantDetails = [];
    
    for (const [key, value] of Object.entries(variant)) {
      if (!excludedProps.includes(key) && value) {
        variantDetails.push(`${key}: ${value}`);
      }
    }
    
    return variantDetails.join(', ');
  }

  function updateTotalPrice(totalPrice) {
    if (appliedCoupon) {
      const discount = totalPrice * appliedCoupon.discount;
      totalPrice -= discount;
      
      totalPriceElem.innerHTML = `
        <span style="text-decoration: line-through;">PKR ${(totalPrice + discount).toLocaleString()}</span>
        PKR ${totalPrice.toLocaleString()}
        <span style="color: var(--success-color); font-size: 12px;">(${appliedCoupon.code} applied - ${appliedCoupon.discount * 100}% off)</span>
      `;
    } else {
      totalPriceElem.textContent = totalPrice.toLocaleString();
    }
  }

  function closeCart() {
    cartModal.style.display = "none";
  }

  function saveCart() {
    localStorage.setItem("timelessTrendsCart", JSON.stringify(cart));
  }

  function loadCart() {
    const savedCart = localStorage.getItem("timelessTrendsCart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  }

  async function saveUserCart(userId) {
    try {
      await db.collection("userCarts").doc(userId).set({
        cart: cart,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving user cart:", error);
    }
  }

  async function loadUserCart(userId) {
    try {
      const doc = await db.collection("userCarts").doc(userId).get();
      if (doc.exists) {
        cart = doc.data().cart || {};
      }
    } catch (error) {
      console.error("Error loading user cart:", error);
    }
  }
