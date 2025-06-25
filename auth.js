// auth.js
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
    
    async signup(email, password, fullName) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName
                }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Signup failed' }));
                throw new Error(errorData.detail || 'Signup failed');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }
    
    async login(email, password) {
        try {
            // Using URLSearchParams for proper form-urlencoded format
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            
            const response = await fetch(`${this.apiBaseUrl}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
                throw new Error(errorData.detail || 'Login failed');
            }
            
            const data = await response.json();
            
            if (!data.access_token) {
                throw new Error('No access token received');
            }
            
            // Store token and user data
            this.token = data.access_token;
            this.user = data.user || { email }; // Fallback user data if not provided
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
            // Attempt server logout
            await fetch(`${this.apiBaseUrl}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: this.getAuthHeaders()
            }).catch(() => {}); // Ignore errors if server is unreachable
            
            // Clear all auth storage
            this.clearAuth();
            
            // Clear cookies by expiring them
            document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.dariusmumbere.github.io';
            
            // Redirect to login page
            window.location.href = 'https://dariusmumbere.github.io/inventoryy/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.clearAuth();
            window.location.href = 'https://dariusmumbere.github.io/inventoryy/login.html';
        }
    }
    
    async validateToken() {
        if (!this.token) {
            this.clearAuth();
            return false;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/me`, {
                credentials: 'include',
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
            window.location.href = 'https://dariusmumbere.github.io/inventoryy/index.html';
        }
    }
}

// Initialize auth instance
const auth = new Auth();

// Login form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const signupEmailError = document.getElementById('signupEmailError');
    const signupPasswordError = document.getElementById('signupPasswordError');
    const signupNameError = document.getElementById('signupNameError');
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const loginContainer = document.getElementById('loginContainer');
    const signupContainer = document.getElementById('signupContainer');
    
    // Toggle between login and signup forms
    if (signupLink && loginLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginContainer.style.display = 'none';
            signupContainer.style.display = 'block';
        });
        
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupContainer.style.display = 'none';
            loginContainer.style.display = 'block';
        });
    }
    
    // Redirect if already logged in
    if (window.location.pathname.includes('/login.html')) {
        auth.redirectIfAuthenticated();
    }
    
    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Handle login form submission
    if (loginForm && emailInput && passwordInput) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset errors
            if (emailError) emailError.style.display = 'none';
            if (passwordError) passwordError.style.display = 'none';
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Basic validation
            let isValid = true;
            
            if (!email || !email.includes('@')) {
                if (emailError) {
                    emailError.textContent = 'Please enter a valid email address';
                    emailError.style.display = 'block';
                }
                isValid = false;
            }
            
            if (!password || password.length < 6) {
                if (passwordError) {
                    passwordError.textContent = 'Password must be at least 6 characters';
                    passwordError.style.display = 'block';
                }
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                const loginBtn = document.getElementById('loginBtn');
                if (loginBtn) {
                    loginBtn.disabled = true;
                    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                }
                
                await auth.login(email, password);
                
                // Redirect to main page after successful login
                window.location.href = 'https://dariusmumbere.github.io/inventoryy/index.html';
            } catch (error) {
                // Show error message
                const errorMessage = error.message || 'Login failed. Please try again.';
                if (passwordError) {
                    passwordError.textContent = errorMessage;
                    passwordError.style.display = 'block';
                }
                
                // Reset button
                const loginBtn = document.getElementById('loginBtn');
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                }
            }
        });
    }
    
    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset errors
            if (signupEmailError) signupEmailError.style.display = 'none';
            if (signupPasswordError) signupPasswordError.style.display = 'none';
            if (signupNameError) signupNameError.style.display = 'none';
            
            const email = signupForm.querySelector('#signupEmail').value.trim();
            const password = signupForm.querySelector('#signupPassword').value.trim();
            const fullName = signupForm.querySelector('#fullName').value.trim();
            
            // Validation
            let isValid = true;
            
            if (!email || !email.includes('@')) {
                if (signupEmailError) {
                    signupEmailError.textContent = 'Please enter a valid email address';
                    signupEmailError.style.display = 'block';
                }
                isValid = false;
            }
            
            if (!password || password.length < 6) {
                if (signupPasswordError) {
                    signupPasswordError.textContent = 'Password must be at least 6 characters';
                    signupPasswordError.style.display = 'block';
                }
                isValid = false;
            }
            
            if (!fullName) {
                if (signupNameError) {
                    signupNameError.textContent = 'Please enter your full name';
                    signupNameError.style.display = 'block';
                }
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                const signupBtn = signupForm.querySelector('#signupBtn');
                if (signupBtn) {
                    signupBtn.disabled = true;
                    signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                }
                
                await auth.signup(email, password, fullName);
                
                // Show success message and redirect to login
                showToast('Account created successfully! Please login.');
                signupContainer.style.display = 'none';
                loginContainer.style.display = 'block';
                
                // Reset form
                signupForm.reset();
            } catch (error) {
                // Show error message
                const errorMessage = error.message || 'Signup failed. Please try again.';
                if (signupPasswordError) {
                    signupPasswordError.textContent = errorMessage;
                    signupPasswordError.style.display = 'block';
                }
                
                // Reset button
                const signupBtn = signupForm.querySelector('#signupBtn');
                if (signupBtn) {
                    signupBtn.disabled = false;
                    signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
                }
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
    if (!window.location.pathname.includes('/login.html') && 
        !window.location.pathname.includes('/signup.html')) {
        auth.ensureAuthenticated();
    }
});

// Add auth headers to all fetch requests
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    // Skip auth for login requests and external URLs
    if (!url.includes(auth.apiBaseUrl) && !url.startsWith('/')) {
        return originalFetch(url, options);
    }
    
    if (auth.isAuthenticated()) {
        options.headers = {
            ...options.headers,
            ...auth.getAuthHeaders()
        };
    }
    
    try {
        const response = await originalFetch(url, options);
        
        // If unauthorized, logout and redirect to login
        if (response.status === 401) {
            auth.clearAuth();
            window.location.href = 'https://dariusmumbere.github.io/inventoryy/login.html';
            return response;
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Export auth instance for use in other scripts
window.auth = auth;
