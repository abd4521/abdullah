async function loadUserOrders(userId) {
    orderHistoryList.innerHTML = '<p style="text-align: center;">Loading your orders...</p>';
    
    try {
      const snapshot = await db.collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      
      orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderOrderHistory();
    } catch (error) {
      console.error("Error loading orders:", error);
      orderHistoryList.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading orders. Please try again.</p>';
    }
  }

  function renderOrderHistory() {
    orderHistoryList.innerHTML = '';

    if (orders.length === 0) {
      orderHistoryList.innerHTML = '<p style="text-align: center;">You haven\'t placed any orders yet.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    
    orders.forEach(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Date not available';
      const statusClass = getStatusClass(order.status);
      
      // Add Cancel Button for Pending or Processing Orders
      const cancelButton = (order.status === "pending" || order.status === "processing") 
        ? `<button class="cart-button" onclick="cancelOrder('${order.id}')" style="background: var(--danger-color);">
             <i class="fas fa-times"></i> Cancel Order
           </button>`
        : '';

      const orderItem = document.createElement("div");
      orderItem.className = "order-history-item";
      
      orderItem.innerHTML = `
        <div class="order-history-header">
          <div>
            <strong>Order #${order.id}</strong>
            <p style="font-size: 12px; color: var(--gray-color);">${orderDate}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>PKR ${order.total.toLocaleString()}</strong></p>
            <span class="status-badge ${statusClass}">${order.status}</span>
          </div>
        </div>
        <div class="order-history-products">
          ${renderOrderProducts(order.products)}
        </div>
        <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
          <button class="cart-button" onclick="trackOrder('${order.id}')">
            <i class="fas fa-truck"></i> Track Order
          </button>
          ${cancelButton}
        </div>
      `;
      
      fragment.appendChild(orderItem);
    });
    
    orderHistoryList.appendChild(fragment);
  }

  function renderOrderProducts(products) {
    return Object.values(products).map(product => `
      <div class="order-history-product">
        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
        <div>
          <p style="font-weight: 500;">${product.name}</p>
          ${product.variant ? `<p style="font-size: 12px; color: var(--gray-color);">${formatVariant(product.variant)}</p>` : ''}
          <p style="font-size: 12px; color: var(--gray-color);">PKR ${product.price.toLocaleString()} x ${product.quantity}</p>
        </div>
      </div>
    `).join('');
  }

  function getStatusClass(status) {
    switch(status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  function viewOrderHistory() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    
    orderHistoryModal.style.display = "flex";
    loadUserOrders(currentUser.uid);
  }

  function closeOrderHistory() {
    orderHistoryModal.style.display = "none";
  }

  async function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      await db.collection("orders").doc(orderId).update({
        status: "cancelled",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      showPopup("Order cancelled successfully");
      loadUserOrders(currentUser.uid);
    } catch (error) {
      console.error("Error cancelling order:", error);
      showPopup("Failed to cancel order. Please try again.");
    }
  }
