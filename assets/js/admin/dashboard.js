// ================================================
// ADMIN DASHBOARD - MAIN FUNCTIONALITY
// ================================================

let growthChart = null;
let genderChart = null;
let currentUser = null;

/**
 * INITIALIZE DASHBOARD
 */
async function initDashboard() {
    try {
        showLoading('Loading dashboard...');

        // Check admin access
        const adminCheck = await checkAdminAccess();
        if (!adminCheck.success || !adminCheck.isAdmin) {
            window.location.href = '../profile/login.html';
            return;
        }

        currentUser = await getCurrentUser();
        if (!currentUser) {
            window.location.href = '../profile/login.html';
            return;
        }

        // Set admin name
        const profile = await getUserProfile(currentUser.id);
        if (profile.success) {
            document.getElementById('admin-name').textContent = profile.data.full_name || 'Admin';
            document.getElementById('welcome-name').textContent = profile.data.full_name || 'Admin';
        }

        // Load dashboard data
        await loadStatistics();
        await loadGrowthChart();
        await loadGenderChart();
        await loadRecentActivities();
        setCurrentDate();

        // Setup event listeners
        setupEventListeners();

        hideLoading();
    } catch (error) {
        hideLoading();
        showAlert('Error loading dashboard: ' + error.message, 'error');
    }
}

/**
 * LOAD STATISTICS
 */
async function loadStatistics() {
    try {
        const result = await getDashboardStats();

        if (result.success) {
            const stats = result.stats;

            // Update stat cards
            document.getElementById('stat-total-users').textContent = formatNumber(stats.totalUsers);
            document.getElementById('stat-verified').textContent = formatNumber(stats.verifiedProfiles);
            document.getElementById('stat-pending').textContent = formatNumber(
                stats.totalUsers - stats.verifiedProfiles
            );
            document.getElementById('stat-blocked').textContent = formatNumber(stats.blockedUsers);
            document.getElementById('stat-interests').textContent = formatNumber(stats.totalInterests);

            // Count total images
            const imagesResult = await getAllImages(0, 1000);
            const totalImages = imagesResult.count || 0;
            document.getElementById('stat-images').textContent = formatNumber(totalImages);
        }
    } catch (error) {
        console.error('Load statistics error:', error);
        showAlert('Failed to load statistics', 'error');
    }
}

/**
 * LOAD GROWTH CHART
 */
async function loadGrowthChart() {
    try {
        const period = document.getElementById('growth-period').value || 'month';
        const result = await getUserGrowth(period);

        if (result.success) {
            const data = result.data;
            const labels = Object.keys(data).slice(-10); // Last 10 periods
            const values = labels.map(label => data[label]);

            const ctx = document.getElementById('growth-chart').getContext('2d');

            if (growthChart) {
                growthChart.destroy();
            }

            growthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'New Users',
                        data: values,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#d1d5db'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(55, 65, 81, 0.2)'
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Load growth chart error:', error);
    }
}

/**
 * UPDATE GROWTH CHART
 */
async function updateGrowthChart() {
    await loadGrowthChart();
}

/**
 * LOAD GENDER CHART
 */
async function loadGenderChart() {
    try {
        const result = await getGenderDistribution();

        if (result.success) {
            const data = result.data;

            const ctx = document.getElementById('gender-chart').getContext('2d');

            if (genderChart) {
                genderChart.destroy();
            }

            genderChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data),
                        backgroundColor: [
                            '#3b82f6',
                            '#ec4899',
                            '#8b5cf6'
                        ],
                        borderColor: '#1f2937',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#d1d5db',
                                padding: 20,
                                font: {
                                    size: 14
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Load gender chart error:', error);
    }
}

/**
 * LOAD RECENT ACTIVITIES
 */
async function loadRecentActivities() {
    try {
        const result = await getRecentActivities(10);

        if (result.success && result.data.length > 0) {
            const tbody = document.getElementById('activities-tbody');
            tbody.innerHTML = result.data.map(activity => `
                <tr>
                    <td>
                        <span style="color: #10b981; font-weight: 500;">
                            ${activity.action}
                        </span>
                    </td>
                    <td>${activity.admin_id?.substring(0, 8) || 'System'}</td>
                    <td>${activity.affected_user_id?.substring(0, 8) || '-'}</td>
                    <td>${formatDate(activity.created_at, 'time')}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Load activities error:', error);
    }
}

/**
 * SET CURRENT DATE
 */
function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = today;
}

/**
 * SETUP EVENT LISTENERS
 */
function setupEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    });

    document.getElementById('sidebar-toggle-mobile').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('active');
    });

    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('active');
    });

    // Notification toggle
    document.getElementById('notification-toggle').addEventListener('click', () => {
        document.getElementById('notification-dropdown').classList.toggle('active');
    });

    // Profile toggle
    document.getElementById('profile-toggle').addEventListener('click', () => {
        document.getElementById('profile-menu').classList.toggle('active');
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logoutAdmin);

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-container')) {
            document.getElementById('notification-dropdown').classList.remove('active');
        }
        if (!e.target.closest('.profile-dropdown')) {
            document.getElementById('profile-menu').classList.remove('active');
        }
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
        } else {
            showAlert('Logout failed: ' + result.error, 'error');
        }
    }
}

/**
 * CLEAR NOTIFICATIONS
 */
function clearNotifications() {
    document.getElementById('notifications-list').innerHTML = '';
    document.getElementById('notification-count').textContent = '0';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);

// Refresh data every 30 seconds
setInterval(() => {
    loadStatistics();
    loadRecentActivities();
}, 30000);
