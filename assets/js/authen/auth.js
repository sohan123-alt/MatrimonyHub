// ==================== AUTHENTICATION & SESSION MANAGEMENT ====================

// Check if user is authenticated
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session) {
            // Redirect to login if not authenticated
            window.location.href = '../profile/login.html';
            return false;
        }

        // Check if user is admin (you can modify this based on your role system)
        const adminRole = localStorage.getItem('adminRole');
        if (!adminRole) {
            window.location.href = '../profile/login.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Authentication check error:', error);
        window.location.href = '../profile/login.html';
        return false;
    }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        initializeApp();
        setupLogoutButtons();
        setupThemeToggle();
        setupSidebar();
        setupNavigation();
        feather.replace();
    }
});

// ==================== LOGIN FUNCTION ====================

async function loginAdmin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Store admin role
        localStorage.setItem('adminRole', 'admin');
        localStorage.setItem('adminEmail', email);

        // Create admin log
        if (data.user) {
            const ipAddress = await getClientIP();
            await createAdminLog(
                data.user.id,
                'LOGIN',
                data.user.id,
                'Admin logged in',
                ipAddress
            );
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// ==================== LOGOUT FUNCTION ====================

async function logoutAdmin() {
    try {
        // Get current user for logging
        const user = await getCurrentUser();

        // Create logout log
        if (user) {
            const ipAddress = await getClientIP();
            await createAdminLog(
                user.id,
                'LOGOUT',
                user.id,
                'Admin logged out',
                ipAddress
            );
        }

        // Sign out
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        // Clear local storage
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('theme');

        // Redirect to login
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
    }
}

// ==================== SETUP LOGOUT BUTTONS ====================

function setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll('#logoutBtn, #logoutBtnDropdown');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', logoutAdmin);
    });
}

// ==================== THEME TOGGLE ====================

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');

    if (!themeToggle) return;

    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = '<i data-feather="sun"></i>';
            feather.replace();
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = '<i data-feather="moon"></i>';
            feather.replace();
        }
    }
}

// ==================== SIDEBAR TOGGLE ====================

function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        sidebar?.classList.toggle('active');
        sidebarOverlay?.classList.toggle('active');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (sidebarToggleMobile) {
        sidebarToggleMobile.addEventListener('click', toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking on nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                toggleSidebar();
            }
        });
    });
}

// ==================== NAVIGATION ====================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPage = getCurrentPage();

    navItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update breadcrumb
    const breadcrumbText = document.getElementById('breadcrumbText');
    if (breadcrumbText) {
        const pageName = {
            'dashboard': 'Dashboard',
            'users': 'User Management',
            'interests': 'Interest Management',
            'reports': 'Reports Management',
            'images': 'Image Management',
            'analytics': 'Analytics',
            'settings': 'Settings'
        };
        breadcrumbText.textContent = pageName[currentPage] || 'Dashboard';
    }
}

function getCurrentPage() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    return filename.replace('.html', '') || 'dashboard';
}

// ==================== DROPDOWNS ====================

document.addEventListener('click', (e) => {
    // Notification dropdown
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBtn && notificationDropdown) {
        if (e.target.closest('#notificationBtn')) {
            notificationDropdown.classList.toggle('active');
        } else if (!e.target.closest('.notification-dropdown')) {
            notificationDropdown.classList.remove('active');
        }
    }

    // Profile dropdown
    const profileToggle = document.getElementById('profileToggle');
    const profileMenu = document.getElementById('profileMenu');

    if (profileToggle && profileMenu) {
        if (e.target.closest('#profileToggle')) {
            profileMenu.classList.toggle('active');
        } else if (!e.target.closest('.profile-dropdown')) {
            profileMenu.classList.remove('active');
        }
    }
});

// ==================== ADMIN INFO ====================

async function loadAdminInfo() {
    try {
        const user = await getCurrentUser();

        if (user) {
            // Update admin name
            const adminName = document.getElementById('adminName');
            const welcomeName = document.getElementById('welcomeName');

            const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';

            if (adminName) adminName.textContent = displayName;
            if (welcomeName) welcomeName.textContent = displayName;

            // Update current date
            const currentDate = document.getElementById('currentDate');
            if (currentDate) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const today = new Date().toLocaleDateString('en-US', options);
                currentDate.textContent = today;
            }
        }
    } catch (error) {
        console.error('Error loading admin info:', error);
    }
}

// ==================== CHANGE PASSWORD ====================

async function changePassword(currentPassword, newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        // Create admin log
        const user = await getCurrentUser();
        if (user) {
            const ipAddress = await getClientIP();
            await createAdminLog(
                user.id,
                'PASSWORD_CHANGED',
                user.id,
                'Admin changed password',
                ipAddress
            );
        }

        return true;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

// ==================== GET CLIENT IP ====================

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'Unknown';
    } catch (error) {
        return 'Unknown';
    }
}

// ==================== SESSION EXPIRY CHECK ====================

function setupSessionCheck() {
    // Check session every 5 minutes
    setInterval(async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                showToast('Session expired. Please login again.', 'warning');
                setTimeout(() => {
                    logoutAdmin();
                }, 2000);
            }
        } catch (error) {
            console.error('Session check error:', error);
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// ==================== INITIALIZE APP ====================

async function initializeApp() {
    try {
        await loadAdminInfo();
        setupSessionCheck();

        // Load notification count
        const stats = await getStatistics();
        const notificationCount = document.getElementById('notificationCount');
        const reportsCount = document.getElementById('reportsCount');
        const usersCount = document.getElementById('usersCount');

        if (notificationCount) notificationCount.textContent = stats.totalReports;
        if (reportsCount) reportsCount.textContent = stats.totalReports;
        if (usersCount) usersCount.textContent = stats.totalUsers;
    } catch (error) {
        console.error('App initialization error:', error);
    }
}