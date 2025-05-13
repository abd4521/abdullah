async function trackOrder(orderId) {
    trackingDetails.innerHTML = '<div class="loading" style="margin: 20px auto;"></div>';
    orderTrackingModal.style.display = "flex";

    try {
      const doc = await db.collection("orders").doc(orderId).get();
      if (doc.exists) {
        const orderData = { id: doc.id, ...doc.data() };
        updateTrackingUI(orderData);
      } else {
        trackingDetails.innerHTML = '<p style="text-align: center;">Order not found</p>';
      }
    } catch (error) {
      console.error("Error loading order:", error);
      trackingDetails.innerHTML = '<p style="text-align: center;">Error loading order details</p>';
    }
  }

  function updateTrackingUI(order) {
    const trackingSteps = {
      stepOrdered: order.status === 'pending' ? 'active' : 'completed',
      stepProcessed: order.status === 'processing' ? 'active' : ['shipped', 'delivered'].includes(order.status) ? 'completed' : '',
      stepShipped: order.status === 'shipped' ? 'active' : order.status === 'delivered' ? 'completed' : '',
      stepDelivered: order.status === 'delivered' ? 'active' : ''
    };

    trackingDetails.innerHTML = `
      <div class="tracking-progress">
        <div class="tracking-step ${trackingSteps.stepOrdered}" id="stepOrdered">
          <div class="step-icon">📦</div>
          <div class="step-label">Order Placed</div>
          <div class="update-time">${order.createdAt?.toDate().toLocaleString()}</div>
        </div>
        <div class="tracking-step ${trackingSteps.stepProcessed}" id="stepProcessed">
          <div class="step-icon">🏭</div>
          <div class="step-label">Processing</div>
          <div class="update-time">${order.processedAt ? order.processedAt.toDate().toLocaleString() : 'Pending'}</div>
        </div>
        <div class="tracking-step ${trackingSteps.stepShipped}" id="stepShipped">
          <div class="step-icon">🚚</div>
          <div class="step-label">Shipped</div>
          <div class="update-time">${order.shippedAt ? order.shippedAt.toDate().toLocaleString() : 'Pending'}</div>
        </div>
        <div class="tracking-step ${trackingSteps.stepDelivered}" id="stepDelivered">
          <div class="step-icon">🏠</div>
          <div class="step-label">Delivered</div>
          <div class="update-time">${order.deliveredAt ? order.deliveredAt.toDate().toLocaleString() : 'Pending'}</div>
        </div>
      </div>
      <div id="trackingUpdates" class="tracking-updates"></div>
    `;

    const trackingUpdates = document.getElementById('trackingUpdates');
    trackingUpdates.innerHTML = '';

    const updates = [
      {
        time: order.createdAt?.toDate() || new Date(),
        message: `Order #${order.id} has been placed`
      }
    ];

    if (['processing', 'shipped', 'delivered'].includes(order.status)) {
      updates.push({
        time: order.processedAt?.toDate() || new Date(order.createdAt?.toDate().getTime() + 86400000),
        message: 'Your order is being processed'
      });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      updates.push({
        time: order.shippedAt?.toDate() || new Date(order.createdAt?.toDate().getTime() + 172800000),
        message: `Your order has been shipped ${order.trackingNumber ? `(Tracking #: ${order.trackingNumber})` : ''}`
      });
    }

    if (order.status === 'delivered') {
      updates.push({
        time: order.deliveredAt?.toDate() || new Date(order.createdAt?.toDate().getTime() + 345600000),
        message: 'Your order has been delivered'
      });
    }

    updates.sort((a, b) => b.time - a.time).forEach(update => {
      const updateElement = document.createElement('div');
      updateElement.className = 'tracking-update';
      updateElement.innerHTML = `
        <div class="update-time">${update.time.toLocaleString()}</div>
        <div class="update-message">${update.message}</div>
      `;
      trackingUpdates.appendChild(updateElement);
    });
  }

  function closeOrderTracking() {
    orderTrackingModal.style.display = "none";
  }