if (!customElements.get('section-outfit')) {
  class SectionOutfit extends HTMLElement {
    constructor() {
      super();
      // Get all outfit product elements and relevant buttons/messages
      this.outfitProducts = this.querySelectorAll('.outfit_product');
      this.addToCartButton = this.querySelector('.outfit-submit');
      this.warningMessage = this.querySelector('.outfit-warning');

      // Initialize variant selection logic
      this.initVariantSelection();

      // Set up click handler for add to cart
      this.addToCartButton.addEventListener('click', () => {
        this.handleAddToCart();
      });
    }

    initVariantSelection() {
      this.outfitProducts.forEach(product => {
        const select = product.querySelector('select');
        const hiddenInput = product.querySelector('input[data-autoselect]');

        // If a hidden input is present, use its value as the selected variant
        if (hiddenInput) {
          product.dataset.selectedVariantId = hiddenInput.value;
        }

        // On change of the select dropdown, update the selected variant ID
        if (select) {
          select.addEventListener('change', () => {
            product.dataset.selectedVariantId = select.value || '';
            this.validateAllSelected();
          });
        }
      });

      // Initial validation after setup
      this.validateAllSelected();
    }

    validateAllSelected() {
      // Check that every product has a selected variant ID
      const allSelected = Array.from(this.outfitProducts).every(
        product => product.dataset.selectedVariantId
      );

      // Enable or disable add to cart button based on selection status
      this.addToCartButton.disabled = !allSelected;
      this.warningMessage.hidden = allSelected;
    }

    handleAddToCart() {
      const items = [];
      this.outfitProducts.forEach(product => {
        const selectedVariantId = product.dataset.selectedVariantId;
        if (selectedVariantId) {
          items.push({
            id: parseInt(selectedVariantId, 10),
            quantity: 1
          });
        }
      });

      if (items.length > 0) {
        const formData = { items };
        this.addToCart(formData);
      } else {
        console.warn('No variants selected.');
      }
    }

    addToCart(formData) {
      fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(() => {
        document.getElementById('cart-notification').classList.add('animate', 'active');
        this.updateCartCount();
      })
      .catch(error => {
        console.error('Error while adding to cart:', error);
      });
    }

    updateCartCount() {
      fetch(`${window.Shopify.routes.root}cart.js`)
        .then(response => response.json())
        .then(cart => {
          const count = cart.item_count;
          const bubble = document.querySelector('.cart-count-bubble');
          const cartIcon = document.querySelector('#cart-icon-bubble');

          if (!cartIcon) return;

          if (count > 0) {
            let bubbleEl = bubble;

            // Create the bubble if it doesn't exist
            if (!bubbleEl) {
              bubbleEl = document.createElement('div');
              bubbleEl.className = 'cart-count-bubble';

              const visibleSpan = document.createElement('span');
              visibleSpan.setAttribute('aria-hidden', 'true');
              bubbleEl.appendChild(visibleSpan);

              const hiddenSpan = document.createElement('span');
              hiddenSpan.className = 'visually-hidden';
              bubbleEl.appendChild(hiddenSpan);

              cartIcon.appendChild(bubbleEl);
            }

            // Update the text content in both spans
            const spans = bubbleEl.querySelectorAll('span');
            spans.forEach(span => {
              span.textContent = span.classList.contains('visually-hidden') ? `${count} items` : count;
            });
          } else if (bubble) {
            // If the cart is empty, remove the bubble
            bubble.remove();
          }
        })
        .catch(error => {
          console.error('Error while fetching cart data:', error);
        });
    }
  }

  // Define the custom element if not already defined
  customElements.define('section-outfit', SectionOutfit);
}
