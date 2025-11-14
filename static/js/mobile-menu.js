// static/js/mobile-menu.js
// Mobile Menu Toggle Functionality

(function () {
  'use strict';

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const headerNav = document.getElementById('header-nav');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const navButtons = headerNav.querySelectorAll('.nav-btn');

    if (!mobileMenuToggle || !headerNav || !mobileMenuOverlay || !mobileMenuClose) {
      console.error('Mobile menu elements not found');
      return;
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
      const isOpen = headerNav.classList.contains('mobile-menu-open');

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    // Open mobile menu
    function openMobileMenu() {
      headerNav.classList.add('mobile-menu-open');
      mobileMenuOverlay.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>'; // Change to X icon
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close mobile menu
    function closeMobileMenu() {
      headerNav.classList.remove('mobile-menu-open');
      mobileMenuOverlay.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>'; // Change back to hamburger
      document.body.style.overflow = ''; // Restore scrolling
    }

    // Event Listeners
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    // Close menu when clicking a navigation button
    navButtons.forEach(button => {
      button.addEventListener('click', function () {
        // Small delay to allow the scroll to happen
        setTimeout(closeMobileMenu, 100);
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && headerNav.classList.contains('mobile-menu-open')) {
        closeMobileMenu();
      }
    });

    // Close menu on window resize if screen becomes large
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 768 && headerNav.classList.contains('mobile-menu-open')) {
          closeMobileMenu();
        }
      }, 250);
    });

    // Prevent body scroll when menu is open and user tries to scroll
    headerNav.addEventListener('touchmove', function (e) {
      if (headerNav.classList.contains('mobile-menu-open')) {
        e.stopPropagation();
      }
    });
  });
})();
