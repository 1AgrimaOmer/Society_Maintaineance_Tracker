const API_BASE = 'http://localhost:5000/api';

function showAlert(message, type = 'success') {
  const alertBox = document.getElementById('alertBox');
  const alertId = 'alert-' + Date.now();

  const alertHtml = `
    <div id="${alertId}" class="p-4 rounded-lg shadow-lg mb-3 animate-slide-in ${
    type === 'success'
      ? 'bg-green-100 border border-green-400 text-green-800'
      : 'bg-red-100 border border-red-400 text-red-800'
  }">
      ${message}
    </div>
  `;

  alertBox.insertAdjacentHTML('beforeend', alertHtml);

  setTimeout(() => {
    const element = document.getElementById(alertId);
    if (element) {
      element.remove();
    }
  }, 3000);
}

function toggleForms() {
  document.getElementById('loginForm').classList.toggle('hidden');
  document.getElementById('registerForm').classList.toggle('hidden');
}

// Register
document.getElementById('registerFormElement')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const role = document.getElementById('registerRole').value;

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('Registration successful! Redirecting...', 'success');

    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    }, 1500);
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

// Login
document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    }, 1500);
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Load user info on page load
function loadUser() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = document.getElementById('userName');

  if (userName) {
    userName.textContent = user.name || 'User';
  }

  // Only redirect to login if not authenticated AND on a protected page
  const currentPath = window.location.pathname;
  if (!localStorage.getItem('token') && currentPath !== '/' && currentPath !== '/index.html') {
    window.location.href = '/';
  }
}

window.addEventListener('load', loadUser);
