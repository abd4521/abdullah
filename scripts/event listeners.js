function setupEventListeners() {
    // Search functionality
    searchInput?.addEventListener('input', debounce(searchProducts, 300));
    
    // Order history
    document.querySelector('.view-orders-btn')?.addEventListener('click', viewOrderHistory);
    
    // Filter changes
    document.querySelectorAll('input[name="category"]').forEach(input => {
      input.addEventListener('change', applyFilters);
    });
    
    document.querySelectorAll('input[name="price"]').forEach(input => {
      input.addEventListener('change', applyFilters);
    });
    
    // Product card clicks
    document.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      if (productCard && !e.target.closest('button')) {
        openProductDetails(productCard.dataset.id);
      }
    });
  }