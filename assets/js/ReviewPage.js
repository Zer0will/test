let count = 1;

function increment() {
    count++;
    document.getElementById('productQuantity').innerText = count;
}

function decrement() {
    // Ensure the count does not go below 1
    if (count > 1) {
        count--;
        document.getElementById('productQuantity').innerText = count;
    } else {
        alert("Count cannot be less than 1!"); // Optional: Show a message
    }
}

const remainSection = document.querySelector('.remainSection');
const scrollLine = document.querySelector('.scrollLine');

remainSection.addEventListener('scroll', () => {
    const scrollPercentage = (remainSection.scrollTop / (remainSection.scrollHeight - remainSection.clientHeight)) * 100;
    const maxTop = remainSection.clientHeight - scrollLine.clientHeight;
    scrollLine.style.top = `${(scrollPercentage / 100) * maxTop}px`;
});


function changeImage(src, element) {
    // Change the main image source
    document.getElementById('mainImg').src = src;

    // Remove the 'selected' class from all small images
    var smallImages = document.querySelectorAll('.imgNeedTo');
    smallImages.forEach(function (img) {
        img.classList.remove('selected');
    });

    // Add the 'selected' class to the clicked small image
    element.classList.add('selected');
}

// Initialize the second image as selected on page load
window.onload = function () {
    var secondImage = document.querySelector('.imagesPOuter .imgNeedTo:nth-child(2)'); // Corrected to nth-child(2)
    secondImage.classList.add('selected');
};


document.addEventListener("DOMContentLoaded", function () {
    const writeReviewBtn = document.querySelector(".writeReviewBtn");
    const reviewOuter = document.querySelector(".reviewOuter");
    const reviewSection = document.querySelector(".reviewSection");
    const closeBtn = document.querySelector(".closeBtn");
    const stars = document.querySelectorAll(".star");
    const sendBtn = document.querySelector(".sendBtn");
    const reviewSuccess = document.querySelector(".reviewSuccess");
    const reviewSuccessCloseBtn = document.querySelector(".reviewModal1 .closeBtn");
    const reviewOuter1 = document.querySelector(".reviewOuter1");

    // Show review section & hide reviewOuter
    writeReviewBtn.addEventListener("click", function () {
        reviewOuter.style.display = "none";
        reviewSection.style.display = "block";
    });

    // Close review section
    closeBtn.addEventListener("click", function () {
        reviewSection.style.display = "none";
        reviewOuter.style.display = "block"; // Show the previous section again
    });

    // Star rating system
    stars.forEach((star, index) => {
        star.addEventListener("click", function () {
            stars.forEach((s, i) => {
                s.classList.toggle("active", i <= index);
            });
        });
    });

    sendBtn.addEventListener("click", function () {
        reviewSection.style.display = "none"; // Hide the review section
        reviewSuccess.style.display = "block"; // Show the reviewSuccess div
    });
    reviewSuccessCloseBtn.addEventListener("click", function () {
        reviewOuter1.style.display = "none"; // Hide the reviewSuccess section
        reviewOuter.style.display = "block"; // Show the reviewOuter section
    });

});



const reviews = [
    {
        userName: "Marvin McKinney",
        userImage: "./assets/images/user1.png",
        daysText: "2 days ago",
        reviewTextDetail: "I love this store's shirt! It's so comfortable and easy to wear with anything. I ended up buying one in every color during their sale. The quality is great too. Thank you!",
        rating: 4
    },
    {
        userName: "SAVANNAH NGUYEN",
        userImage: "./assets/images/user2.jpg",
        daysText: "19 days ago",
        reviewTextDetail: "I'm so impressed with the customer service at this store! The staff was friendly and helpful, and I found the perfect shirt. It looks and feels amazing. I'll definitely be shopping here again.",
        rating: 4
    },
    {
        userName: "EMMA JOHNSON",
        userImage: "./assets/images/user3.jpg",
        daysText: "22 days ago",
        reviewTextDetail: "This store has become my go-to for casual wear! The shirts are not only stylish but also incredibly comfortable. I recently bought a few during their sale, and I’m already planning my next purchase. Highly recommend!",
        rating: 4
    },
    {
        userName: "LIAM SMITH",
        userImage: "./assets/images/user4.jpg",
        daysText: "26 days ago",
        reviewTextDetail: "I had an amazing shopping experience here. The staff was very attentive and helped me pick out the perfect fit. The quality of the shirts is outstanding, and they’ve held up really well after multiple washes.",
        rating: 4
    }
];


// Save the dataset to local storage
let storedReviews = JSON.parse(localStorage.getItem("reviews"));

// If no reviews exist in localStorage, initialize it with the default dataset
if (!storedReviews) {
    localStorage.setItem("reviews", JSON.stringify(reviews)); // Use `reviews` instead of `defaultReviews`
    storedReviews = reviews; // Set `storedReviews` to `reviews`
}

