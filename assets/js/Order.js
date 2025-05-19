let count = 2;

function increment() {
    count++;
    document.getElementById('counter').innerText = count;
}

function decrement() {
    count--;
    document.getElementById('counter').innerText = count;
}

const moveUpArrow = document.querySelector('.moveupArrow');

// Add a click event listener to the image
moveUpArrow.addEventListener('click', () => {
    // Scroll to the top of the page with smooth behavior
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scroll
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const paypalBtn = document.getElementById('paypalBtn');
    const visaBtn = document.getElementById('visaBtn');
    const paypalSection = document.getElementById('paypalSection');
    const visaSection = document.getElementById('visaSection');

    // Initially show PayPal section and set PayPal button as selected
    paypalSection.classList.add('active');
    paypalBtn.classList.add('paypalBtnSelected');
    visaBtn.classList.add('paypalBtnUnselected');

    paypalBtn.addEventListener('click', function () {
        // Show PayPal section
        paypalSection.classList.add('active');
        visaSection.classList.remove('active');

        // Set PayPal button as selected
        paypalBtn.classList.remove('paypalBtnUnselected');
        paypalBtn.classList.add('paypalBtnSelected');

        // Set Visa button as unselected
        visaBtn.classList.remove('paypalBtnSelected');
        visaBtn.classList.add('paypalBtnUnselected');
    });

    visaBtn.addEventListener('click', function () {
        // Show Visa section
        visaSection.classList.add('active');
        paypalSection.classList.remove('active');

        // Set Visa button as selected
        visaBtn.classList.remove('paypalBtnUnselected');
        visaBtn.classList.add('paypalBtnSelected');

        // Set PayPal button as unselected
        paypalBtn.classList.remove('paypalBtnSelected');
        paypalBtn.classList.add('paypalBtnUnselected');
    });
});



let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// Function to render cart items
function renderCartItems() {
    const sumaryMain = document.querySelector(".sumaryMain");
    if (!sumaryMain) {
        console.error("Summary main container not found!");
        return;
    }

    // Clear existing content
    sumaryMain.innerHTML = `
        <div class="summaryText">Summary</div>
    `;

    // Check if cartItems array is empty
    if (cartItems.length === 0) {
        const noItemsMessage = document.createElement("div");
        noItemsMessage.classList.add("no-items-message");
        noItemsMessage.textContent = "No items in cart";
        sumaryMain.appendChild(noItemsMessage);
        return; // Exit the function early
    }

    // Map over the cartItems array and create HTML elements
    cartItems.forEach((item, index) => {
        const productMainOuter = document.createElement("div");
        productMainOuter.classList.add("productMainOuter");

        productMainOuter.innerHTML = `
       <div class="cursorClass">  <img src="./assets/images/productListing.png" class="productListing-Image" alt="" onclick="deleteItem(${index})"></div>
            <div class="productMainSection">
                <img src="${item.image}" class="productImg" alt="${item.name}">
                <div class="productDetailSection">
                    <div class="productNameouter">
                        <div class="productName">${item.name}</div>
                        <input type="checkbox" checked>
                    </div>
                    <div class="productDetailText">
                        ${item.description}
                    </div>
                    <div class="priceSection">
                        <div class="priceText">${item.price}</div>
                        <div class="selectedNumber">
                            <div class="minusDiv" onclick="decrement(${index})">➖</div>
                            <div class="SelectedDiv" id="counter-${index}">${item.productQuantity}</div>
                            <div class="plusDiv" onclick="increment(${index})">➕</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        sumaryMain.appendChild(productMainOuter);
    });
}





// Function to increment quantity

// Initial render of cart items
renderCartItems();





function renderOrderSummary() {
    const dynamicCartItems = document.getElementById("dynamicCartItems");
    const totalAmountElement = document.getElementById("totalAmount");
    if (!dynamicCartItems || !totalAmountElement) {
        console.error("Dynamic cart items or total amount container not found!");
        return;
    }

    // Clear existing dynamic content
    dynamicCartItems.innerHTML = "";

    // Retrieve cartItems from localStorage
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    let totalPrice = 0; // Initialize total price

    // Map over the cartItems array and create HTML elements
    cartItems.forEach((item) => {
        const productLisOuter = document.createElement("div");
        productLisOuter.classList.add("productLisOuter");

        // Calculate the total price for the item
        const price = parseFloat(item.price.replace("$", "")); // Remove "$" and convert to number
        const itemTotalPrice = (price * item.productQuantity).toFixed(2); // Calculate total price for the item
        totalPrice += parseFloat(itemTotalPrice); // Add to the total price

        productLisOuter.innerHTML = `
            <div class="liberianText">${item.name}</div>
            <div class="abountTxet">${itemTotalPrice} US$</div>
        `;

        dynamicCartItems.appendChild(productLisOuter);
    });

    // Display the total price
    totalAmountElement.textContent = `${totalPrice.toFixed(2)} US$`;
}

// Call the function to render the order summary
renderOrderSummary();


function deleteItem(index) {
    if (cartItems[index]) {
        // Remove the item from the cartItems array
        cartItems.splice(index, 1);

        // Save the updated cartItems array to localStorage
        localStorage.setItem("cartItems", JSON.stringify(cartItems));

        // Re-render the cart items
        renderCartItems();
        renderOrderSummary();
    }
}


function increment(index) {
    if (cartItems[index]) {
        cartItems[index].productQuantity++;
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        renderCartItems();
        renderOrderSummary(); // Re-render the list
    }
}

// Function to decrement quantity
function decrement(index) {
    if (cartItems[index] && cartItems[index].productQuantity > 1) {
        cartItems[index].productQuantity--;
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        renderCartItems();
        renderOrderSummary(); // Re-render the list
    }
}
