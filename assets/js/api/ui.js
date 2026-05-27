// ==================== UI UTILITIES ====================

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');

    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Show modal
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Close modal on button click
 */
function setupModalClosers() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal')?.classList.remove('active');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

/**
 * Format date
 */
function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time
 */
function formatTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format datetime
 */
function formatDateTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Truncate text
 */
function truncateText(text, length = 50) {
    if (!text) return 'N/A';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Capitalize text
 */
function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Check if email is valid
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success', 2000);
    } catch (error) {
        console.error('Copy error:', error);
        showToast('Failed to copy', 'error');
    }
}

/**
 * Generate unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Show loading indicator
 */
function showLoading(target) {
    if (!target) return;
    target.style.opacity = '0.6';
    target.style.pointerEvents = 'none';
}

/**
 * Hide loading indicator
 */
function hideLoading(target) {
    if (!target) return;
    target.style.opacity = '1';
    target.style.pointerEvents = 'auto';
}

/**
 * Create skeleton loader row
 */
function createSkeletonRow(columns = 5) {
    const row = document.createElement('tr');
    row.className = 'skeleton-row';

    for (let i = 0; i < columns; i++) {
        const td = document.createElement('td');
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        td.appendChild(skeleton);
        row.appendChild(td);
    }

    return row;
}

/**
 * Export to CSV
 */
function exportToCSV(data, filename = 'export.csv') {
    try {
        if (!data || data.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escape quotes in values
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csv += values.join(',') + '\n';
        });

        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
        showToast('File downloaded successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Error exporting data', 'error');
    }
}

/**
 * Create badge element
 */
function createBadge(text, type = 'default') {
    const badge = document.createElement('span');
    badge.className = `activity-badge ${type}`;
    badge.textContent = text;
    return badge;
}

/**
 * Create action button
 */
function createActionButton(icon, tooltip = '', onClick = null) {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.title = tooltip;
    btn.innerHTML = `<i data-feather="${icon}"></i>`;

    if (onClick) {
        btn.addEventListener('click', onClick);
    }

    feather.replace();
    return btn;
}

/**
 * Show confirmation modal
 */
function showConfirmModal(title, message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirmModal');

    if (!modal) return;

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const confirmBtn = document.getElementById('confirmActionBtn');
    const cancelBtn = document.getElementById('cancelConfirmBtn');
    const closeBtn = document.getElementById('closeConfirmModal');

    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode?.replaceChild(newConfirmBtn, confirmBtn);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);

    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode?.replaceChild(newCloseBtn, closeBtn);

    // Add new listeners
    newConfirmBtn.addEventListener('click', () => {
        hideModal('confirmModal');
        if (onConfirm) onConfirm();
    });

    newCancelBtn.addEventListener('click', () => {
        hideModal('confirmModal');
        if (onCancel) onCancel();
    });

    newCloseBtn.addEventListener('click', () => {
        hideModal('confirmModal');
        if (onCancel) onCancel();
    });

    showModal('confirmModal');
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create user cell element
 */
function createUserCell(user) {
    const cell = document.createElement('div');
    cell.className = 'user-cell';

    const avatar = document.createElement('img');
    avatar.className = 'user-avatar';
    avatar.src = user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user.id || 'user');
    avatar.onerror = () => {
        avatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user.id || 'user');
    };

    const info = document.createElement('div');
    info.className = 'user-info';

    const name = document.createElement('div');
    name.className = 'user-name';
    name.textContent = user.full_name || 'N/A';

    const email = document.createElement('div');
    email.className = 'user-email';
    email.textContent = user.email || 'N/A';

    info.appendChild(name);
    info.appendChild(email);

    cell.appendChild(avatar);
    cell.appendChild(info);

    return cell;
}

/**
 * Create status badge element
 */
function createStatusBadge(status) {
    const badge = document.createElement('span');
    badge.className = `status-badge ${status || 'inactive'}`;
    badge.textContent = capitalize(status || 'Inactive');
    return badge;
}

/**
 * Format phone number
 */
function formatPhone(phone) {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

/**
 * Initialize all modal closers on page load
 */
document.addEventListener('DOMContentLoaded', setupModalClosers);

/**
 * Handle clicks on modal close buttons
 */
document.addEventListener('click', (e) => {
    if (e.target.matches('.modal-close') || e.target.closest('.modal-close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
});

/**
 * Keyboard shortcut for closing modals
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

/**
 * Add animation to elements on scroll
 */
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stat-card, .chart-container, .table-section').forEach(el => {
        observer.observe(el);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    observeElements();
    feather.replace();
});