/**
 * Plate of Africa - Main JavaScript
 * Author: AI Developer
 * Version: 1.1
 */

document.addEventListener('DOMContentLoaded', function() {

  // ===== Preloader =====
  const preloader = document.getElementById('preloader');
  
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 1000);
  }

  // ===== Navbar scroll behavior =====
  const navbar = document.querySelector('.navbar');
  let lastScrollTop = 0;
  let isMouseNearTop = false;

  // Check initial scroll position
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  }

  // Add scroll event listener for navbar
  window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Add scrolled class when scrolling down
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Hide navbar when scrolling down past 100px
    if (scrollTop > 100 && scrollTop > lastScrollTop && !isMouseNearTop) {
      navbar.classList.add('hidden');
    } 
    // Show navbar when scrolling up
    else if (scrollTop < lastScrollTop) {
      navbar.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
  });

  // Show navbar when mouse is near top
  function checkMousePosition(e) {
    isMouseNearTop = e.clientY < 100;
    
    // If mouse is near top, show navbar
    if (isMouseNearTop && navbar.classList.contains('hidden')) {
      navbar.classList.remove('hidden');
    }
  }

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

  // ===== Smooth scrolling for anchor links =====
  const anchors = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Calculate the offset position
        // Adding a delay to ensure the navbar has completed its transition
        setTimeout(() => {
          const navHeight = navbar.offsetHeight;
          const offsetTop = targetElement.offsetTop - navHeight - 20;
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
          
          // Update URL without page jump
          history.pushState(null, null, targetId);
        }, 100);
      }
    });
  });

  // ===== Scroll to top button =====
  const moveTopBtn = document.getElementById('movetop');
  
  if (moveTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        moveTopBtn.classList.add('show');
      } else {
        moveTopBtn.classList.remove('show');
      }
    });
    
    moveTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===== Scroll animations =====
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  function checkScroll() {
    animateElements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight * 0.85) {
        element.classList.add('show');
      }
    });
  }
  
  window.addEventListener('scroll', checkScroll);
  window.addEventListener('resize', checkScroll);
  
  // Trigger on initial load
  setTimeout(checkScroll, 100);

  // ===== Testimonial Slider =====
  if (typeof $.fn.slick !== 'undefined') {
    const testimonialSlider = $('.testimonial-slider');
    
    if (testimonialSlider.length) {
      testimonialSlider.slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        prevArrow: '<button type="button" class="slick-prev"><i class="bi bi-chevron-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="bi bi-chevron-right"></i></button>',
        responsive: [
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    }
  }

  // ===== Menu Filtering =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  
  if (filterBtns.length && menuItems.length) {
    // Initially show all items
    menuItems.forEach(item => {
      item.style.display = 'block';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        
        // Filter menu items
        menuItems.forEach(item => {
          const category = item.getAttribute('data-category');
          
          if (filterValue === 'all' || category === filterValue) {
            // Show matching items
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 50);
          } else {
            // Hide non-matching items
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // ===== Accordion Behavior - fixed version =====
  // For Why Veganism section
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  if (accordionHeaders.length) {
    accordionHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const targetId = this.getAttribute('data-bs-target');
        const targetElement = document.querySelector(targetId);
        
        if (!targetElement) return;
        
        const isExpanded = targetElement.classList.contains('show');
        
        // First close all other accordions in the same container
        const accordionContainer = this.closest('.accordion-container');
        if (accordionContainer) {
          accordionContainer.querySelectorAll('.collapse').forEach(item => {
            if (item !== targetElement) {
              item.classList.remove('show');
            }
          });
          
          accordionContainer.querySelectorAll('.accordion-header').forEach(otherHeader => {
            if (otherHeader !== this) {
              const icon = otherHeader.querySelector('.accordion-icon svg');
              if (icon) {
                icon.style.transform = 'rotate(0deg)';
              }
            }
          });
        }
        
        // Now toggle the current accordion
        if (!isExpanded) {
          targetElement.classList.add('show');
          const icon = this.querySelector('.accordion-icon svg');
          if (icon) {
            icon.style.transform = 'rotate(180deg)';
          }
        } else {
          targetElement.classList.remove('show');
          const icon = this.querySelector('.accordion-icon svg');
          if (icon) {
            icon.style.transform = 'rotate(0deg)';
          }
        }
      });
    });
  }

  // ===== Interactive Map =====
  const locationMarkers = document.querySelectorAll('.location-marker');
  const locationInfoContainer = document.querySelector('.location-info-container');
  const locationInfos = document.querySelectorAll('.location-info');
  
  if (locationMarkers.length && locationInfoContainer && locationInfos.length) {
    // Show Seattle by default
    setTimeout(() => {
      locationInfoContainer.classList.add('active');
      document.getElementById('seattle-info').classList.add('active');
    }, 1000);
    
    locationMarkers.forEach(marker => {
      marker.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent document click from immediately closing
        const location = this.getAttribute('data-location');
        
        // Show info container
        locationInfoContainer.classList.add('active');
        
        // Hide all location infos
        locationInfos.forEach(info => {
          info.classList.remove('active');
        });
        
        // Show selected location info
        const targetInfo = document.getElementById(`${location}-info`);
        if (targetInfo) {
          targetInfo.classList.add('active');
        }
      });
    });
    
    // Close location info when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.location-marker') && !e.target.closest('.location-info-container')) {
        locationInfoContainer.classList.remove('active');
      }
    });
  }

  // ===== FAQ Section - fixed version =====
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  if (faqQuestions.length) {
    faqQuestions.forEach(question => {
      question.addEventListener('click', function() {
        const targetId = this.getAttribute('data-bs-target');
        const targetElement = document.querySelector(targetId);
        
        if (!targetElement) return;
        
        const isCollapsed = this.classList.contains('collapsed');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-answer').forEach(answer => {
          if (answer !== targetElement) {
            answer.classList.remove('show');
          }
        });
        
        document.querySelectorAll('.faq-question').forEach(q => {
          if (q !== this) {
            q.classList.add('collapsed');
          }
        });
        
        // Toggle current FAQ
        if (isCollapsed) {
          this.classList.remove('collapsed');
          targetElement.classList.add('show');
        } else {
          this.classList.add('collapsed');
          targetElement.classList.remove('show');
        }
      });
    });
  }

  // ===== Handle form submission =====
  const reservationForm = document.querySelector('.reservation-form');
  
  if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate form
      let isValid = true;
      const name = this.querySelector('#nameInput');
      const email = this.querySelector('#emailInput');
      const date = this.querySelector('#dateInput');
      const time = this.querySelector('#timeInput');
      
      if (!name.value.trim()) {
        isValid = false;
        name.classList.add('is-invalid');
      } else {
        name.classList.remove('is-invalid');
      }
      
      if (!email.value.trim() || !email.value.includes('@')) {
        isValid = false;
        email.classList.add('is-invalid');
      } else {
        email.classList.remove('is-invalid');
      }
      
      if (!date.value) {
        isValid = false;
        date.classList.add('is-invalid');
      } else {
        date.classList.remove('is-invalid');
      }
      
      if (!time.value) {
        isValid = false;
        time.classList.add('is-invalid');
      } else {
        time.classList.remove('is-invalid');
      }
      
      if (isValid) {
        // Here you would normally send the form data to a server
        alert('Thank you for your reservation request! We will confirm your booking shortly.');
        
        // Reset form after submission
        this.reset();
      }
    });
  }
  
  // ===== Load footer content =====
  const footerElement = document.getElementById('footer');
  
  if (footerElement) {
    fetch('footer.html')
      .then(response => response.text())
      .then(data => {
        footerElement.innerHTML = data;
      })
      .catch(error => {
        console.error('Error loading footer:', error);
      });
  }
});
