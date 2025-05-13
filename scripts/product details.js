async function openProductDetails(productId) {
    try {
      // Show loading state
      document.getElementById('productDetailsModal').style.display = "flex";
      document.querySelector('.product-details-container').innerHTML = '<div class="loading" style="margin: 50px auto;"></div>';
      
      // Fetch product details
      const product = await fetchProductDetails(productId);
      
      // Render product details
      renderProductDetails(product);
      
      // Load reviews
      loadProductReviews(productId);
    } catch (error) {
      console.error("Error loading product:", error);
      document.querySelector('.product-details-container').innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <p style="color: var(--danger-color);">Failed to load product details</p>
          <button onclick="openProductDetails('${productId}')" class="cart-button">
            <i class="fas fa-sync-alt"></i> Try Again
          </button>
        </div>
      `;
    }
  }

  async function fetchProductDetails(productId) {
    const productDoc = await db.collection("products").doc(productId).get();
    
    if (!productDoc.exists) {
      throw new Error("Product not found");
    }
    
    const product = {
      id: productDoc.id,
      ...productDoc.data()
    };
    
    // Fetch category name if category ID exists
    if (product.category && typeof product.category === 'string') {
      const categoryDoc = await db.collection("categories").doc(product.category).get();
      if (categoryDoc.exists) {
        product.category = categoryDoc.data().name;
      } else {
        product.category = "Uncategorized";
      }
    } else {
      product.category = product.category || "Uncategorized";
    }
    
    return product;
  }

  function renderProductDetails(product) {
    currentProduct = product;
    currentProductId = product.id;
    
    const container = document.querySelector('.product-details-container');
    
    container.innerHTML = `
      <div class="product-images">
        <div class="main-image">
          <img id="productDetailsImage" src="${product.image}" alt="${product.name}">
        </div>
        <div class="thumbnail-container" id="productThumbnails"></div>
      </div>
      
      <div class="product-info">
        <h1 id="productDetailsName">${product.name}</h1>
        <div class="price-section">
          <span id="productDetailsPrice">PKR ${product.price.toLocaleString()}</span>
          ${product.oldPrice ? `<span id="productDetailsOldPrice" class="old-price">PKR ${product.oldPrice.toLocaleString()}</span>` : ''}
          ${product.discount ? `<span id="productDetailsDiscount" class="discount-badge">${product.discount}% OFF</span>` : ''}
        </div>
        
        <div class="stock-status">
          <span id="productDetailsStock" class="${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          ${product.sku ? `<span id="productDetailsSKU">SKU: ${product.sku}</span>` : ''}
        </div>
        
        <p id="productDetailsDescription" class="product-description">
          ${product.description || 'No description available.'}
        </p>
        
        <div class="variant-section" id="variantSelection"></div>
        
        <div class="quantity-section">
          <label>Quantity:</label>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="adjustQuantity(-1)">-</button>
            <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}">
            <button class="quantity-btn" onclick="adjustQuantity(1)">+</button>
          </div>
        </div>
        
        <div class="product-actions">
          <button class="wishlist-btn" id="productDetailsWishlistBtn" onclick="toggleWishlistFromDetails()">
            <i class="far fa-heart"></i> Wishlist
          </button>
          <button class="btn-add-to-cart" id="productDetailsCartBtn" onclick="addToCartFromDetails()" ${product.stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
        
        <div class="product-meta">
          <div><span>Category:</span> <span id="productDetailsCategory">${product.category}</span></div>
          ${product.tags ? `<div><span>Tags:</span> <span id="productDetailsTags">${product.tags.join(', ')}</span></div>` : ''}
        </div>
      </div>
    `;
    
    // Set wishlist button state
    const isInWishlist = wishlist.includes(product.id);
    document.getElementById("productDetailsWishlistBtn").classList.toggle('active', isInWishlist);
    
    // Render variants if they exist
    if (product.variants && product.variants.length > 0) {
      renderProductVariants(product.variants);
    }
    
    // Render additional images if they exist
    if (product.additionalImages && product.additionalImages.length > 0) {
      renderProductThumbnails(product.image, product.additionalImages);
    }
  }

  function renderProductVariants(variants) {
    const variantContainer = document.getElementById('variantSelection');
    variantContainer.innerHTML = '';
    
    if (!variants || !Array.isArray(variants)) return;

    // Group variants by type (color, size, etc.)
    const variantGroups = {};
    
    variants.forEach(variant => {
      if (!variant || !variant.type || variant.value === undefined) return;
      
      if (!variantGroups[variant.type]) {
        variantGroups[variant.type] = [];
      }
      variantGroups[variant.type].push(variant);
    });
    
    // Render each variant group
    for (const [type, options] of Object.entries(variantGroups)) {
      if (!options || options.length === 0) continue;
      
      const groupElement = document.createElement('div');
      groupElement.className = 'variant-group';
      groupElement.innerHTML = `<h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>`;
      
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'variant-options';
      
      options.forEach(option => {
        const optionValue = String(option.value || '');
        const optionId = `${type}-${optionValue.replace(/\s+/g, '-').toLowerCase()}`;
        
        optionsContainer.innerHTML += `
          <div class="variant-option">
            <input type="radio" id="${optionId}" name="${type}" value="${optionValue}" 
                   ${option.isDefault ? 'checked' : ''} 
                   onchange="handleVariantChange('${type}', '${optionValue}')">
            <label for="${optionId}">${optionValue}</label>
          </div>
        `;
      });
      
      groupElement.appendChild(optionsContainer);
      variantContainer.appendChild(groupElement);
    }
  }

  function renderProductThumbnails(mainImage, additionalImages) {
    const thumbnailsContainer = document.getElementById('productThumbnails');
    thumbnailsContainer.innerHTML = `
      <img src="${mainImage}" onclick="changeMainImage('${mainImage}')" class="active">
    `;
    
    additionalImages.forEach(img => {
      thumbnailsContainer.innerHTML += `
        <img src="${img}" onclick="changeMainImage('${img}')">
      `;
    });
  }

  function changeMainImage(src) {
    document.getElementById('productDetailsImage').src = src;
    
    // Update active thumbnail
    document.querySelectorAll('#productThumbnails img').forEach(img => {
      img.classList.toggle('active', img.src === src);
    });
  }

  function handleVariantChange(type, value) {
    if (!currentProduct || !currentProduct.variants) return;
    
    // Get all selected variant options
    const selectedOptions = {};
    document.querySelectorAll('.variant-options input[type="radio"]:checked').forEach(input => {
      if (input.name && input.value) {
        selectedOptions[input.name.toLowerCase()] = input.value;
      }
    });

    // Find matching variant
    selectedVariant = currentProduct.variants.find(variant => {
      if (!variant) return false;
      
      for (const [optionType, optionValue] of Object.entries(selectedOptions)) {
        if (variant[optionType] !== optionValue) {
          return false;
        }
      }
      return true;
    }) || null;

    updateVariantUI();
  }

  function updateVariantUI() {
    if (!currentProduct) return;

    // Determine which values to use (variant or product defaults)
    const price = selectedVariant?.price ?? currentProduct.price;
    const stock = selectedVariant?.stock ?? currentProduct.stock;
    const image = selectedVariant?.image || currentProduct.image;

    // Update price display
    document.getElementById('productDetailsPrice').textContent = `PKR ${price.toLocaleString()}`;

    // Update stock display
    const stockElement = document.getElementById('productDetailsStock');
    if (stockElement) {
      const inStock = stock > 0;
      stockElement.textContent = inStock ? 'In Stock' : 'Out of Stock';
      stockElement.className = inStock ? 'in-stock' : 'out-of-stock';
    }

    // Update quantity controls
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
      quantityInput.max = stock;
      quantityInput.value = Math.min(parseInt(quantityInput.value) || 1, stock);
    }

    // Update cart button
    const cartButton = document.getElementById('productDetailsCartBtn');
    if (cartButton) {
      cartButton.disabled = stock <= 0;
    }

    // Update image if different
    if (image !== currentProduct.image) {
      changeMainImage(image);
    }
  }

  function adjustQuantity(change) {
    const quantityInput = document.getElementById('productQuantity');
    let newValue = parseInt(quantityInput.value) + change;
    const max = parseInt(quantityInput.max) || 10;
    
    newValue = Math.max(1, Math.min(newValue, max));
    quantityInput.value = newValue;
  }

  function addToCartFromDetails() {
    if (!currentUser) {
      openAuthModal();
      return;
    }

    if (!currentProduct) {
      showPopup("Product not loaded. Please try again.");
      return;
    }

    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
    
    let productName = currentProduct.name;
    let productPrice = currentProduct.price;
    let productImage = currentProduct.image;
    
    if (selectedVariant) {
      // Add variant info to product name
      const variantDetails = [];
      for (const [key, value] of Object.entries(selectedVariant)) {
        if (!['price', 'stock', 'image', 'isDefault'].includes(key) && value) {
          variantDetails.push(`${value}`);
        }
      }
      
      if (variantDetails.length > 0) {
        productName += ` (${variantDetails.join(', ')})`;
      }
      
      // Use variant-specific price/image if available
      productPrice = selectedVariant.price || productPrice;
      productImage = selectedVariant.image || productImage;
    }
    
    addToCart(
      currentProduct.id,
      productName,
      productPrice,
      productImage,
      quantity,
      selectedVariant
    );
    
    showPopup(`${productName} added to cart!`);
  }

  function toggleWishlistFromDetails() {
    if (currentProductId) {
      toggleWishlist(currentProductId);
      const isInWishlist = wishlist.includes(currentProductId);
      document.getElementById("productDetailsWishlistBtn").innerHTML = isInWishlist ? '❤️' : '🤍';
    }
  }

  function closeProductDetails() {
    document.getElementById('productDetailsModal').style.display = 'none';
    currentProductId = null;
    currentProduct = null;
    selectedVariant = null;
  }
