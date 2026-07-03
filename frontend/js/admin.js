const API_BASE = 'http://localhost:5000/api';
let allComplaints = [];
let dashboard = null;

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

// Load Dashboard Data
async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    dashboard = data.dashboard;

    // Update stats
    document.getElementById('totalComplaints').textContent = dashboard.totalComplaints;
    document.getElementById('openComplaints').textContent = dashboard.statusCounts.open;
    document.getElementById('inProgressComplaints').textContent = dashboard.statusCounts.inProgress;
    document.getElementById('resolvedComplaints').textContent = dashboard.statusCounts.resolved;
    document.getElementById('overdueComplaints').textContent = dashboard.overdueComplaints;

    // Recent Complaints
    const recentComplaints = document.getElementById('recentComplaints');
    recentComplaints.innerHTML = dashboard.recentComplaints
      .map(
        (complaint) => `
      <div class="p-3 bg-gray-50 rounded border-l-4 border-blue-400">
        <p class="font-semibold text-gray-800">${complaint.title}</p>
        <div class="flex justify-between items-center mt-1">
          <span class="text-xs px-2 py-1 rounded ${
            complaint.status === 'Open'
              ? 'bg-orange-100 text-orange-800'
              : complaint.status === 'In Progress'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }">
            ${complaint.status}
          </span>
          <span class="text-xs text-gray-500">${new Date(complaint.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `
      )
      .join('');

    // Top Residents
    const topResidents = document.getElementById('topResidents');
    topResidents.innerHTML = dashboard.complaintsByResident
      .map(
        (resident) => `
      <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
        <span class="text-gray-800 font-semibold">${resident.userName}</span>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">${resident.count} complaints</span>
      </div>
    `
      )
      .join('');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Load Complaints
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
    renderComplaintsTable();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function renderComplaintsTable() {
  const tbody = document.getElementById('complaintsTableBody');

  if (allComplaints.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-600">No complaints found</td></tr>';
    return;
  }

  tbody.innerHTML = allComplaints
    .map(
      (complaint) => `
    <tr class="hover:bg-gray-50 cursor-pointer" onclick="openUpdateModal('${complaint._id}')">
      <td class="px-6 py-4 text-sm text-gray-800">${complaint.title}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${complaint.category}</td>
      <td class="px-6 py-4 text-sm">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${
          complaint.status === 'Open'
            ? 'bg-orange-100 text-orange-800'
            : complaint.status === 'In Progress'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }">
          ${complaint.status}
        </span>
      </td>
      <td class="px-6 py-4 text-sm">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${
          complaint.priority === 'Low'
            ? 'bg-blue-100 text-blue-800'
            : complaint.priority === 'Medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }">
          ${complaint.priority}
        </span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-800">${complaint.createdBy.name}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${new Date(complaint.createdAt).toLocaleDateString()}</td>
      <td class="px-6 py-4 text-sm">
        <button class="text-blue-600 hover:text-blue-800 font-semibold" onclick="openUpdateModal('${complaint._id}'); event.stopPropagation();">
          Edit
        </button>
      </td>
    </tr>
  `
    )
    .join('');
}

