function openCheckout() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    
    if (Object.keys(cart).length === 0) {
      showPopup("Your cart is empty!");
      return;
    }
    
    document.getElementById('checkoutEmail').value = currentUser.email;
    if (currentUser.displayName) {
      document.getElementById('checkoutName').value = currentUser.displayName;
    }
    
    document.querySelectorAll('.checkout-step').forEach((el, index) => {
      el.classList.remove('active', 'completed');
      if (index === 0) el.classList.add('active');
    });
    
    document.querySelectorAll('.checkout-section').forEach(el => {
      el.classList.remove('active');
    });
    document.getElementById('section1').classList.add('active');
    
    checkoutModal.style.display = "flex";
  }

  function closeCheckout() {
    checkoutModal.style.display = "none";
  }

  function goToStep(step) {
    if (step === 2 && !validateStep1()) return;
    if (step === 3 && !validateStep2()) return;
    
    document.querySelectorAll('.checkout-step').forEach((el, index) => {
      el.classList.remove('active');
      if (index < step - 1) el.classList.add('completed');
      if (index === step - 1) el.classList.add('active');
    });
    
    document.querySelectorAll('.checkout-section').forEach(el => {
      el.classList.remove('active');
    });
    document.getElementById(`section${step}`).classList.add('active');
  }

  function validateStep1() {
    const email = document.getElementById('checkoutEmail').value.trim();
    const name = document.getElementById('checkoutName').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const province = document.getElementById('checkoutProvince').value;
    const phone = document.getElementById('checkoutContact').value.trim();
    
    if (!email || !name || !address || !city || !province || !phone) {
      showPopup('Please fill all required fields');
      return false;
    }
    
    if (!validateEmail(email)) {
      showPopup('Please enter a valid email address');
      return false;
    }
    
    if (!/^\d{10,15}$/.test(phone)) {
      showPopup('Please enter a valid phone number (10-15 digits)');
      return false;
    }
    
    return true;
  }

  function validateStep2() {
    return true; // No validation needed for shipping method selection
  }

  async function confirmOrder() {
    const confirmBtn = document.querySelector('#section3 .btn-confirm');
    const originalText = showLoading(confirmBtn);
    
    try {
      // Gather all order information
      const orderDetails = gatherOrderDetails();
      
      if (!orderDetails) return; // Validation failed
      
      // Create order in Firestore
      const orderRef = await db.collection("orders").add(orderDetails);
      
      // Send confirmation email
      await sendOrderEmail(orderDetails, orderRef.id);
      
      // Clear cart and applied coupon
      clearCartAfterOrder();
      
      // Show success message
      showOrderConfirmation(orderRef.id, orderDetails.userEmail);
    } catch (error) {
      console.error("Order error:", error);
      showPopup(error.message || "Failed to place order. Please try again.");
    } finally {
      hideLoading(confirmBtn, originalText);
    }
  }

  function gatherOrderDetails() {
    const email = document.getElementById('checkoutEmail').value.trim();
    const name = document.getElementById('checkoutName').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const province = document.getElementById('checkoutProvince').value;
    const phone = document.getElementById('checkoutContact').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    
    // Validate required fields
    if (!email || !name || !address || !city || !province || !phone) {
      throw new Error('Please fill all required fields');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!/^\d{10,15}$/.test(phone)) {
      throw new Error('Please enter a valid phone number (10-15 digits)');
    }
    
    if (!paymentMethod) {
      throw new Error('Please select a payment method');
    }
    
    // Calculate order totals
    let subtotal = 0;
    for (let productId in cart) {
      subtotal += cart[productId].price * cart[productId].quantity;
    }
    
    const shippingFee = document.getElementById('expressShipping').checked ? 800 : 300;
    const freeShipping = subtotal >= 10000;
    let discountAmount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
    const total = subtotal - discountAmount + (freeShipping ? 0 : shippingFee);
    
    return {
      userId: currentUser.uid,
      userEmail: email,
      userName: name,
      userContact: phone,
      shippingAddress: { address, city, province },
      shippingMethod: document.querySelector('input[name="shipping"]:checked').id,
      shippingFee: freeShipping ? 0 : shippingFee,
      paymentMethod: paymentMethod.id,
      products: cart,
      subtotal,
      discount: appliedCoupon ? { code: appliedCoupon.code, amount: discountAmount } : null,
      total,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
  }

  function clearCartAfterOrder() {
    cart = {};
    saveCart();
    appliedCoupon = null;
    
    if (currentUser) {
      saveUserCart(currentUser.uid);
    }
  }

  function showOrderConfirmation(orderId, email) {
    const checkoutMain = document.querySelector('.checkout-section.active');
    checkoutMain.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 60px; color: var(--success-color); margin-bottom: 20px;">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2 style="margin-bottom: 15px;">Order Confirmed!</h2>
        <p style="margin-bottom: 10px;">Thank you for your purchase!</p>
        <p style="margin-bottom: 20px;">Order #${orderId}</p>
        <p style="margin-bottom: 30px;">
          A confirmation has been sent to ${email}
        </p>
        <button onclick="closeCheckout(); closeCart(); window.location.reload();" 
                style="background: var(--primary-color); color: white; border: none; 
                       padding: 12px 30px; border-radius: var(--border-radius); cursor: pointer;
                       font-size: 16px;">
          Continue Shopping
        </button>
      </div>
    `;
  }

  async function sendOrderEmail(orderDetails, orderId) {
    const web3formEndpoint = "https://api.web3forms.com/submit";
    const accessKey = "8847c3a9-5ac4-4b89-b85a-6bba70de7550";
    
    const productsList = Object.values(orderDetails.products)
      .map(item => `${item.name}${item.variant ? ` (${formatVariant(item.variant)})` : ''} (Qty: ${item.quantity}) - PKR ${item.price * item.quantity}`)
      .join("\n");
    
    const emailData = {
      access_key: accessKey,
      subject: `New Order #${orderId} - Timeless Trends`,
      from_name: "Timeless Trends Store",
      name: orderDetails.userName,
      email: orderDetails.userEmail,
      order_id: orderId,
      replyto: orderDetails.userEmail,
      content_type: "text",
      message: `
NEW ORDER RECEIVED

Order ID: ${orderId}
Customer: ${orderDetails.userName}
Email: ${orderDetails.userEmail}
Phone: ${orderDetails.userContact}

SHIPPING ADDRESS:
${orderDetails.shippingAddress.address}
${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.province}

ORDER DETAILS:
${productsList}

Subtotal: PKR ${orderDetails.subtotal.toLocaleString()}
${orderDetails.discount ? `Discount (${orderDetails.discount.code}): -PKR ${orderDetails.discount.amount.toLocaleString()}\n` : ''}
Shipping: PKR ${orderDetails.shippingFee.toLocaleString()}
Total: PKR ${orderDetails.total.toLocaleString()}

PAYMENT METHOD:
${orderDetails.paymentMethod.replace(/([A-Z])/g, ' $1').trim()}
      `.trim()
    };
    
    try {
      await fetch(web3formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData)
      });
    } catch (error) {
      console.error("Email error:", error);
    }
  }