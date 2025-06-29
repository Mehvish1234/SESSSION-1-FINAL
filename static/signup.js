// Toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.nextElementSibling.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.remove('fa-eye');
        toggleButton.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('fa-eye-slash');
        toggleButton.classList.add('fa-eye');
    }
}

// Check password strength
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    if (!strengthIndicator) return;  // Add null check

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    let strength = 0;
    strength += hasUpperCase ? 1 : 0;
    strength += hasLowerCase ? 1 : 0;
    strength += hasNumbers ? 1 : 0;
    strength += hasSpecialChar ? 1 : 0;
    strength += isLongEnough ? 1 : 0;

    strengthIndicator.className = 'password-strength';
    
    if (password.length === 0) {
        strengthIndicator.textContent = '';
    } else if (strength < 3) {
        strengthIndicator.textContent = 'Weak password';
        strengthIndicator.classList.add('weak');
    } else if (strength < 4) {
        strengthIndicator.textContent = 'Medium strength password';
        strengthIndicator.classList.add('medium');
    } else {
        strengthIndicator.textContent = 'Strong password';
        strengthIndicator.classList.add('strong');
    }
}

// Check if passwords match
function checkPasswordMatch() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const matchIndicator = document.getElementById('passwordMatch');
    
    if (!password || !confirmPassword || !matchIndicator) return;  // Add null check

    matchIndicator.className = 'password-match';
    
    if (confirmPassword.value.length === 0) {
        matchIndicator.textContent = '';
    } else if (password.value === confirmPassword.value) {
        matchIndicator.textContent = 'Passwords match';
        matchIndicator.classList.add('match');
    } else {
        matchIndicator.textContent = 'Passwords do not match';
        matchIndicator.classList.add('mismatch');
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupForm = document.getElementById('signupForm');

    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
            checkPasswordMatch();
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('full_name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            const confirmPassword = document.getElementById('confirmPassword')?.value || '';
            const terms = document.querySelector('input[name="terms"]')?.checked || false;

            // Validate form
            if (!fullName || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            // Validate passwords match
            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }

            // Validate terms
            if (!terms) {
                showNotification('Please accept the terms and conditions', 'error');
                return;
            }

            // Submit the form
            signupForm.submit();
        });
    }
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const backgroundColor = type === 'error' ? '#dc2626' : '#2563eb';
    
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: backgroundColor,
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transform: 'translateY(100%)',
        transition: 'transform 0.3s ease',
        zIndex: '1000'
    });

    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateY(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
} 