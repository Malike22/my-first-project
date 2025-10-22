// Role icons mapping
const roleIcons = {
    student: 'fas fa-user-graduate',
    teacher: 'fas fa-chalkboard-teacher',
    hod: 'fas fa-user-tie',
    principal: 'fas fa-crown'
};

// Role titles mapping
const roleTitles = {
    student: 'Student Login',
    teacher: 'Teacher Login',
    hod: 'HOD Login',
    principal: 'Principal Login'
};

// DOM elements
const roleSelector = document.querySelector('.role-selector');
const loginFormContainer = document.getElementById('loginFormContainer');
const roleButtons = document.querySelectorAll('.role-btn');
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const roleIcon = document.getElementById('roleIcon');
const roleTitle = document.getElementById('roleTitle');

// Selected role
let selectedRole = null;

// Event listeners
roleButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedRole = button.dataset.role;
        showLoginForm(selectedRole);
    });
});

loginForm.addEventListener('submit', handleLogin);

// Auto-fill credentials when clicking on demo credential items
document.addEventListener('click', (e) => {
    if (e.target.closest('.credential-item')) {
        const credentialText = e.target.closest('.credential-item').textContent;
        const match = credentialText.match(/(\w+): (\w+) \/ (\w+)/);
        if (match) {
            const [, role, username, password] = match;
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
        }
    }
});

// Functions
function showLoginForm(role) {
    roleSelector.style.display = 'none';
    loginFormContainer.style.display = 'block';
    
    // Update form header based on role
    roleIcon.className = roleIcons[role];
    roleTitle.textContent = roleTitles[role];
    
    // Clear any previous error messages
    hideError();
    
    // Focus on username field
    document.getElementById('username').focus();
}

function showRoleSelector() {
    roleSelector.style.display = 'block';
    loginFormContainer.style.display = 'none';
    selectedRole = null;
    
    // Clear form
    loginForm.reset();
    hideError();
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    showLoading(true);
    hideError();
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Success - redirect to dashboard
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = data.redirectUrl;
            }, 1000);
        } else {
            // Error - show message
            showError(data.error || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please check your internet connection and try again.');
    } finally {
        showLoading(false);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.className = 'error-message';
}

function showSuccess(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.className = 'success-message';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showLoading(show) {
    if (show) {
        loadingSpinner.style.display = 'flex';
        loginForm.style.opacity = '0.5';
        loginForm.style.pointerEvents = 'none';
    } else {
        loadingSpinner.style.display = 'none';
        loginForm.style.opacity = '1';
        loginForm.style.pointerEvents = 'auto';
    }
}

// Add keyboard navigation for role selection
document.addEventListener('keydown', (e) => {
    if (roleSelector.style.display !== 'none') {
        const roles = ['student', 'teacher', 'hod', 'principal'];
        const currentIndex = selectedRole ? roles.indexOf(selectedRole) : -1;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % roles.length;
            highlightRole(roles[nextIndex]);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex <= 0 ? roles.length - 1 : currentIndex - 1;
            highlightRole(roles[prevIndex]);
        } else if (e.key === 'Enter' && selectedRole) {
            e.preventDefault();
            showLoginForm(selectedRole);
        }
    }
});

function highlightRole(role) {
    // Remove previous highlights
    roleButtons.forEach(btn => btn.classList.remove('highlighted'));
    
    // Add highlight to selected role
    const roleButton = document.querySelector(`[data-role="${role}"]`);
    if (roleButton) {
        roleButton.classList.add('highlighted');
        selectedRole = role;
    }
}

// Add visual feedback for demo credentials
document.addEventListener('DOMContentLoaded', () => {
    const credentialItems = document.querySelectorAll('.credential-item');
    credentialItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.title = 'Click to auto-fill credentials';
        
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.02)';
            item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
            item.style.boxShadow = 'none';
        });
    });
});

// Add smooth animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate role buttons on load
    roleButtons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            button.style.transition = 'all 0.3s ease';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add ripple effect to buttons
    roleButtons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

function createRipple(e) {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .role-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .highlighted {
        transform: translateY(-3px) !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        background: linear-gradient(145deg, #667eea, #764ba2) !important;
        color: white !important;
    }
    
    .highlighted i {
        color: white !important;
    }
`;
document.head.appendChild(style);