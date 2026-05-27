// ==================== REPORTS PAGE FUNCTIONALITY ====================

let currentPage = 1;
const itemsPerPage = 10;
let allReports = [];
let filteredReports = [];

// Initialize reports page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadReports();
        setupSearchAndFilters();
        setupPagination();
        setupTableActions();
    } catch (error) {
        console.error('Reports page initialization error:', error);
        showToast('Error loading reports', 'error');
    }
});

// ==================== LOAD REPORTS ====================

async function loadReports() {
    try {
        showLoading(document.querySelector('.content-wrapper'));

        allReports = await fetchReports();
        filteredReports = [...allReports];

        updateReportStats();
        renderReportsTable();

        hideLoading(document.querySelector('.content-wrapper'));
    } catch (error) {
        console.error('Error loading reports:', error);
        hideLoading(document.querySelector('.content-wrapper'));
        showToast('Error loading reports', 'error');
    }
}

function updateReportStats() {
    const pending = allReports.filter(r => r.status === 'pending').length;
    const underReview = allReports.filter(r => r.status === 'under_review').length;
    const resolved = allReports.filter(r => r.status === 'resolved').length;

    const pendingEl = document.getElementById('pendingReports');
    const underReviewEl = document.getElementById('underReviewReports');
    const resolvedEl = document.getElementById('resolvedReports');

    if (pendingEl) pendingEl.textContent = pending;
    if (underReviewEl) underReviewEl.textContent = underReview;
    if (resolvedEl) resolvedEl.textContent = resolved;
}

// ==================== RENDER REPORTS TABLE ====================

function renderReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    if (paginatedReports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px;">No reports found</td></tr>';
        updatePagination();
        return;
    }

    paginatedReports.forEach(report => {
        const row = document.createElement('tr');
        const reportedUser = report.reported_user;
        const reporterUser = report.reporter_user;

        row.innerHTML = `
            <td><code style="font-size: 0.75rem; color: var(--color-text-secondary);">${report.id?.substring(0, 8) || 'N/A'}...</code></td>
            <td>${reportedUser?.full_name || 'Unknown'}</td>
            <td><span class="report-reason">${capitalize(report.reason?.replace(/_/g, ' ') || 'Other')}</span></td>
            <td>${reporterUser?.full_name || 'Anonymous'}</td>
            <td>${formatDate(report.created_at)}</td>
            <td>${createStatusBadge(report.status).outerHTML}</td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn" title="View Details" data-action="view" data-report-id="${report.id}">
                        <i data-feather="eye"></i>
                    </button>
                    <button class="action-btn danger" title="Delete Profile" data-action="delete" data-report-id="${report.id}" data-user-id="${report.reported_user_id}">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    feather.replace();
    updatePagination();
}

// ==================== SEARCH & FILTERS ====================

function setupSearchAndFilters() {
    const reportSearch = document.getElementById('reportSearch');
    const statusFilter = document.getElementById('reportStatusFilter');
    const reasonFilter = document.getElementById('reportReasonFilter');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    const debouncedFilter = debounce(applyFilters, 300);

    if (reportSearch) {
        reportSearch.addEventListener('input', debouncedFilter);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    if (reasonFilter) {
        reasonFilter.addEventListener('change', applyFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('reportSearch')?.value?.toLowerCase() || '';
    const status = document.getElementById('reportStatusFilter')?.value || '';
    const reason = document.getElementById('reportReasonFilter')?.value || '';

    filteredReports = allReports.filter(report => {
        const matchesSearch = !searchTerm ||
            report.reported_user?.full_name?.toLowerCase().includes(searchTerm) ||
            report.description?.toLowerCase().includes(searchTerm);

        const matchesStatus = !status || report.status === status;
        const matchesReason = !reason || report.reason === reason;

        return matchesSearch && matchesStatus && matchesReason;
    });

    currentPage = 1;
    renderReportsTable();
}

function clearFilters() {
    document.getElementById('reportSearch').value = '';
    document.getElementById('reportStatusFilter').value = '';
    document.getElementById('reportReasonFilter').value = '';

    filteredReports = [...allReports];
    currentPage = 1;
    renderReportsTable();
}

// ==================== PAGINATION ====================

function setupPagination() {
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');

    if (prevPage) {
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderReportsTable();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (nextPage) {
        nextPage.addEventListener('click', () => {
            const maxPages = Math.ceil(filteredReports.length / itemsPerPage);
            if (currentPage < maxPages) {
                currentPage++;
                renderReportsTable();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

function updatePagination() {
    const maxPages = Math.ceil(filteredReports.length / itemsPerPage);

    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === maxPages;

    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;

    pageNumbers.innerHTML = '';

    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(maxPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-num ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderReportsTable();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pageNumbers.appendChild(pageBtn);
    }
}

// ==================== TABLE ACTIONS ====================

function setupTableActions() {
    document.addEventListener('click', async (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.getAttribute('data-action');
        const reportId = actionBtn.getAttribute('data-report-id');

        try {
            switch (action) {
                case 'view':
                    await openReportModal(reportId);
                    break;
                case 'delete':
                    showDeleteConfirmation(reportId);
                    break;
            }
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            showToast(`Error ${action}ing report`, 'error');
        }
    });
}

// ==================== REPORT MODAL ====================

async function openReportModal(reportId) {
    try {
        const report = await fetchReportById(reportId);
        if (!report) throw new Error('Report not found');

        const modalBody = document.getElementById('reportModalBody');
        if (!modalBody) return;

        const reportedUser = report.reported_user || {};
        const reporterUser = report.reporter_user || {};

        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div style="grid-column: 1 / -1;">
                    <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">Reported Profile</h3>
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Profile Photo</label>
                    <img src="${reportedUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + reportedUser.id}" 
                         alt="Avatar" 
                         style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-danger);">
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Name</label>
                    <p style="margin: 0; color: var(--color-text);">${reportedUser.full_name || 'N/A'}</p>
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Email</label>
                    <p style="margin: 0; color: var(--color-text);">${reportedUser.email || 'N/A'}</p>
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 1rem 0;">
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">Report Details</h3>
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Report ID</label>
                    <code style="color: var(--color-text-secondary);">${report.id}</code>
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Reason</label>
                    <p style="margin: 0;">${capitalize(report.reason?.replace(/_/g, ' ') || 'Other')}</p>
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Description</label>
                    <p style="margin: 0; color: var(--color-text); line-height: 1.6;">${report.description || 'No description provided'}</p>
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Status</label>
                    <select id="reportStatus" class="form-input">
                        <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="under_review" ${report.status === 'under_review' ? 'selected' : ''}>Under Review</option>
                        <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Reported By</label>
                    <p style="margin: 0;">${reporterUser.full_name || 'Anonymous'}</p>
                </div>
                
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Report Date</label>
                    <p style="margin: 0;">${formatDateTime(report.created_at)}</p>
                </div>
            </div>
        `;

        const markResolvedBtn = document.getElementById('markResolvedBtn');
        const deleteProfileBtn = document.getElementById('deleteProfileBtn');

        if (markResolvedBtn) {
            markResolvedBtn.onclick = async () => {
                try {
                    const newStatus = document.getElementById('reportStatus').value;
                    await updateReportStatus(reportId, newStatus);

                    showToast('Report updated successfully!', 'success');
                    await loadReports();
                    hideModal('reportModal');
                } catch (error) {
                    console.error('Error updating report:', error);
                    showToast('Error updating report', 'error');
                }
            };
        }

        if (deleteProfileBtn) {
            deleteProfileBtn.onclick = () => {
                showConfirmModal(
                    'Delete Profile',
                    `Are you sure you want to delete ${reportedUser.full_name}'s profile? This action cannot be undone.`,
                    async () => {
                        try {
                            await deleteUser(report.reported_user_id);
                            await updateReportStatus(reportId, 'resolved');

                            showToast('Profile deleted successfully', 'success');
                            await loadReports();
                            hideModal('reportModal');
                        } catch (error) {
                            console.error('Error deleting profile:', error);
                            showToast('Error deleting profile', 'error');
                        }
                    }
                );
            };
        }

        showModal('reportModal');
    } catch (error) {
        console.error('Error opening report modal:', error);
        showToast('Error loading report details', 'error');
    }
}

// ==================== DELETE CONFIRMATION ====================

function showDeleteConfirmation(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    showConfirmModal(
        'Delete Report',
        `Are you sure you want to delete this report and the associated profile?`,
        async () => {
            try {
                await deleteUser(report.reported_user_id);
                await updateReportStatus(reportId, 'resolved');

                showToast('Report handled successfully', 'success');
                await loadReports();
            } catch (error) {
                console.error('Error handling report:', error);
                showToast('Error handling report', 'error');
            }
        }
    );
}

// ==================== STYLE ADJUSTMENTS ====================

const style = document.createElement('style');
style.textContent = `
    .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background-color: var(--color-bg);
        color: var(--color-text);
        font-size: var(--font-size-sm);
    }
    
    .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .text-center {
        text-align: center;
        color: var(--color-text-secondary);
    }
`;
document.head.appendChild(style);