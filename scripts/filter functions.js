async function loadCategories() {
    try {
      const snapshot = await db.collection("categories").get();
      if (snapshot.empty) {
        console.log("No categories found in Firestore.");
        return;
      }
      categories = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      renderCategoryFilters();
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  function renderCategoryFilters() {
    const categoryFilters = document.getElementById("categoryFilters");
    if (!categoryFilters) return;
    
    categoryFilters.innerHTML = categories.map(category => `
      <div class="filter-option">
        <label>
          <input type="checkbox" name="category" value="${category.name.toLowerCase()}" checked> ${category.name}
        </label>
      </div>
    `).join("");
  }

  function openFilterSidebar() {
    filterSidebar?.classList.add('active');
    filterOverlay?.classList.add('active');
  }

  function closeFilterSidebar() {
    filterSidebar?.classList.remove('active');
    filterOverlay?.classList.remove('active');
  }

  function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(el => el.value);
    const priceRange = document.querySelector('input[name="price"]:checked')?.value || 'all';
    
    const filteredProducts = products.filter(product => {
      // Category filter
      if (!selectedCategories.includes(product.category.toLowerCase())) return false;
      
      // Price range filter
      switch(priceRange) {
        case '0-2000': return product.price <= 2000;
        case '2000-5000': return product.price > 2000 && product.price <= 5000;
        case '5000-10000': return product.price > 5000 && product.price <= 10000;
        case '10000+': return product.price > 10000;
        default: return true;
      }
    });
    
    renderProducts(filteredProducts);
    closeFilterSidebar();
  }
