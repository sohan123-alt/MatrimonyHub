// ================================================
// COMMON JAVASCRIPT FUNCTIONS
// ================================================

/**
 * Show alert message
 */
function showAlert(message, type = 'info', container = null) {
    const alertContainer = container || document.getElementById('alerts-container') || document.body;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--spacing-md);">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; font-size: var(--font-size-lg);">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    alertContainer.insertBefore(alert, alertContainer.firstChild);

    // Close button
    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

/**
 * Initialize navbar
 */
function initNavbar() {
    const hamburger = document.getElementById('hamburger');
    const navbarNav = document.getElementById('navbar-nav');
    const userMenu = document.getElementById('user-menu');
    const authContainer = document.getElementById('auth-container');
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const logoutBtn = document.getElementById('logout-btn');

    if (hamburger && navbarNav) {
        hamburger.addEventListener('click', () => {
            navbarNav.classList.toggle('active');
        });

        // Close navbar when link is clicked
        document.querySelectorAll('.navbar-nav a').forEach(link => {
            link.addEventListener('click', () => {
                navbarNav.classList.remove('active');
            });
        });
    }

    if (userMenuToggle && dropdownMenu) {
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const result = await logoutUser();
            if (result.success) {
                window.location.href = 'index.html';
            }
        });
    }
}

/**
 * Update navbar with user info
 */
async function updateNavbarWithUser() {
    const user = await getCurrentUser();
    const authContainer = document.getElementById('auth-container');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (user) {
        const profile = await getUserProfile(user.id);
        if (profile.success && profile.data) {
            if (authContainer) authContainer.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (userName) userName.textContent = profile.data.full_name || user.email;
            if (userAvatar && profile.data.profile_image_url) {
                userAvatar.src = profile.data.profile_image_url;
            }
        }
    } else {
        if (authContainer) authContainer.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}

/**
 * Check authentication and redirect if needed
 */
async function checkAuthentication() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return user;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT'
    }).format(amount);
}

/**
 * Truncate text
 */
function truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

/**
 * Preview image before upload
 */
function previewImage(inputElement, previewElement) {
    const file = inputElement.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Create profile card HTML
 */
function createProfileCard(profile) {
    const profileImageUrl = profile.profile_image_url || 'https://via.placeholder.com/300?text=No+Image';
    const interests = profile.gallery_images ? profile.gallery_images.length : 0;

    return `
        <div class="card profile-card">
            <div class="profile-card-image">
                <img src="${profileImageUrl}" alt="${profile.full_name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                <div class="profile-card-overlay">
                    <div style="color: white;">
                        <p><strong>${profile.full_name}</strong></p>
                        <p>${profile.age} years, ${profile.profession || 'Professional'}</p>
                        <p>${profile.location || 'Bangladesh'}</p>
                    </div>
                </div>
            </div>
            <div class="profile-card-content">
                <div class="profile-card-name">${profile.full_name}</div>
                <div class="profile-card-info">
                    <div><i class="fas fa-birthday-cake"></i> ${profile.age} yrs</div>
                    <div><i class="fas fa-map-marker-alt"></i> ${profile.city || profile.location || 'N/A'}</div>
                </div>
                <div class="profile-card-info">
                    <div><i class="fas fa-briefcase"></i> ${profile.profession || 'Professional'}</div>
                    <div><i class="fas fa-pray"></i> ${profile.religion || 'Not specified'}</div>
                </div>
                <p style="font-size: var(--font-size-sm); color: var(--text-light);">${truncateText(profile.bio || 'No bio added yet', 80)}</p>
                <div class="profile-card-actions">
                    <a href="profile-detail.html?id=${profile.id}" class="btn btn-secondary" style="flex: 1;">
                        <i class="fas fa-eye"></i> View Profile
                    </a>
                    <button class="btn btn-primary" onclick="sendInterestClick('${profile.id}')" style="flex: 1;">
                        <i class="fas fa-heart"></i> Interest
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Send interest click handler
 */
async function sendInterestClick(receiverId) {
    const user = await getCurrentUser();
    if (!user) {
        showAlert('Please login to send interest', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    if (user.id === receiverId) {
        showAlert('You cannot send interest to yourself', 'warning');
        return;
    }

    const message = prompt('Add a message (optional):');

    showLoading('Sending interest...');
    const result = await sendInterest(user.id, receiverId, message || '');
    hideLoading();

    if (result.success) {
        showToast('Interest sent successfully!', 'success');
    } else {
        showAlert(result.error || 'Failed to send interest', 'danger');
    }
}

/**
 * Add to favorites
 */
async function addToFavoritesClick(favoriteUserId) {
    const user = await getCurrentUser();
    if (!user) {
        showAlert('Please login to add favorites', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    if (user.id === favoriteUserId) {
        showAlert('You cannot add yourself to favorites', 'warning');
        return;
    }

    showLoading('Adding to favorites...');
    const result = await addToFavorites(user.id, favoriteUserId);
    hideLoading();

    if (result.success) {
        showToast('Added to favorites!', 'success');
        // Update button appearance
        const btn = event.target.closest('button');
        if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-star"></i> Remove from Favorites';
        }
    } else {
        showAlert(result.error || 'Failed to add to favorites', 'danger');
    }
}

/**
 * Remove from favorites
 */
async function removeFromFavoritesClick(favoriteUserId) {
    const user = await getCurrentUser();
    if (!user) return;

    showLoading('Removing from favorites...');
    const result = await removeFromFavorites(user.id, favoriteUserId);
    hideLoading();

    if (result.success) {
        showToast('Removed from favorites!', 'success');
        const btn = event.target.closest('button');
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-star"></i> Add to Favorites';
        }
    } else {
        showAlert(result.error || 'Failed to remove from favorites', 'danger');
    }
}

/**
 * Initialize page
 */
function initPage() {
    initNavbar();
    updateNavbarWithUser();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

async function isUserAuthenticated() {

    try {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        return !!session;

    } catch (error) {

        console.error(error);

        return false;
    }
}
// Make Global
window.isUserAuthenticated = isUserAuthenticated;

async function loginUser(email, password) {

    try {

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {

            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true,
            data: data
        };

    } catch (err) {

        return {
            success: false,
            error: err.message
        };
    }
}

// Make Global
window.loginUser = loginUser;
