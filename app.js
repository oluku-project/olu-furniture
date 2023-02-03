// const client = contentful.createClient({
//   // This is the space ID. A space is like a project folder in Contentful terms
//   space: "p5h078vbauhs",
//   // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
//   accessToken: "Wg8TFDXr2oqeFlnFSsPggMNQMB8NAzzvdi13h9ZR-Ak",
// });
// variables
const cartBtn = document.querySelector('.cart-btn');
const closeBtn = document.querySelector('.close-cart');
const clearBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverly = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart
let cart = [];
// buttons
let buttonsDOM = [];

// Ggetting the products
class Products {
  async getProducts() {
    try {
      // const contentful = await client.getEntries({
      //   content_type: "comfyHouseProduct",
      // });

      //            local data
      let result = await fetch('products.json');
      let data = await result.json();

      let products = data.items;
      products = products.map((item) => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.error(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((item) => {
      result += `
        <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${item.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${item.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${item.title}</h3>
                <h4>$${item.price}</h4>
            </article>
            <!-- end single product -->`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach((btn) => {
      let id = btn.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        btn.innerHTML = 'In Cart';
        btn.disabled = true;
      }
      btn.addEventListener('click', (e) => {
        e.target.innerHTML = 'In Cart';
        e.target.disabled = true;
        // get product from product
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerHTML = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
<img src=${item.image} alt="produt">
<div > 
    <h4>${item.title}</h4>
    <h5>$${item.price}</h5>
<span class="remove-item" data-id=${item.id}>remove</span>
</div>

<div>
    <i class="fas fa-chevron-up" data-id=${item.id}></i>
    <p class="item-amount" >${item.amount}</p>
    <i class="fas fa-chevron-down" data-id=${item.id}></i>
</div>
    `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverly.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  hideCart() {
    cartOverly.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }

  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeBtn.addEventListener('click', this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    // clear cat items
    clearBtn.addEventListener('click', () => {
      this.clearCart();
    });

    // cart funtionality
    cartContent.addEventListener('click', (event) => {
      // bubbling event
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = event.target.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = event.target.dataset.id;
        console.log(id);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = event.target.dataset.id;
        console.log(id);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    <i class="fas fa-shopping-cart"></i>
    add to bag
    `;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', domContentLoaded);

// load when window start
function domContentLoaded() {
  const ui = new UI();
  const products = new Products();

  // setup cart
  ui.setUpApp();
  //   get all products
  products
    .getProducts()
    .then((produts) => {
      ui.displayProducts(produts);
      Storage.saveProducts(produts);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
}
