// ==================== SETTINGS PAGE FUNCTIONALITY ====================

let currentAdminUser = null;

// Initialize settings page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAdminProfile();
        setupSettingsNavigation();
        setupProfileForm();
        setupSecurityActions();
        setupNotificationPreferences();
        loadActivityLogs();
    } catch (error) {
        console.error('Settings page initialization error:', error);
        showToast('Error loading settings', 'error');
    }
});

// ==================== LOAD ADMIN PROFILE ====================

async function loadAdminProfile() {
    try {
        currentAdminUser = await getCurrentUser();

        if (!currentAdminUser) {
            showToast('Error loading admin profile', 'error');
            return;
        }

        const fullName = document.getElementById('fullName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const role = document.getElementById('role');
        const bio = document.getElementById('bio');

        if (fullName) fullName.value = currentAdminUser.user_metadata?.full_name || '';
        if (email) email.value = currentAdminUser.email || '';
        if (phone) phone.value = currentAdminUser.user_metadata?.phone || '';
        if (role) role.value = 'Super Admin';
        if (bio) bio.value = currentAdminUser.user_metadata?.bio || '';

        // Update admin name in top bar
        const adminName = document.getElementById('adminName');
        if (adminName) {
            adminName.textContent = currentAdminUser.user_metadata?.full_name || currentAdminUser.email?.split('@')[0];
        }
    } catch (error) {
        console.error('Error loading admin profile:', error);
        showToast('Error loading profile', 'error');
    }
}

// ==================== SETTINGS NAVIGATION ====================

function setupSettingsNavigation() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');

            // Remove active class from all items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked item and corresponding section
            item.classList.add('active');
            const section = document.getElementById(`${sectionId}Section`);
            if (section) section.classList.add('active');
        });
    });
}

// ==================== PROFILE FORM ====================

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            showLoading(profileForm);

            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const bio = document.getElementById('bio').value;

            // Update user profile
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone: phone,
                    bio: bio
                }
            });

            if (error) throw error;

            // Create admin log
            const ipAddress = await getClientIP();
            await createAdminLog(
                currentAdminUser.id,
                'PROFILE_UPDATED',
                currentAdminUser.id,
                'Admin updated profile',
                ipAddress
            );

            showToast('Profile updated successfully!', 'success');
            hideLoading(profileForm);
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Error updating profile', 'error');
            hideLoading(profileForm);
        }
    });

    // Avatar upload
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');

    if (uploadAvatarBtn && avatarInput) {
        uploadAvatarBtn.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                showLoading(uploadAvatarBtn);

                // Upload image
                const { path, url } = await uploadImage(file, 'admin-avatars');

                // Update user
                await supabase.auth.updateUser({
                    data: {
                        avatar_url: url
                    }
                });

                // Update preview
                const avatarPreview = document.getElementById('avatarPreview');
                if (avatarPreview) {
                    avatarPreview.src = url;
                }

                showToast('Avatar uploaded successfully!', 'success');
                hideLoading(uploadAvatarBtn);
            } catch (error) {
                console.error('Error uploading avatar:', error);
                showToast('Error uploading avatar', 'error');
                hideLoading(uploadAvatarBtn);
            }
        });
    }
}

// ==================== SECURITY ACTIONS ====================

function setupSecurityActions() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const enable2FABtn = document.getElementById('enable2FABtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            showModal('changePasswordModal');
        });
    }

    if (enable2FABtn) {
        enable2FABtn.addEventListener('click', () => {
            showToast('Two-Factor Authentication coming soon!', 'info');
        });
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            showConfirmModal(
                'Delete Account',
                'Are you sure you want to delete your admin account? This action cannot be undone.',
                async () => {
                    showToast('Account deletion initiated. You will be logged out.', 'warning');
                    setTimeout(() => logoutAdmin(), 2000);
                }
            );
        });
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                if (newPassword !== confirmPassword) {
                    showToast('Passwords do not match', 'error');
                    return;
                }

                if (newPassword.length < 6) {
                    showToast('Password must be at least 6 characters', 'error');
                    return;
                }

                showLoading(changePasswordForm);

                // Change password
                await changePassword(currentPassword, newPassword);

                // Create admin log
                const ipAddress = await getClientIP();
                await createAdminLog(
                    currentAdminUser.id,
                    'PASSWORD_CHANGED',
                    currentAdminUser.id,
                    'Admin changed password',
                    ipAddress
                );

                showToast('Password changed successfully!', 'success');
                hideModal('changePasswordModal');
                changePasswordForm.reset();
                hideLoading(changePasswordForm);
            } catch (error) {
                console.error('Error changing password:', error);
                showToast('Error changing password', 'error');
                hideLoading(changePasswordForm);
            }
        });
    }

    // Close password modal buttons
    const closePasswordBtn = document.getElementById('closePasswordBtn');
    const closePasswordModal = document.getElementById('closePasswordModal');

    if (closePasswordBtn) {
        closePasswordBtn.addEventListener('click', () => hideModal('changePasswordModal'));
    }
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', () => hideModal('changePasswordModal'));
    }
}

// ==================== NOTIFICATION PREFERENCES ====================

function setupNotificationPreferences() {
    const preferences = [
        'notifNewReports',
        'notifUserBlocked',
        'notifSystemAlerts',
        'notifDailySummary'
    ];

    preferences.forEach(prefId => {
        const checkbox = document.getElementById(prefId);
        if (checkbox) {
            // Load preference
            const saved = localStorage.getItem(prefId);
            if (saved !== null) {
                checkbox.checked = JSON.parse(saved);
            }

            // Save on change
            checkbox.addEventListener('change', () => {
                localStorage.setItem(prefId, JSON.stringify(checkbox.checked));
                showToast('Notification preference updated', 'success');
            });
        }
    });
}

// ==================== ACTIVITY LOGS ====================

async function loadActivityLogs() {
    try {
        const tbody = document.getElementById('activityLogsBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const logs = await fetchAdminLogs(20);

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding: 40px;">No activity logs found</td></tr>';
            return;
        }

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${log.action}</strong></td>
                <td>${log.details || 'N/A'}</td>
                <td>${formatDateTime(log.created_at)}</td>
                <td><code style="font-size: 0.75rem; color: var(--color-text-secondary);">${log.ip_address || 'Unknown'}</code></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading activity logs:', error);
    }
}

// ==================== STYLE ADJUSTMENTS ====================

const style = document.createElement('style');
style.textContent = `
    .text-center {
        text-align: center;
        color: var(--color-text-secondary);
    }
`;
document.head.appendChild(style);

// Reload logs periodically
setInterval(() => {
    loadActivityLogs();
}, 30 * 1000); // Every 30 seconds