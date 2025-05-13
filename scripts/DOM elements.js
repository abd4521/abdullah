const productList = document.getElementById('product-list');
    const searchInput = document.getElementById('searchInput');
    const filterSidebar = document.getElementById('filterSidebar');
    const filterOverlay = document.getElementById('filterOverlay');
    const userGreeting = document.getElementById('userGreeting');
    const authButton = document.getElementById('authButton');
    const authModal = document.getElementById('authModal');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    const resetError = document.getElementById('resetError');
    const orderHistoryModal = document.getElementById('orderHistoryModal');
    const orderHistoryList = document.getElementById('orderHistoryList');
    const cartModal = document.getElementById('cartModal');
    const cartItemsList = document.getElementById('cartItems');
    const totalPriceElem = document.getElementById('totalPrice');
    const checkoutModal = document.getElementById('checkoutModal');
    const popup = document.getElementById('popup');
    const trackingDetails = document.getElementById('trackingDetails');
    const orderTrackingModal = document.getElementById('orderTrackingModal');

    // Initialize the app
    document.addEventListener("DOMContentLoaded", init);
    async function init() {
        try {
          await Promise.all([
            loadProducts(),
            loadCategories(),
            loadCoupons(),
            loadCart(),
            loadWishlist()
          ]);
          
          checkAuthState();
          setupPaymentListeners();
          setupProvinceCityMapping();
          setupEventListeners();
          
          if (localStorage.getItem("darkMode") === "true") {
            document.body.classList.add("dark-mode");
            darkMode = true;
          }
        } catch (error) {
          console.error("Initialization error:", error);
          showErrorLoadingProducts();
        }
      }