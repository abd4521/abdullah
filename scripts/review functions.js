async function loadProductReviews(productId) {
    try {
      const reviewsContainer = document.getElementById('reviewsList');
      reviewsContainer.innerHTML = '<div class="loading" style="margin: 20px auto;"></div>';
      
      const reviewsSnapshot = await db.collection("reviews")
        .where("productId", "==", productId)
        .orderBy("timestamp", "desc")
        .get();
      
      const reviews = [];
      let totalRating = 0;
      const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
      
      reviewsSnapshot.forEach(doc => {
        const review = doc.data();
        reviews.push(review);
        totalRating += review.rating;
        ratingCounts[review.rating]++;
      });
      
      // Calculate average rating
      const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
      
      // Update reviews summary
      document.getElementById('averageRating').textContent = averageRating;
      document.getElementById('totalReviews').textContent = `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`;
      
      // Render star rating
      const starsContainer = document.querySelector('.average-rating .stars');
      starsContainer.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        starsContainer.innerHTML += i <= averageRating ? '★' : '☆';
      }
      
      // Render rating distribution bars
      const ratingBarsContainer = document.querySelector('.rating-bars');
      ratingBarsContainer.innerHTML = '';
      for (let i = 5; i >= 1; i--) {
        const count = ratingCounts[i] || 0;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        
        ratingBarsContainer.innerHTML += `
          <div class="rating-bar">
            <span>${i} star</span>
            <div class="bar-container">
              <div class="bar" style="width: ${percentage}%"></div>
            </div>
            <span>${count}</span>
          </div>
        `;
      }
      
      // Render reviews list
      if (reviews.length > 0) {
        reviewsContainer.innerHTML = '';
        reviews.forEach(review => {
          reviewsContainer.innerHTML += `
            <div class="review-item">
              <div class="review-header">
                <span class="review-author">${review.userName}</span>
                <span class="review-date">${review.timestamp?.toDate().toLocaleDateString() || ''}</span>
              </div>
              <div class="review-rating">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
              </div>
              ${review.title ? `<div class="review-title">${review.title}</div>` : ''}
              <div class="review-text">${review.comment}</div>
            </div>
          `;
        });
      } else {
        reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review this product!</p>';
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      document.getElementById('reviewsList').innerHTML = '<p>Failed to load reviews. Please try again later.</p>';
    }
  }

  function showReviewForm() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    
    document.getElementById('reviewForm').style.display = 'block';
    currentRating = 0;
    updateRatingStars();
  }

  function hideReviewForm() {
    document.getElementById('reviewForm').style.display = 'none';
  }

  function setRating(rating) {
    currentRating = rating;
    updateRatingStars();
  }

  function updateRatingStars() {
    const stars = document.querySelectorAll('.rating-input span');
    stars.forEach((star, index) => {
      star.textContent = index < currentRating ? '★' : '☆';
      star.classList.toggle('active', index < currentRating);
    });
  }

  async function submitReview() {
    const title = document.getElementById('reviewTitle').value.trim();
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (!currentUser) {
      showPopup("Please log in to submit a review.");
      return;
    }
    
    if (currentRating === 0) {
      showPopup("Please select a rating.");
      return;
    }
    
    if (!comment) {
      showPopup("Please write your review.");
      return;
    }
    
    try {
      const review = {
        productId: currentProductId,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        rating: currentRating,
        title: title,
        comment: comment,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection("reviews").add(review);
      
      // Update product with new review count and average rating
      await updateProductReviewStats();
      
      // Reload reviews
      loadProductReviews(currentProductId);
      
      // Reset form
      hideReviewForm();
      document.getElementById('reviewTitle').value = '';
      document.getElementById('reviewComment').value = '';
      
      showPopup("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      showPopup("Failed to submit review. Please try again.");
    }
  }

  async function updateProductReviewStats() {
    // Calculate new average rating and review count
    const reviewsSnapshot = await db.collection("reviews")
      .where("productId", "==", currentProductId)
      .get();
    
    let totalRating = 0;
    let reviewCount = 0;
    
    reviewsSnapshot.forEach(doc => {
      totalRating += doc.data().rating;
      reviewCount++;
    });
    
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    // Update product document
    await db.collection("products").doc(currentProductId).update({
      averageRating: averageRating,
      reviewCount: reviewCount
    });
  }
