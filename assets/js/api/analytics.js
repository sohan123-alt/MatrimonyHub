// ==================== ANALYTICS PAGE FUNCTIONALITY ====================

let registrationTrendChart = null;
let genderDistributionChart = null;
let religionDistributionChart = null;
let interestActivityChart = null;
let topLocationsChart = null;
let userStatusChart = null;

// Initialize analytics page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAnalyticsData();
        setupCharts();
        loadAnalyticsTable();
    } catch (error) {
        console.error('Analytics page initialization error:', error);
        showToast('Error loading analytics', 'error');
    }
});

// ==================== LOAD ANALYTICS DATA ====================

async function loadAnalyticsData() {
    try {
        showLoading(document.querySelector('.content-wrapper'));

        const stats = await getStatistics();

        // Update metric cards
        document.getElementById('totalGrowth').textContent = '24%';
        document.getElementById('engagementRate').textContent = '68%';
        document.getElementById('dailyActiveUsers').textContent = Math.floor(stats.totalUsers * 0.4);
        document.getElementById('successRate').textContent = '82%';

        hideLoading(document.querySelector('.content-wrapper'));
    } catch (error) {
        console.error('Error loading analytics:', error);
        hideLoading(document.querySelector('.content-wrapper'));
        throw error;
    }
}

// ==================== SETUP CHARTS ====================

function setupCharts() {
    setupRegistrationTrendChart();
    setupGenderDistributionChart();
    setupReligionDistributionChart();
    setupInterestActivityChart();
    setupTopLocationsChart();
    setupUserStatusChart();
}

function setupRegistrationTrendChart() {
    const ctx = document.getElementById('registrationTrendChart');
    if (!ctx) return;

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'New Registrations',
            data: [450, 520, 480, 650, 720, 680, 820, 950, 870, 920, 1050, 1200],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
        }]
    };

    if (registrationTrendChart) registrationTrendChart.destroy();

    registrationTrendChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function setupGenderDistributionChart() {
    const ctx = document.getElementById('genderDistributionChart');
    if (!ctx) return;

    const data = {
        labels: ['Male', 'Female'],
        datasets: [{
            data: [55, 45],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: [
                '#3b82f6',
                '#ec4899'
            ],
            borderWidth: 2,
        }]
    };

    if (genderDistributionChart) genderDistributionChart.destroy();

    genderDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function setupReligionDistributionChart() {
    const ctx = document.getElementById('religionDistributionChart');
    if (!ctx) return;

    const data = {
        labels: ['Islam', 'Hindu', 'Christian', 'Buddhist', 'Sikh'],
        datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: [
                '#10b981',
                '#3b82f6',
                '#f59e0b',
                '#8b5cf6',
                '#ec4899'
            ],
            borderWidth: 2,
        }]
    };

    if (religionDistributionChart) religionDistributionChart.destroy();

    religionDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function setupInterestActivityChart() {
    const ctx = document.getElementById('interestActivityChart');
    if (!ctx) return;

    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Interests Sent',
            data: [120, 150, 140, 180, 220, 200, 160],
            backgroundColor: 'rgba(236, 72, 153, 0.2)',
            borderColor: '#ec4899',
            borderWidth: 2,
        },
        {
            label: 'Interests Accepted',
            data: [80, 95, 90, 120, 150, 130, 100],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            borderWidth: 2,
        }]
    };

    if (interestActivityChart) interestActivityChart.destroy();

    interestActivityChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function setupTopLocationsChart() {
    const ctx = document.getElementById('topLocationsChart');
    if (!ctx) return;

    const data = {
        labels: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'],
        datasets: [{
            label: 'Users',
            data: [450, 320, 280, 200, 150],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(16, 185, 129, 0.8)'
            ],
            borderColor: [
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                '#f59e0b',
                '#10b981'
            ],
            borderWidth: 2,
        }]
    };

    if (topLocationsChart) topLocationsChart.destroy();

    topLocationsChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function setupUserStatusChart() {
    const ctx = document.getElementById('userStatusChart');
    if (!ctx) return;

    const data = {
        labels: ['Active', 'Inactive', 'Blocked'],
        datasets: [{
            data: [720, 150, 80],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(107, 114, 128, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
                '#10b981',
                '#6b7280',
                '#ef4444'
            ],
            borderWidth: 2,
        }]
    };

    if (userStatusChart) userStatusChart.destroy();

    userStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ==================== LOAD ANALYTICS TABLE ====================

async function loadAnalyticsTable() {
    try {
        const tbody = document.getElementById('analyticsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Sample monthly data
        const monthlyData = [
            { month: 'January', newUsers: 450, activeUsers: 380, interests: 1200, conversations: 450, conversion: '84%' },
            { month: 'February', newUsers: 520, activeUsers: 420, interests: 1450, conversations: 580, conversion: '86%' },
            { month: 'March', newUsers: 480, activeUsers: 400, interests: 1350, conversations: 520, conversion: '83%' },
            { month: 'April', newUsers: 650, activeUsers: 520, interests: 1800, conversations: 720, conversion: '80%' },
            { month: 'May', newUsers: 720, activeUsers: 580, interests: 2100, conversations: 850, conversion: '82%' },
            { month: 'June', newUsers: 680, activeUsers: 550, interests: 2000, conversations: 800, conversion: '81%' },
        ];

        monthlyData.forEach(data => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.month}</td>
                <td><strong>${data.newUsers}</strong></td>
                <td><strong>${data.activeUsers}</strong></td>
                <td>${data.interests}</td>
                <td>${data.conversations}</td>
                <td><span style="color: var(--color-success); font-weight: 600;">${data.conversion}</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading analytics table:', error);
    }
}

// ==================== DATE RANGE FILTER ====================

const dateRangeFilter = document.getElementById('dateRangeFilter');
if (dateRangeFilter) {
    dateRangeFilter.addEventListener('change', async () => {
        await loadAnalyticsData();
        setupCharts();
    });
}