// Function to generate a random human-like name
function generateRandomHumanName() {
    const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "James", "Isabella", "Oliver"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${randomFirstName} ${randomLastName}`;
}

// Function to render reviews
function renderReviews() {
    const remainSection = document.getElementById("remainSection");

    // Clear existing content (except scrollLine and overlayClass)
    remainSection.innerHTML = `
        <div class="scrollLine"></div>
       
    `;

    // Map over the dataset and create HTML elements
    storedReviews.forEach((review) => {
        const reviewElement = document.createElement("div");
        reviewElement.classList.add("reviewOuterMain");

        // Generate star icons based on the rating
        const starIcons = Array.from({ length: 5 }, (_, index) => {
            return `<span class="star-icon ${index < review.rating ? 'active' : ''}">★</span>`;
        }).join("");

        reviewElement.innerHTML = `
            <div class="reviewUserSection">
                <div class="userNameSection">
                    <img src="${review.userImage}" class="userImg" alt="${review.userName}">
                    <div class="nameMainOuter">
                        <div class="userName">${review.userName}</div>
                        <div class="star-rating">${starIcons}</div>
                    </div>
                </div>
                <div class="daysText">${review.daysText}</div>
            </div>
            <div class="reviewTextDetail">
                ${review.reviewTextDetail}
            </div>
        `;

        // Append the new review to the top of the list
        remainSection.appendChild(reviewElement);
    });
}

// Function to add a new review
function addReview() {
    const reviewTextArea = document.querySelector(".reviewTextAreaModal");
    const stars = document.querySelectorAll(".star");

    // Check if the textarea is empty
    if (reviewTextArea.value.trim() === "") {
        alert("Please enter your review!");
        return;
    }

    // Count the number of selected stars
    let selectedStars = 0;
    stars.forEach((star) => {
        if (star.classList.contains("active")) {
            selectedStars++;
        }
    });

    // Generate a random human-like name
    const randomUserName = generateRandomHumanName();

    // Create a new review object
    const newReview = {
        userName: randomUserName, // Use the generated human-like name
        userImage: "./assets/images/guest.jpg", // Dummy image
        daysText: "Just now",
        reviewTextDetail: reviewTextArea.value,
        rating: selectedStars // Save the rating
    };

    // Add the new review to the beginning of the array
    storedReviews.unshift(newReview);

    // Save the updated dataset to local storage
    localStorage.setItem("reviews", JSON.stringify(storedReviews));

    // Clear the textarea and reset stars
    reviewTextArea.value = "";
    stars.forEach((star) => star.classList.remove("active"));

    // Re-render the reviews
    renderReviews();
}

// Add event listener to the Send button
const sendBtn = document.querySelector(".sendBtn");
sendBtn.addEventListener("click", addReview);

// Star rating functionality
const stars = document.querySelectorAll(".star");
stars.forEach((star, index) => {
    star.addEventListener("click", () => {
        // Toggle the 'active' class for stars
        stars.forEach((s, i) => {
            s.classList.toggle("active", i <= index);
        });
    });
});

// Initial render of reviews
renderReviews();


const moveUpArrow = document.querySelector('.moveupArrow');

// Add a click event listener to the image
moveUpArrow.addEventListener('click', () => {
    // Scroll to the top of the page with smooth behavior
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scroll
    });
});





function addToCart() {
    // Retrieve the selected product from localStorage
    const selectedProduct = JSON.parse(localStorage.getItem("selectedItem"));
    if (!selectedProduct) {
        console.error("No product selected!");
        alert("No product selected. Please select a product first.");
        return;
    }

    // Get the current quantity
    const quantityElement = document.getElementById("productQuantity");
    if (!quantityElement) {
        console.error("Quantity element not found!");
        return;
    }
    const quantity = parseInt(quantityElement.textContent);

    // Add the productQuantity property to the selected product
    const productWithQuantity = {
        ...selectedProduct,
        productQuantity: quantity
    };

    // Retrieve the existing cartItems array from localStorage
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    // Check if the product already exists in the cart
    const existingProductIndex = cartItems.findIndex(item => item.id === selectedProduct.id);

    if (existingProductIndex !== -1) {
        // If the product exists, update its quantity (replace the previous quantity)
        cartItems[existingProductIndex].productQuantity = quantity;
    } else {
        // If the product does not exist, add it to the cart
        cartItems.push(productWithQuantity);
    }

    // Save the updated cartItems array back to localStorage
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    // Redirect to Order.html
    window.location.href = "Order.html";
}

// Add event listener to the "Add To Cart" button
const cartBtn = document.querySelector(".cartBtn");
if (cartBtn) {
    cartBtn.addEventListener("click", addToCart);
} else {
    console.error("Cart button not found!");
}