async function loadProducts() {
    try {
      showLoadingPlaceholder();
      
      const snapshot = await db.collection("products").get();
      
      if (snapshot.empty) {
        showNoProductsMessage();
        return;
      }

      products = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Product",
        price: doc.data().price || 0,
        category: doc.data().category || "uncategorized",
        image: doc.data().image || "https://via.placeholder.com/300",
        stock: doc.data().stock || 0,
        description: doc.data().description || "",
        variants: doc.data().variants || [],
        sku: doc.data().sku || "",
        tags: doc.data().tags || [],
        oldPrice: doc.data().oldPrice || null,
        discount: doc.data().discount || null
      }));

      renderProducts(products);
    } catch (error) {
      console.error("Error loading products:", error);
      showErrorLoadingProducts();
    } finally {
      hideLoadingPlaceholder();
    }
  }

  function showLoadingPlaceholder() {
    const placeholder = document.querySelector('.loading-placeholder');
    if (placeholder) placeholder.style.display = 'block';
  }

  function hideLoadingPlaceholder() {
    const placeholder = document.querySelector('.loading-placeholder');
    if (placeholder) placeholder.style.display = 'none';
  }

  function showNoProductsMessage() {
    productList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <p>No products available at the moment.</p>
        <button onclick="loadProducts()" class="cart-button" style="margin-top: 15px;">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
  }

  function showErrorLoadingProducts() {
    productList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <p style="color: var(--danger-color);">Failed to load products. Please check your connection.</p>
        <button onclick="loadProducts()" class="cart-button" style="margin-top: 15px;">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }

  function renderProducts(productsToRender = products) {
    productList.innerHTML = "";

    if (!productsToRender || productsToRender.length === 0) {
      showNoProductsMessage();
      return;
    }

    const fragment = document.createDocumentFragment();

    productsToRender.forEach(product => {
      const isInWishlist = wishlist.includes(product.id);
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.dataset.id = product.id;
      productCard.dataset.name = product.name.toLowerCase();
      productCard.dataset.category = product.category.toLowerCase();
      productCard.dataset.price = product.price;

      productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <h3>${product.name}</h3>
        <p>PKR ${product.price.toLocaleString()}</p>
        <p>${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
        <div class="product-actions">
          <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist('${product.id}')">
            ${isInWishlist ? '❤️' : '🤍'}
          </button>
          <button class="cart-button1" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')" 
            ${product.stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      `;

      fragment.appendChild(productCard);
    });

    productList.appendChild(fragment);
  }

  function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      const name = card.dataset.name;
      card.style.display = name.includes(searchTerm) ? 'block' : 'none';
    });
  }