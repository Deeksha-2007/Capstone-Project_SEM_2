const builder = document.getElementById("builder");
const categoriesDiv = document.getElementById("categories");
const cartCount = document.getElementById("cartCount");

let currentMeal = {};
let cart = [];

async function fetchMenuData() {
  const res = await fetch("data.json");
  return await res.json();
}

function goBack() {
  builder.innerHTML = "";
  categoriesDiv.style.display = "grid";
}

async function selectCategory(type) {
  currentMeal = { type, price: 0 };
  categoriesDiv.style.display = "none";
  builder.style.display = "block";

  builder.innerHTML = `<p>Loading...</p>`;

  const data = await fetchMenuData();

  currentMeal.image = data[type].image;

  showOptions(data[type]);
}

function showOptions(categoryData) {
  let html = `<h2>Select Option</h2><div class="options">`;

  categoryData.options.forEach(item => {
    html += `
      <button onclick="finishMeal('${item.name}', ${item.price})">
        ${item.name}<br>₹${item.price}
      </button>
    `;
  });

  html += `</div>`;
  builder.innerHTML += html;
}

function finishMeal(choice, price) {
  currentMeal.choice = choice;
  currentMeal.price += price;

  builder.innerHTML = `
    <div class="card">
      <img src="${currentMeal.image}">

      <p><b>${choice}</b></p>
      <p>₹${currentMeal.price}</p>

      <button onclick="addToCart()" class="cartBtn">
        Add to Cart 🛒
      </button>

      <button onclick="goBack()" class="backInside">
        ⬅ Back
      </button>
    </div>
  `;
}

function addToCart() {
  cart.push(currentMeal);
  cartCount.innerText = cart.length;
  alert("Added to cart ✅");
}