// ================================================
// UTILITY & HELPER FUNCTIONS
// ================================================

/**
 * ALERT SYSTEM
 * Show alert messages
 */
function showAlert(message, type = 'info', duration = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type}">
            <div class="alert-content">
                <i class="fas fa-${getAlertIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="alert-close" onclick="document.getElementById('${alertId}').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    const alertContainer = document.getElementById('alerts-container');
    if (alertContainer) {
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', alertHTML);
    }

    if (duration > 0) {
        setTimeout(() => {
            const element = document.getElementById(alertId);
            if (element) element.remove();
        }, duration);
    }
}

/**
 * GET ALERT ICON
 */
function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * TOAST NOTIFICATION
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast toast-${type}">
            <i class="fas fa-${getToastIcon(type)}"></i>
            ${message}
        </div>
    `;

    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toast = document.getElementById(toastId);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * GET TOAST ICON
 */
function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * CREATE TOAST CONTAINER
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

/**
 * LOADING OVERLAY
 * Show/hide loading overlay
 */
function showLoading(message = 'Loading...') {
    let loader = document.getElementById('loading-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-overlay';
        loader.className = 'loading-overlay';
        document.body.appendChild(loader);
    }

    loader.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    loader.style.display = 'flex';
}

/**
 * HIDE LOADING
 */
function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * CONFIRM DIALOG
 * Show confirmation dialog
 */
function showConfirm(title, message, onConfirm, onCancel) {
    const confirmId = 'confirm-' + Date.now();
    const confirmHTML = `
        <div id="${confirmId}" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="document.getElementById('${confirmId}').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="
                        document.getElementById('${confirmId}').remove();
                        if(typeof onCancel === 'function') onCancel();
                    ">Cancel</button>
                    <button class="btn btn-danger" onclick="
                        document.getElementById('${confirmId}').remove();
                        if(typeof onConfirm === 'function') onConfirm();
                    ">Confirm</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmHTML);
}

/**
 * FORMAT DATE
 * Format date in readable format
 */
function formatDate(date, format = 'short') {
    const d = new Date(date);

    if (format === 'short') {
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'datetime') {
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (format === 'time') {
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * FORMAT CURRENCY
 * Format number as currency
 */
function formatCurrency(amount, currency = 'BDT') {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * FORMAT NUMBER
 * Format large numbers with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * TRUNCATE TEXT
 * Truncate text with ellipsis
 */
function truncateText(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * VALIDATE EMAIL
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * VALIDATE PASSWORD
 * Validate password strength
 */
function validatePassword(password) {
    return password.length >= 6;
}

/**
 * VALIDATE PHONE
 * Validate phone number
 */
function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone);
}

/**
 * DEBOUNCE
 * Debounce function calls
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
 * THROTTLE
 * Throttle function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * GET URL PARAMS
 * Get URL query parameters
 */
function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (let [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

/**
 * UPDATE URL PARAMS
 * Update URL query parameters
 */
function updateUrlParams(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
    });
    window.history.replaceState({}, '', `?${searchParams.toString()}`);
}

/**
 * FILE TO BASE64
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
 * PREVIEW IMAGE
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
 * DOWNLOAD FILE
 * Download file from URL
 */
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * COPY TO CLIPBOARD
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(err => {
        showAlert('Failed to copy', 'error');
    });
}

/**
 * HIGHLIGHT SEARCH RESULTS
 * Highlight search terms in text
 */
function highlightText(text, search) {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * SORT ARRAY
 * Sort array of objects
 */
function sortArray(array, key, ascending = true) {
    return array.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (typeof aVal === 'string') {
            return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        return ascending ? aVal - bVal : bVal - aVal;
    });
}

/**
 * FILTER ARRAY
 * Filter array based on multiple criteria
 */
function filterArray(array, criteria) {
    return array.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
            if (!value) return true;
            return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
        });
    });
}

/**
 * SLEEP
 * Delay execution
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * CALCULATE AGE
 * Calculate age from birth date
 */
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * GET STORAGE
 * Get value from localStorage with error handling
 */
function getStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Storage get error:', error);
        return defaultValue;
    }
}

/**
 * SET STORAGE
 * Set value in localStorage with error handling
 */
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Storage set error:', error);
        return false;
    }
}

/**
 * REMOVE STORAGE
 * Remove value from localStorage
 */
function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Storage remove error:', error);
        return false;
    }
}

/**
 * CLEAR STORAGE
 * Clear all localStorage
 */
function clearStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Storage clear error:', error);
        return false;
    }
}
