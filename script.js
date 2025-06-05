// Main JavaScript file for INTELLECT website

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
});

// Typing Animation for Homepage
document.addEventListener('DOMContentLoaded', function() {
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const text = 'Welcome to INTELLECT';
        let index = 0;
        
        function typeText() {
            if (index < text.length) {
                typingElement.text
// Login Modal Functionality
const loginBtn = document.querySelector('.btn-login');
const loginModal = document.getElementById('login-modal');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('login-form');

// Open modal when login button is clicked
loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    loginModal.classList.add('active');
    loginModal.style.display = 'flex';
    setTimeout(() => {
        document.body.style.overflow = 'hidden';
    }, 10);
});

// Close modal when X is clicked
closeModal.addEventListener('click', function() {
    loginModal.classList.remove('active');
    setTimeout(() => {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
});

// Close modal when clicking outside content
loginModal.addEventListener('click', function(e) {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
        setTimeout(() => {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
});

// Handle form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Here you would typically make an API call to authenticate the user
    // For demonstration, we'll just log to console and show an alert
    console.log('Login attempt with:', { email, password });
    
    // Simulate successful login
    alert('Login successful! (This is a demo)');
    
    // Close the modal
    loginModal.classList.remove('active');
    setTimeout(() => {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
    
    // In a real app, you would redirect or update the UI here
});
