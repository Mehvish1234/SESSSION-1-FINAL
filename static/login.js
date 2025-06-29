// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password i');
    
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

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;

    // First try API login
    try {
        console.log('Attempting API login...');
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, remember }),
            credentials: 'include'
        });

        const data = await response.json();
        console.log('API login response:', data);
        
        if (response.ok && data.success) {
            showNotification(data.message || 'Login successful!');
            // Store user data in localStorage if remember is checked
            if (remember) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            
            // Check session before redirect
            const sessionCheck = await fetch('/test-session', { credentials: 'include' });
            const sessionData = await sessionCheck.json();
            console.log('Session data after login:', sessionData);
            
            // Add a small delay to ensure session is set
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            return;
        } else {
            console.log('API login failed, trying form submission...');
        }
    } catch (error) {
        console.error('API Login error:', error);
        console.log('API login failed, trying form submission...');
    }
    
    // Fallback to regular form submission
    try {
        console.log('Attempting form-based login...');
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (remember) formData.append('remember', 'on');

        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.redirected) {
            console.log('Form login successful, redirecting...');
            window.location.href = response.url;
        } else {
            const text = await response.text();
            if (text.includes('Invalid email or password')) {
                showNotification('Invalid email or password', 'error');
            } else {
                showNotification('Login failed', 'error');
            }
        }
    } catch (error) {
        console.error('Form login error:', error);
        showNotification('An error occurred while logging in', 'error');
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