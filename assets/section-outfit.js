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
      // Timeout auf this legen, um Konflikte zu vermeiden
      clearTimeout(this.notificationTimeout);
  
      this.notification.classList.add('show');
  
      this.notificationTimeout = setTimeout(() => {
        this.notification.classList.remove('show');
      }, 3000);
    })
    .catch(error => {
      console.error('Fehler beim Hinzufügen:', error);
    });
  }
}

customElements.define('section-outfit', SectionOutfit);
