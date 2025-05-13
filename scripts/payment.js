function setupPaymentListeners() {
    document.getElementById('easyPaisa')?.addEventListener('change', function() {
      document.getElementById('easyPaisaDetails').classList.toggle('active', this.checked);
    });
    
    document.getElementById('jazzcash')?.addEventListener('change', function() {
      document.getElementById('jazzcashDetails').classList.toggle('active', this.checked);
    });
    
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
      radio.addEventListener('change', function() {
        document.querySelectorAll('.payment-details').forEach(detail => {
          detail.classList.remove('active');
        });
        if (this.id === 'easyPaisa') {
          document.getElementById('easyPaisaDetails').classList.add('active');
        } else if (this.id === 'jazzcash') {
          document.getElementById('jazzcashDetails').classList.add('active');
        }
      });
    });
  }
