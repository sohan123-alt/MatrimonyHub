// ================================================
// ADMIN - USERS MANAGEMENT
// ================================================

let currentPage = 0;
const pageSize = 10;
let totalUsers = 0;
let currentFilters = {};

/**
 * INITIALIZE USERS PAGE
 */
async function initUsersPage() {
    try {
        showLoading('Loading users...');

        const adminCheck = await checkAdminAccess();
        if (!adminCheck.success || !adminCheck.isAdmin) {
            window.location.href = '../profile/login.html';
            return;
        }

        const currentUser = await getCurrentUser();
        const profile = await getUserProfile(currentUser.id);
        if (profile.success) {
            document.getElementById('admin-name').textContent = profile.data.full_name || 'Admin';
        }

        setupEventListeners();
        await loadUsers();

        hideLoading();
    } catch (error) {
        hideLoading();
        showAlert('Error: ' + error.message, 'error');
    }
}

/**
 * LOAD USERS
 */
async function loadUsers() {
    try {
        showLoading('Loading users...');

        const result = await getAllUsers(currentPage, pageSize, currentFilters.search || '');

        hideLoading();

        if (result.success) {
            totalUsers = result.count || 0;
            displayUsers(result.data);
            updatePagination();
            document.getElementById('total-users').textContent = formatNumber(totalUsers);
        } else {
            showAlert('Failed to load users', 'error');
        }
    } catch (error) {
        hideLoading();
        showAlert('Error: ' + error.message, 'error');
    }
}

/**
 * DISPLAY USERS IN TABLE
 */