async function filterComplaints() {
  const status = document.getElementById('filterStatus').value;
  const category = document.getElementById('filterCategory').value;
  const priority = document.getElementById('filterPriority').value;
  const overdue = document.getElementById('filterOverdue').checked;

  try {
    let url = `${API_BASE}/complaints?`;
    if (status) url += `status=${status}&`;
    if (category) url += `category=${category}&`;
    if (priority) url += `priority=${priority}&`;
    if (overdue) url += `overdue=true&`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    allComplaints = data.complaints;
    renderComplaintsTable();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function openUpdateModal(complaintId) {
  const complaint = allComplaints.find((c) => c._id === complaintId);
  if (!complaint) return;

  const modal = document.getElementById('updateComplaintModal');
  const formContent = document.getElementById('updateFormContent');

  let historyHtml = '';
  if (complaint.history && complaint.history.length > 0) {
    historyHtml = `
      <div class="border-t pt-4">
        <h4 class="font-semibold text-gray-800 mb-3">Status History</h4>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          ${complaint.history
            .reverse()
            .map(
              (h) => `
            <div class="text-sm bg-gray-50 p-2 rounded border-l-4 border-blue-400">
              <p class="font-semibold text-gray-700">${h.status}</p>
              <p class="text-gray-600 text-xs">${new Date(h.timestamp).toLocaleString()}</p>
              ${h.note ? `<p class="text-gray-600 text-xs">Note: ${h.note}</p>` : ''}
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
      <div class="border-t pt-4">
        <h4 class="font-semibold text-gray-800 mb-2">Attached Image</h4>
        <img src="http://localhost:5000${complaint.image}" alt="Complaint" class="max-w-xs rounded">
      </div>
    `;
  }

  formContent.innerHTML = `
    <form id="updateForm" class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-800">${complaint.title}</h3>
        <p class="text-gray-600 text-sm mt-1">${complaint.description}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 font-semibold mb-2">Status</label>
          <select
            id="updateStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Open" ${complaint.status === 'Open' ? 'selected' : ''}>Open</option>
            <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-700 font-semibold mb-2">Priority</label>
          <select
            id="updatePriority"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low" ${complaint.priority === 'Low' ? 'selected' : ''}>Low</option>
            <option value="Medium" ${complaint.priority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="High" ${complaint.priority === 'High' ? 'selected' : ''}>High</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-gray-700 font-semibold mb-2">Update Note</label>
        <textarea
          id="updateNote"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a note about the update"
        ></textarea>
      </div>

      <div class="flex items-center">
        <input
          type="checkbox"
          id="updateOverdue"
          ${complaint.isOverdue ? 'checked' : ''}
          class="w-4 h-4 text-blue-600 rounded"
        />
        <label for="updateOverdue" class="ml-2 text-gray-700 font-semibold">
          Mark as Overdue
        </label>
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        onclick="updateComplaint('${complaintId}'); event.preventDefault();"
      >
        Update Complaint
      </button>
    </form>

    ${imageHtml}
    ${historyHtml}
  `;

  modal.classList.remove('hidden');
}

function closeUpdateModal() {
  document.getElementById('updateComplaintModal').classList.add('hidden');
}

async function updateComplaint(complaintId) {
  const status = document.getElementById('updateStatus').value;
  const priority = document.getElementById('updatePriority').value;
  const note = document.getElementById('updateNote').value;
  const isOverdue = document.getElementById('updateOverdue').checked;

  try {
    const response = await fetch(`${API_BASE}/complaints/${complaintId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status,
        priority,
        note,
        isOverdue,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update complaint');
    }

    showAlert('Complaint updated successfully!', 'success');
    closeUpdateModal();
    loadComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Notice Form
document.getElementById('noticeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('noticeTitle').value;
  const message = document.getElementById('noticeMessage').value;
  const important = document.getElementById('noticeImportant').checked;

  try {
    const response = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, message, important }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create notice');
    }

    showAlert('Notice created successfully!', 'success');
    document.getElementById('noticeForm').reset();
    loadNotices();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

// Load Notices
async function loadNotices() {
  try {
    const response = await fetch(`${API_BASE}/notices`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    const noticesList = document.getElementById('noticesList');

    if (!data.notices || data.notices.length === 0) {
      noticesList.innerHTML = '<p class="text-gray-600">No notices yet.</p>';
      return;
    }

    const noticesHtml = data.notices
      .map(
        (notice) => `
      <div class="bg-white rounded-lg shadow p-4 ${notice.important ? 'border-l-4 border-yellow-400' : ''}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800">${notice.title}</h4>
            <p class="text-gray-600 mt-2">${notice.message}</p>
            <p class="text-xs text-gray-500 mt-2">By ${notice.createdBy.name} on ${new Date(notice.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="flex items-center space-x-2">
            ${notice.important ? '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Important</span>' : ''}
            <button
              onclick="deleteNotice('${notice._id}')"
              class="text-red-600 hover:text-red-800 font-semibold text-sm"
            >
              Delete
            </button>
          </div>
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

async function deleteNotice(noticeId) {
  if (!confirm('Are you sure you want to delete this notice?')) return;

  try {
    const response = await fetch(`${API_BASE}/notices/${noticeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete notice');
    }

    showAlert('Notice deleted successfully!', 'success');
    loadNotices();
  } catch (error) {
    showAlert(error.message, 'error');
  }
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

  if (tab === 'complaints') {
    loadComplaints();
  } else if (tab === 'notices') {
    loadNotices();
  }
}

// Initialize on page load
window.addEventListener('load', () => {
  loadUser();
  loadDashboard();
  loadComplaints();
  loadNotices();
});
