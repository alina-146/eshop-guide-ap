class SectionOutfit extends HTMLElement {
  constructor() {
    super();
    this.outfitProducts = this.querySelectorAll('.outfit_product');
    this.addToCartButton = this.querySelector('.outfit-submit');

    this.initVariantSelection();

    this.addToCartButton.addEventListener('click', () => {
      this.handleAddToCart();
    });
  }

  initVariantSelection() {
    this.outfitProducts.forEach(product => {
      const radios = product.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          product.dataset.selectedVariantId = radio.value;
        });
      });
    });
  }

  handleAddToCart() {
    const items = [];
    this.outfitProducts.forEach(product => {
      const selectedRadio = product.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        items.push({
          id: parseInt(selectedRadio.value, 10),
          quantity: 1
        });
      }
    });

    if (items.length > 0) {
      const formData = { items };
      this.addToCart(formData);
    } else {
      console.warn('Keine Varianten ausgewählt.');
    }
  }

  addToCart(formData) {
    this.notification = document.querySelector('.outfit-cart-notification');

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
      console.error('Fehler beim Hinzufügen:', error);
    });
  }

  updateCartCount() {
    fetch(`${window.Shopify.routes.root}cart.js`)
      .then(response => response.json())
      .then(cart => {
        const count = cart.item_count;
        const bubble = document.querySelector('.cart-count-bubble');
        if (bubble) {
          const spans = bubble.querySelectorAll('span');
          spans.forEach(span => {
            span.textContent = span.classList.contains('visually-hidden') ? `${count} items` : count;
          });
        }
      })
      .catch(error => {
        console.error('Fehler beim Abrufen des Warenkorbs:', error);
      });
  }
}

customElements.define('section-outfit', SectionOutfit);
