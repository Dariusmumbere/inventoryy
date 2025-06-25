class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.apiBaseUrl = 'https://inventry-mn6a.onrender.com';
        
        // Check token validity on initialization
        if (this.token) {
            this.validateToken();
        }
    }
    
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }
            
            const data = await response.json();
            
            // Store token and user data
            this.token = data.access_token;
            this.user = data.user;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    async logout() {
        try {
            await fetch(`${this.apiBaseUrl}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: this.getAuthHeaders()
            });
            
            // Clear local storage
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    async validateToken() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/me`, {
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                this.clearAuth();
                return false;
            }
            
            const userData = await response.json();
            this.user = userData;
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            this.clearAuth();
            return false;
        }
    }
    
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    isAdmin() {
        return this.isAuthenticated() && this.user?.role === 'admin';
    }
    
    // Redirect to login if not authenticated
    ensureAuthenticated() {
        if (!this.isAuthenticated()) {
            window.location.href = 'https://dariusmumbere.github.io/inventoryy/login.html';
        }
    }
    
    // Redirect to home if authenticated
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    }
}

// Initialize auth instance
const auth = new Auth();

// Login form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    // Redirect if already logged in
    auth.redirectIfAuthenticated();
    
    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset errors
            emailError.style.display = 'none';
            passwordError.style.display = 'none';
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Basic validation
            let isValid = true;
            
            if (!email || !email.includes('@')) {
                emailError.style.display = 'block';
                isValid = false;
            }
            
            if (!password || password.length < 6) {
                passwordError.style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                const loginBtn = document.getElementById('loginBtn');
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                
                await auth.login(email, password);
                
                // Redirect to main page after successful login
                window.location.href = 'https://dariusmumbere.github.io/inventoryy/index.html';
            } catch (error) {
                // Show error message
                const errorMessage = error.message || 'Login failed. Please try again.';
                passwordError.textContent = errorMessage;
                passwordError.style.display = 'block';
                
                // Reset button
                const loginBtn = document.getElementById('loginBtn');
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            }
        });
    }
    
    // Add logout functionality to all pages
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    });
    
    // Check authentication on protected pages
    if (!window.location.pathname.includes('login.html')) {
        auth.ensureAuthenticated();
    }
});

// Add auth headers to all fetch requests
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    if (auth.isAuthenticated()) {
        options.headers = {
            ...options.headers,
            ...auth.getAuthHeaders()
        };
    }
    
    const response = await originalFetch(url, options);
    
    // If unauthorized, logout and redirect to login
    if (response.status === 401) {
        auth.clearAuth();
        window.location.href = 'login.html';
    }
    
    return response;
};

// Export auth instance for use in other scripts
window.auth = auth;
