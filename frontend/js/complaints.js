const API_BASE = 'http://localhost:5000/api';
let currentComplaintId = null;
let allComplaints = [];

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function showAlert(message, type = 'success') {
  const alertBox = document.getElementById('alertBox');
  const alertId = 'alert-' + Date.now();

  const alertHtml = `
    <div id="${alertId}" class="p-4 rounded-lg shadow-lg mb-3 ${
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

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

function loadUser() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('userName').textContent = user.name || 'User';

  if (!localStorage.getItem('token')) {
    window.location.href = '/';
  }
}

// Load notices on page load
async function loadNotices() {
  try {
    const response = await fetch(`${API_BASE}/notices`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!data.success || !data.notices.length) {
      return;
    }

    const noticesSection = document.getElementById('noticesSection');
    const importantNotices = data.notices.filter((n) => n.important);

    if (importantNotices.length > 0) {
      const noticesHtml = importantNotices
        .map(
          (notice) => `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-yellow-800">${notice.title}</p>
              <p class="text-sm text-yellow-700 mt-1">${notice.message}</p>
            </div>
          </div>
        </div>
      `
        )
        .join('');

      noticesSection.innerHTML = noticesHtml;
    }
  } catch (error) {
    console.error('Error loading notices:', error);
  }
}

// Complaint Form
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('complaintTitle').value;
  const description = document.getElementById('complaintDescription').value;
  const category = document.getElementById('complaintCategory').value;
  const image = document.getElementById('complaintImage').files[0];

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    const response = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create complaint');
    }

    showAlert('Complaint submitted successfully!', 'success');
    document.getElementById('complaintForm').reset();
    loadComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

// Load complaints
async function loadComplaints() {
  try {
    const response = await fetch(`${API_BASE}/complaints`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    allComplaints = data.complaints;
    renderComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function renderComplaints() {
  const complaintsList = document.getElementById('complaintsList');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (allComplaints.length === 0) {
    complaintsList.innerHTML = '<p class="text-gray-600">No complaints yet.</p>';
    return;
  }

  const complaintsHtml = allComplaints
    .map(
      (complaint) => {
        const isOwner = currentUser.id === complaint.createdBy._id;
        const canWithdraw = isOwner && complaint.status !== 'Resolved';
        
        return `
    <div class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <div class="flex justify-between items-start">
        <div class="flex-1 cursor-pointer" onclick="viewComplaint('${complaint._id}')">
          <h4 class="font-semibold text-gray-800">${complaint.title}</h4>
          <p class="text-sm text-gray-600 mt-1">Category: ${complaint.category}</p>
          <div class="flex items-center space-x-2 mt-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
              complaint.status === 'Open'
                ? 'bg-orange-100 text-orange-800'
                : complaint.status === 'In Progress'
                ? 'bg-yellow-100 text-yellow-800'
                : complaint.status === 'Resolved'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }">
              ${complaint.status}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
              complaint.priority === 'Low'
                ? 'bg-blue-100 text-blue-800'
                : complaint.priority === 'Medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }">
              ${complaint.priority}
            </span>
            ${complaint.isOverdue ? '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">OVERDUE</span>' : ''}
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <p class="text-xs text-gray-500">${new Date(complaint.createdAt).toLocaleDateString()}</p>
          ${canWithdraw ? `<button class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition" onclick="event.stopPropagation(); withdrawComplaintFromList('${complaint._id}')">Delete</button>` : ''}
        </div>
      </div>
    </div>
  `;
      }
    )
    .join('');

  complaintsList.innerHTML = complaintsHtml;
}

function viewComplaint(complaintId) {
  const complaint = allComplaints.find((c) => c._id === complaintId);
  if (!complaint) return;

  const modal = document.getElementById('complaintModal');
  document.getElementById('modalTitle').textContent = complaint.title;

  let historyHtml = '';
  if (complaint.history && complaint.history.length > 0) {
    historyHtml = `
      <div>
        <h4 class="font-semibold text-gray-800 mb-2">Status History</h4>
        <div class="space-y-2">
          ${complaint.history
            .reverse()
            .map(
              (h) => `
            <div class="text-sm bg-gray-50 p-2 rounded border-l-4 border-blue-400">
              <p class="font-semibold text-gray-700">${h.status}</p>
              <p class="text-gray-600">${new Date(h.timestamp).toLocaleString()}</p>
              ${h.note ? `<p class="text-gray-600">Note: ${h.note}</p>` : ''}
              <p class="text-xs text-gray-500">Updated by: ${h.updatedBy.name}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  let imageHtml = '';
  if (complaint.image) {
    imageHtml = `
      <div>
        <h4 class="font-semibold text-gray-800 mb-2">Attached Image</h4>
        <img src="http://localhost:5000${complaint.image}" alt="Complaint" class="max-w-full rounded">
      </div>
    `;
  }

  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <div class="space-y-4">
      <div>
        <p class="text-sm text-gray-600">Description</p>
        <p class="text-gray-800 mt-1">${complaint.description}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-600">Category</p>
          <p class="font-semibold text-gray-800">${complaint.category}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Status</p>
          <p class="font-semibold text-gray-800">${complaint.status}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Priority</p>
          <p class="font-semibold text-gray-800">${complaint.priority}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Created</p>
          <p class="font-semibold text-gray-800">${new Date(complaint.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      ${imageHtml}
      ${historyHtml}
    </div>
  `;

  // Store current complaint ID for actions
  currentComplaintId = complaint._id;
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Add delete button if user is the owner and complaint is not resolved
  if (currentUser.id === complaint.createdBy._id && complaint.status !== 'Resolved') {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded';
    deleteBtn.textContent = 'Delete Complaint';
    deleteBtn.onclick = withdrawComplaint;
    modalContent.appendChild(deleteBtn);
  }

  modal.classList.remove('hidden');
}

// Delete complaint
async function withdrawComplaint() {
  if (!confirm('Are you sure you want to delete this complaint? This cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/complaints/${currentComplaintId}/withdraw`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete complaint');
    }

    showAlert('Complaint deleted successfully', 'success');
    closeModal();
    loadComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Delete complaint from list
async function withdrawComplaintFromList(complaintId) {
  if (!confirm('Are you sure you want to delete this complaint? This cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/complaints/${complaintId}/withdraw`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete complaint');
    }

    showAlert('Complaint deleted successfully', 'success');
    loadComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function closeModal() {
  document.getElementById('complaintModal').classList.add('hidden');
}

function switchTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach((el) => {
    el.classList.add('hidden');
  });

  // Remove active class from buttons
  document.querySelectorAll('.tab-btn').forEach((el) => {
    el.classList.remove('border-blue-600', 'text-blue-600');
    el.classList.add('border-transparent', 'text-gray-600');
  });

  // Show selected tab
  document.getElementById(tab + 'Tab').classList.remove('hidden');

  // Add active class to button
  event.target.classList.remove('border-transparent', 'text-gray-600');
  event.target.classList.add('border-blue-600', 'text-blue-600');

  if (tab === 'notices') {
    loadNoticesTab();
  }
}

async function loadNoticesTab() {
  try {
    const response = await fetch(`${API_BASE}/notices`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    const noticesList = document.getElementById('noticesList');

    if (data.notices.length === 0) {
      noticesList.innerHTML = '<p class="text-gray-600">No notices yet.</p>';
      return;
    }

    const noticesHtml = data.notices
      .map(
        (notice) => `
      <div class="bg-white rounded-lg shadow p-4 ${notice.important ? 'border-l-4 border-yellow-400' : ''}">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-semibold text-gray-800">${notice.title}</h4>
            <p class="text-gray-600 mt-2">${notice.message}</p>
            <p class="text-xs text-gray-500 mt-2">Posted on ${new Date(notice.createdAt).toLocaleDateString()}</p>
          </div>
          ${notice.important ? '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Important</span>' : ''}
        </div>
      </div>
    `
      )
      .join('');

    noticesList.innerHTML = noticesHtml;
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Initialize on page load
window.addEventListener('load', () => {
  loadUser();
  loadComplaints();
  loadNotices();
});
