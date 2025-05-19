document.addEventListener("DOMContentLoaded", function () {
    // Get the current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // List of pages with embedded navbar
    const pagesWithEmbeddedNavbar = [
        'aboutus.html',
        'reservations.html',
        'OurApproachToVeganism.html',
        'references.html',
        'contacts.html',
    ];
    
    // Only load navigation if not on a page with embedded navbar
    if (!pagesWithEmbeddedNavbar.includes(currentPage)) {
        // Load navigation from hoursLocation.html instead of header.html
        fetch("hoursLocation.html")
            .then(response => response.text())
            .then(data => {
                // Create a temporary div to parse the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data;
                
                // Extract the navigation section from hoursLocation.html
                const navSection = tempDiv.querySelector('.navbar');
                
                // Insert the navigation into the header div
                if (navSection && document.getElementById("header")) {
                    document.getElementById("header").innerHTML = navSection.outerHTML;
                    
                    // Add scroll effect to navbar using classes instead of inline styles
                    const navbar = document.querySelector('.navbar');
                    if (navbar) {
                        // Ensure the navbar has the navbar-expand-lg class
                        if (!navbar.classList.contains('navbar-expand-lg')) {
                            navbar.classList.add('navbar-expand-lg');
                        }
                        
                        // Check initial scroll position
                        if (window.scrollY > 50) {
                            navbar.classList.add('scrolled');
                        } else {
                            navbar.classList.remove('scrolled');
                        }
                        
                        // Add scroll event listener
                        window.addEventListener('scroll', function() {
                            if (window.scrollY > 50) {
                                navbar.classList.add('scrolled');
                            } else {
                                navbar.classList.remove('scrolled');
                            }
                        });
                        
                        // Add mouse position tracking for showing/hiding navbar
                        let lastScrollTop = 0;
                        let isMouseNearTop = false;
                        
                        function checkMousePosition(e) {
                            isMouseNearTop = e.clientY < 100;
                            
                            // If mouse is near top, show navbar
                            if (isMouseNearTop && navbar.classList.contains('hidden')) {
                                navbar.classList.remove('hidden');
                            }
                            
                            // If mouse is not near top and we've scrolled down, hide navbar
                            if (!isMouseNearTop && window.scrollY > 100 && !navbar.classList.contains('hidden')) {
                                navbar.classList.add('hidden');
                            }
                        }
                        
                        // Hide navbar when scrolling down past 100px
                        window.addEventListener('scroll', function() {
                            const scrollTop = window.scrollY || document.documentElement.scrollTop;
                            
                            if (scrollTop > 100 && scrollTop > lastScrollTop && !isMouseNearTop) {
                                navbar.classList.add('hidden');
                            } 
                            // Show navbar when scrolling up
                            else if (scrollTop < lastScrollTop) {
                                navbar.classList.remove('hidden');
                            }
                            
                            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
                        }, false);
                        
                        // Add mousemove event listener to detect cursor position
                        document.addEventListener('mousemove', checkMousePosition);
                        
                        // Mobile touch support
                        document.addEventListener('touchmove', function(e) {
                            const touch = e.touches[0];
                            if (touch.clientY < 100) {
                                isMouseNearTop = true;
                                navbar.classList.remove('hidden');
                            } else {
                                isMouseNearTop = false;
                            }
                        });
                        
                        // Set active link based on current page
                        const navLinks = document.querySelectorAll('.nav-link');
                        navLinks.forEach(link => {
                            // First remove any existing active classes
                            link.classList.remove('active');
                            
                            const linkHref = link.getAttribute('href');
                            // Only add active class if the href exactly matches current page
                            // or if we're on index.html/root and the link is to index.html
                            if (linkHref === currentPage || 
                                ((currentPage === '' || currentPage === '/') && linkHref === 'index.html') ||
                                (currentPage === 'hoursLocation.html' && linkHref === 'hoursLocation.html')) {
                                link.classList.add('active');
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error("Error loading navigation:", error);
            });
    } else {
        // For pages with embedded navbar, just add the scroll and mouse position effects
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // Check initial scroll position
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Add scroll event listener
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
            
            // Set active link based on current page for embedded navbars
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                // First remove any existing active classes
                link.classList.remove('active');
                
                const linkHref = link.getAttribute('href');
                // Only add active class if the href exactly matches current page
                if (linkHref === currentPage || 
                    ((currentPage === '' || currentPage === '/') && linkHref === 'index.html')) {
                    link.classList.add('active');
                }
            });
            
            // Add mouse position tracking for showing/hiding navbar
            let lastScrollTop = 0;
            let isMouseNearTop = false;
            
            function checkMousePosition(e) {
                isMouseNearTop = e.clientY < 100;
                
                // If mouse is near top, show navbar
                if (isMouseNearTop && navbar.classList.contains('hidden')) {
                    navbar.classList.remove('hidden');
                }
                
                // If mouse is not near top and we've scrolled down, hide navbar
                if (!isMouseNearTop && window.scrollY > 100 && !navbar.classList.contains('hidden')) {
                    navbar.classList.add('hidden');
                }
            }
            
            // Hide navbar when scrolling down past 100px
            window.addEventListener('scroll', function() {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                
                if (scrollTop > 100 && scrollTop > lastScrollTop && !isMouseNearTop) {
                    navbar.classList.add('hidden');
                } 
                // Show navbar when scrolling up
                else if (scrollTop < lastScrollTop) {
                    navbar.classList.remove('hidden');
                }
                
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
            }, false);
            
            // Add mousemove event listener to detect cursor position
            document.addEventListener('mousemove', checkMousePosition);
            
            // Mobile touch support
            document.addEventListener('touchmove', function(e) {
                const touch = e.touches[0];
                if (touch.clientY < 100) {
                    isMouseNearTop = true;
                    navbar.classList.remove('hidden');
                } else {
                    isMouseNearTop = false;
                }
            });
        }
    }

    // Always load the footer
    fetch("footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data);
});

//Sroll moveTop Click
const moveTopButton = document.getElementById("movetop");

// Show/hide button on scroll
window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {  // Show after 300px scroll
        moveTopButton.style.display = "block";
    } else {
        moveTopButton.style.display = "none";
    }
});

// Scroll to top on click
moveTopButton.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"  // Smooth scroll effect
    });
});