function displayUsers(users) {
    const tbody = document.getElementById('users-tbody');

    if (!users || users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 2rem; color: var(--text-muted);"></i>
                    <p style="margin-top: 10px;">No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.full_name}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.age || 'N/A'}</td>
            <td>${user.gender || 'N/A'}</td>
            <td>${user.religion || 'N/A'}</td>
            <td>
                <div style="display: flex; gap: 5px; align-items: center;">
                    ${user.is_verified ? '<span style="color: #10b981; font-weight: 500;">✓ Verified</span>' : '<span style="color: #f59e0b; font-weight: 500;">○ Pending</span>'}
                    ${user.is_blocked ? '<span style="color: #ef4444; font-weight: 500;">Blocked</span>' : ''}
                </div>
            </td>
            <td>${formatDate(user.created_at, 'short')}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewUserDetails('${user.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * VIEW USER DETAILS
 */
async function viewUserDetails(userId) {
    try {
        showLoading('Loading user details...');

        const result = await getUserDetails(userId);
        hideLoading();

        if (result.success) {
            const user = result.data.profile;
            const modal = document.getElementById('user-modal');
            const content = document.getElementById('user-details-content');

            content.innerHTML = `
                <div style="padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${user.profile_image_url || 'https://via.placeholder.com/100'}" 
                            alt="${user.full_name}" 
                            style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color);">
                        <h3 style="margin-top: 10px;">${user.full_name}</h3>
                        <p style="color: var(--text-muted);">${user.email}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Age</label>
                            <p>${user.age || 'N/A'}</p>
                        </div>
                        <div>
                            <label style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Gender</label>
                            <p>${user.gender || 'N/A'}</p>
                        </div>
                        <div>
                            <label style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Religion</label>
                            <p>${user.religion || 'N/A'}</p>
                        </div>
                        <div>
                            <label style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Profession</label>
                            <p>${user.profession || 'N/A'}</p>
                        </div>
                        <div>
                            <label style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Location</label>
                            <p>${user.location || 'N/A'}</p>
                        </div>
                        <div>
                            <label style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Joined</label>
                            <p>${formatDate(user.created_at, 'short')}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color);">
                        <label style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Bio</label>
                        <p>${user.bio || 'No bio provided'}</p>
                    </div>

                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <span class="stat-badge" style="background: ${user.is_verified ? '#10b981' : '#f59e0b'}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px;">
                            ${user.is_verified ? '✓ Verified' : '○ Not Verified'}
                        </span>
                        <span class="stat-badge" style="background: ${user.is_premium ? '#8b5cf6' : '#6b7280'}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px;">
                            ${user.is_premium ? '★ Premium' : 'Free'}
                        </span>
                        <span class="stat-badge" style="background: ${user.is_blocked ? '#ef4444' : '#10b981'}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px;">
                            ${user.is_blocked ? '✕ Blocked' : 'Active'}
                        </span>
                    </div>

                    ${result.data.galleryImages && result.data.galleryImages.length > 0 ? `
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                            <h4>Gallery Images (${result.data.galleryImages.length})</h4>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                                ${result.data.galleryImages.slice(0, 6).map(img => `
                                    <img src="${img.image_url}" alt="Gallery" 
                                        style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; cursor: pointer;"
                                        onclick="window.open('${img.image_url}')">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;

            // Setup action button
            const actionBtn = document.getElementById('action-btn');
            actionBtn.innerHTML = user.is_blocked ?
                '<i class="fas fa-unlock"></i> Unblock User' :
                '<i class="fas fa-ban"></i> Block User';
            actionBtn.onclick = () => toggleBlockUser(userId, user.is_blocked);

            modal.style.display = 'flex';
        }
    } catch (error) {
        hideLoading();
        showAlert('Error loading user details: ' + error.message, 'error');
    }
}

/**
 * TOGGLE BLOCK USER
 */
async function toggleBlockUser(userId, isCurrentlyBlocked) {
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    showLoading(`${action === 'block' ? 'Blocking' : 'Unblocking'} user...`);

    const result = isCurrentlyBlocked ?
        await unblockUser(userId) :
        await blockUser(userId, 'Blocked by admin');

    hideLoading();

    if (result.success) {
        showToast(`User ${action}ed successfully`, 'success');
        closeUserModal();
        await loadUsers();
    } else {
        showAlert('Failed to ' + action + ' user: ' + result.error, 'error');
    }
}

/**
 * CLOSE USER MODAL
 */
function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

/**
 * APPLY FILTERS
 */
async function applyFilters() {
    currentPage = 0;
    currentFilters = {
        search: document.getElementById('search-input').value,
        gender: document.getElementById('filter-gender').value,
        religion: document.getElementById('filter-religion').value,
        status: document.getElementById('filter-status').value,
        minAge: parseInt(document.getElementById('filter-age-min').value) || null,
        maxAge: parseInt(document.getElementById('filter-age-max').value) || null
    };

    await loadUsers();
}

/**
 * RESET FILTERS
 */
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-gender').value = '';
    document.getElementById('filter-religion').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-age-min').value = '';
    document.getElementById('filter-age-max').value = '';

    currentPage = 0;
    currentFilters = {};
    loadUsers();
}

/**
 * UPDATE PAGINATION
 */
function updatePagination() {
    const totalPages = Math.ceil(totalUsers / pageSize);
    document.getElementById('page-info').textContent = `Page ${currentPage + 1} of ${totalPages}`;

    document.getElementById('prev-btn').style.display = currentPage > 0 ? 'block' : 'none';
    document.getElementById('next-btn').style.display = currentPage < totalPages - 1 ? 'block' : 'none';
}

/**
 * PREVIOUS PAGE
 */
async function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        await loadUsers();
        window.scrollTo(0, 0);
    }
}

/**
 * NEXT PAGE
 */
async function nextPage() {
    const totalPages = Math.ceil(totalUsers / pageSize);
    if (currentPage < totalPages - 1) {
        currentPage++;
        await loadUsers();
        window.scrollTo(0, 0);
    }
}

/**
 * EXPORT USERS
 */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('export-btn').addEventListener('click', async () => {
        showLoading('Exporting users...');
        const result = await exportUsersToCSV();
        hideLoading();

        if (result.success) {
            showToast('Users exported successfully', 'success');
        } else {
            showAlert('Export failed: ' + result.error, 'error');
        }
    });
});

/**
 * SETUP EVENT LISTENERS
 */
function setupEventListeners() {
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    });

    document.getElementById('sidebar-toggle-mobile').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('active');
    });

    document.getElementById('logout-btn').addEventListener('click', logoutAdmin);

    document.getElementById('profile-toggle').addEventListener('click', () => {
        document.getElementById('profile-menu').classList.toggle('active');
    });

    // Search debounce
    const searchInput = document.getElementById('search-input');
    const debouncedSearch = debounce(() => applyFilters(), 500);
    searchInput.addEventListener('input', debouncedSearch);

    // Filter buttons
    document.getElementById('filter-gender').addEventListener('change', () => applyFilters());
    document.getElementById('filter-religion').addEventListener('change', () => applyFilters());
    document.getElementById('filter-status').addEventListener('change', () => applyFilters());

    // Close modal
    document.getElementById('user-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeUserModal();
    });
}

/**
 * LOGOUT ADMIN
 */
async function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        showLoading('Logging out...');
        const result = await signOutUser();
        hideLoading();

        if (result.success) {
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', initUsersPage);
