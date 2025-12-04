/* global $ */
$(function () {

  // === Helper: formato de moneda (Bolivianos) ===
  function formatBS(value) {
    return 'Bs ' + Number(value).toFixed(2);
  }

  // Año en footer
  $('#year').text(new Date().getFullYear());

  // =====================================================
  // === CARRITO GLOBAL (para TODAS LAS PÁGINAS)
  // =====================================================

  const cart = [];

  const $cartModal = $('#cart-modal');
  const $cartItems = $cartModal.find('#cart-items');
  const $cartTotal = $cartModal.find('#cart-total');

  // -----------------------------------------------------
  // Abrir y cerrar modal
  // -----------------------------------------------------
  function openCartModal() {
    renderCart();
    $cartModal.attr('aria-hidden', 'false');
  }

  function closeCartModal() {
    $cartModal.attr('aria-hidden', 'true');
    restoreCartView();
  }

  // -----------------------------------------------------
  // Añadir producto
  // -----------------------------------------------------
  function addToCart(name, price, img = "") {
    const priceNum = Number(price);
    let item = cart.find(i => i.name === name);

    if (item) {
      item.qty++;
    } else {
      cart.push({
        id: Date.now() + Math.random().toString(36).slice(2, 6),
        name,
        price: priceNum,
        qty: 1,
        img
      });
    }

    renderCart();
    openCartModal();
  }

  // -----------------------------------------------------
  // Cambiar cantidad
  // -----------------------------------------------------
  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) removeItem(id);

    renderCart();
  }

  // -----------------------------------------------------
  // Remover producto
  // -----------------------------------------------------
  function removeItem(id) {
    const index = cart.findIndex(i => i.id === id);
    if (index >= 0) cart.splice(index, 1);
    renderCart();
  }

  // -----------------------------------------------------
  // Calcular total
  // -----------------------------------------------------
  function computeTotal() {
    return cart.reduce((sum, it) => sum + it.qty * it.price, 0);
  }

  // -----------------------------------------------------
  // Renderizar carrito
  // -----------------------------------------------------
  function renderCart() {
    $cartItems.empty();

    if (cart.length === 0) {
      $cartItems.append(`<div class="small">Tu carrito está vacío.</div>`);
      $cartTotal.text(formatBS(0));
      return;
    }

    cart.forEach(item => {
      const $row = $(`
        <div class="cart-row" data-id="${item.id}">
          <div class="left">
            <strong>${item.name}</strong>
            <div class="small">${formatBS(item.price)}</div>
          </div>

          <div class="controls">
            <div class="qty">
              <button class="qty-btn qty-decrease">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn qty-increase">+</button>
            </div>

            <button class="remove-item">🗑️</button>
          </div>
        </div>
      `);

      $row.find('.qty-increase').on('click', () => changeQty(item.id, 1));
      $row.find('.qty-decrease').on('click', () => changeQty(item.id, -1));
      $row.find('.remove-item').on('click', () => {
        if (confirm(`¿Eliminar ${item.name}?`)) removeItem(item.id);
      });

      $cartItems.append($row);
    });

    $cartTotal.text(formatBS(computeTotal()));
  }


  // -----------------------------------------------------
  // Restaurar vista (si usuario estaba en fase pago)
  // -----------------------------------------------------
  function restoreCartView() {
    $cartModal.find('.payment-section').remove();
    $cartModal.find('#cart-content').show();
    renderCart();
  }


  // -----------------------------------------------------
  // Iniciar checkout
  // -----------------------------------------------------
  function startCheckout() {
    if (cart.length === 0) return alert("Tu carrito está vacío.");

    const $mainContent = $cartModal.find('#cart-content');
    $mainContent.hide();

    const $payment = $(`
      <div class="payment-section">
        <h3>Selecciona método de pago</h3>

        <div class="methods">
          <button class="btn pay-cash">💵 Efectivo</button>
          <button class="btn pay-qr">🔳 QR</button>
        </div>

        <div class="payment-area"></div>

        <div class="actions">
          <button class="btn cancel-checkout">Volver</button>
        </div>
      </div>
    `);

    $cartModal.find('.modal-panel').append($payment);

    $payment.find('.cancel-checkout').on('click', () => {
      $payment.remove();
      restoreCartView();
    });

    $payment.find('.pay-cash').on('click', () => {
      const $area = $payment.find('.payment-area');
      $area.html(`
        <p>Haz seleccionado <b>Efectivo</b>.</p>
        <button class="btn confirm-payment">Confirmar Pago</button>
      `);

      $area.find('.confirm-payment').on('click', () => {
        alert("¡Compra realizada con éxito!");
        cart.length = 0;
        closeCartModal();
      });
    });

    $payment.find('.pay-qr').on('click', () => {
      const $area = $payment.find('.payment-area');
      $area.html(`
        <p>Escanea este código QR:</p>
        <img src="Imagenes/qr-placeholder.png" class="qr-img">
        <button class="btn confirm-payment">Confirmar Pago</button>
      `);

      $area.find('.confirm-payment').on('click', () => {
        alert("¡Compra realizada con éxito!");
        cart.length = 0;
        closeCartModal();
      });
    });

  }

  // -----------------------------------------------------
  // Eventos globales DOM
  // -----------------------------------------------------

  // Botón agregar al carrito
  $(document).on('click', '.add-to-cart', function () {
    const card = $(this).closest('[data-name][data-price]');
    const name = card.data('name');
    const price = card.data('price');
    const img = card.find("img").attr("src") || "";

    addToCart(name, price, img);
  });

  // Abrir modal
  $(document).on('click', '#cart-btn', () => openCartModal());

  // Cerrar modal
  $(document).on('click', '[data-close="true"]', () => closeCartModal());

  // Botón pagar
  $(document).on('click', '#checkout-btn', () => startCheckout());

  // Escape para cerrar modal
  $(document).on('keydown', e => {
    if (e.key === "Escape" && $cartModal.attr('aria-hidden') === 'false') {
      closeCartModal();
    }
  });


  // =====================================================
  // === BUSCADOR GLOBAL
  // =====================================================
  function buscarProductos() { 
    
    const texto = $("#searchInput").val().toLowerCase().trim(); 
    $(".box.card, .product-card").each(function () { 
      const t = $(this).find("h3").text().toLowerCase(); 
      const d = $(this).find("p").text().toLowerCase(); 
      $(this).toggle(t.includes(texto) || d.includes(texto)); 
    }); 
  } 
      $("#searchInput").on("keyup", buscarProductos); $("#searchBtn").on("click", buscarProductos);
});

// Efecto de zoom rápido al hacer clic
const searchBtn = document.querySelector(".search-btn");
const searchForm = document.querySelector(".header-search");

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    searchBtn.classList.add("search-bounce");
    setTimeout(() => searchBtn.classList.remove("search-bounce"), 250);
  });
}

// Activar expansión solo en móviles
if (window.innerWidth <= 600) {
  searchBtn.addEventListener("click", (e) => {
    if (!searchForm.classList.contains("active")) {
      e.preventDefault(); // evita enviar vacío
      searchForm.classList.add("active");
      searchForm.querySelector("input").focus();
    }
  });
}