/**
 * Plate of Africa - Main JavaScript
 * Author: AI Developer
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', function() {

  // ===== Preloader =====
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 1000);
  });

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
        const offsetTop = targetElement.offsetTop - 100;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Update URL without page jump
        history.pushState(null, null, targetId);
      }
    });
  });

  // ===== Scroll to top button =====
  const moveTopBtn = document.getElementById('movetop');
  
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
  checkScroll();

  // ===== Testimonial Slider =====
  $('.testimonial-slider').slick({
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
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

  // ===== Menu Filtering =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      filterBtns.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const filterValue = this.getAttribute('data-filter');
      
      // Filter menu items
      menuItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // ===== Accordion Behavior =====
  const accordionButtons = document.querySelectorAll('.accordion-header');
  
  accordionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const target = document.querySelector(this.getAttribute('data-bs-target'));
      const isExpanded = target.classList.contains('show');
      
      // Close all other accordions
      document.querySelectorAll('.collapse.show').forEach(item => {
        if (item !== target) {
          item.classList.remove('show');
        }
      });
      
      // Reset all icons
      document.querySelectorAll('.accordion-icon svg').forEach(icon => {
        icon.style.transform = 'rotate(0deg)';
      });
      
      // Toggle current accordion
      if (!isExpanded) {
        target.classList.add('show');
        this.querySelector('.accordion-icon svg').style.transform = 'rotate(180deg)';
      } else {
        target.classList.remove('show');
      }
    });
  });

  // ===== Interactive Map =====
  const locationMarkers = document.querySelectorAll('.location-marker');
  const locationInfoContainer = document.querySelector('.location-info-container');
  const locationInfos = document.querySelectorAll('.location-info');
  
  locationMarkers.forEach(marker => {
    marker.addEventListener('click', function() {
      const location = this.getAttribute('data-location');
      
      // Show info container
      locationInfoContainer.classList.add('active');
      
      // Hide all location infos
      locationInfos.forEach(info => {
        info.classList.remove('active');
      });
      
      // Show selected location info
      document.getElementById(`${location}-info`).classList.add('active');
    });
  });
  
  // Close location info when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.location-marker') && !e.target.closest('.location-info-container')) {
      locationInfoContainer.classList.remove('active');
    }
  });

  // ===== FAQ Section =====
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const isCollapsed = this.classList.contains('collapsed');
      
      if (!isCollapsed) {
        this.classList.add('collapsed');
        const target = document.querySelector(this.getAttribute('data-bs-target'));
        target.classList.remove('show');
      } else {
        this.classList.remove('collapsed');
        const target = document.querySelector(this.getAttribute('data-bs-target'));
        target.classList.add('show');
      }
    });
  });

  // ===== Handle form submission =====
  const reservationForm = document.querySelector('.reservation-form');
  
  if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Here you would normally send the form data to a server
      alert('Thank you for your reservation request! We will confirm your booking shortly.');
      
      // Reset form after submission
      this.reset();
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