// <!-- ?YES OR NO HANDLE -->

document.addEventListener("DOMContentLoaded", function () {
    const radioButtons = document.querySelectorAll('input[name="option"]');
    const firstTextarea = document.querySelector(".first-textarea");

    function updateTextareaVisibility() {
        const selectedValue = document.querySelector(
            'input[name="option"]:checked'
        ).value;

        if (selectedValue === "yes") {
            firstTextarea.style.display = "block"; // Show first textarea
        } else {
            firstTextarea.style.display = "none"; // Hide first textarea
        }
    }

    // Run function on page load (since "Yes" is default)
    updateTextareaVisibility();

    // Add event listener to radio buttons
    radioButtons.forEach((radio) => {
        radio.addEventListener("change", updateTextareaVisibility);
    });
});

// NEXT FORM

function validateAndShowNextForm(currentFormId, nextFormId) {
    let allFilled = true;

    document
        .querySelectorAll(`#${currentFormId} .required-field`)
        .forEach((field) => {
            if (!field.value.trim()) {
                allFilled = false;
            }
        });

    if (allFilled) {
        document.getElementById(currentFormId).style.display = "none";
        document.getElementById(nextFormId).style.display = "block";
    } else {
        alert("Please fill all required fields");
    }
}

document.getElementById("next1").addEventListener("click", function () {
    validateAndShowNextForm("form1", "form2");
});

document.getElementById("next2").addEventListener("click", function () {
    validateAndShowNextForm("form2", "form3");
});

// ?THAMKS 
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".lestemploy").addEventListener("click", function () {
        let resumeField = document.getElementById("fileUpload");

        if (resumeField.files.length > 0) {
            // Form 3 hide karein
            document.getElementById("form3").style.display = "none";
            // Modal show karein
            document.getElementById("successModal").style.display = "flex";
            setTimeout(() => {
                window.location.reload();
            }, 3000); // 2 seconds ka delay
        } else {
            alert("Please upload your resume.");
        }
    });

    // Close modal function
    document.getElementById("closeModal").addEventListener("click", function () {
        setTimeout(() => {
            window.location.reload();
        }, 0);
        // Index page par redirect karein
        window.location.href = "index.html";

    });
});

// ?Doc FIle Upload
document
    .getElementById("fileUpload")
    .addEventListener("change", function () {
        let fileName =
            this.files.length > 0
                ? this.files[0].name
                : "Accepted formats: PDF, DOCX";
        document.getElementById("fileName").textContent = fileName;
    });

// Date Selected

const select = document.getElementById("dateSelect");
const today = new Date();
const monthsBefore = 12;
const monthsAfter = 12;

for (let i = -monthsBefore; i <= monthsAfter; i++) {
    let date = new Date();
    date.setMonth(today.getMonth() + i);

    let formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    let option = document.createElement("option");
    option.value = date.toISOString().split("T")[0];
    option.textContent = formattedDate;

    select.appendChild(option);
}





