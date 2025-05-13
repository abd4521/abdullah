async function loadCoupons() {
    try {
      const snapshot = await db.collection("discounts").get();
      validCoupons = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "percentage") {
          validCoupons[data.code] = data.value / 100;
        }
      });
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  }

  function applyCoupon() {
    const couponCode = document.getElementById("couponCode").value.trim();
    const couponMessage = document.getElementById("couponMessage");
    
    if (!couponCode) {
      couponMessage.textContent = "Please enter a coupon code";
      return;
    }
    
    if (!validCoupons[couponCode]) {
      couponMessage.textContent = "Invalid coupon code";
      return;
    }
    
    if (appliedCoupon) {
      couponMessage.textContent = `Coupon ${appliedCoupon.code} is already applied. Remove it first.`;
      return;
    }
    
    // Calculate total price
    let totalPrice = 0;
    for (let productId in cart) {
      totalPrice += cart[productId].price * cart[productId].quantity;
    }
    
    appliedCoupon = {
      code: couponCode,
      discount: validCoupons[couponCode]
    };
    
    updateTotalPrice(totalPrice);
    couponMessage.textContent = `Coupon applied: ${couponCode} (${validCoupons[couponCode] * 100}% off)`;
  }

  function removeCoupon() {
    if (!appliedCoupon) {
      document.getElementById("couponMessage").textContent = "No coupon is currently applied.";
      return;
    }
    
    // Calculate total price
    let totalPrice = 0;
    for (let productId in cart) {
      totalPrice += cart[productId].price * cart[productId].quantity;
    }
    
    appliedCoupon = null;
    updateTotalPrice(totalPrice);
    document.getElementById("couponMessage").textContent = "Coupon removed.";
  }