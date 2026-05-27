// ================================================
// HOME PAGE JAVASCRIPT
// ================================================

let currentPage = 0;
const profilesPerPage = 6;

/**
 * Load featured profiles
 */
async function loadFeaturedProfiles() {
    const container = document.getElementById('featured-profiles');
    showLoading('Loading profiles...');

    try {
        const result = await searchProfiles({
            limit: profilesPerPage,
            page: currentPage
        });

        hideLoading();

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(profile => createProfileCard(profile)).join('');
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-2xl);">
                    <p>No profiles found yet. Check back soon!</p>
                </div>
            `;
        }
    } catch (error) {
        hideLoading();
        console.error('Error loading profiles:', error);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-2xl);">
                <p>Error loading profiles. Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Search profiles with filters
 */
async function searchProfilesWithFilters(e) {
    e.preventDefault();

    const gender = document.getElementById('gender').value;
    const minAge = parseInt(document.getElementById('minAge').value) || null;
    const maxAge = parseInt(document.getElementById('maxAge').value) || null;
    const religion = document.getElementById('religion').value;
    const location = document.getElementById('location').value;

    // Redirect to browse page with filters
    const params = new URLSearchParams();
    if (gender) params.append('gender', gender);
    if (minAge) params.append('minAge', minAge);
    if (maxAge) params.append('maxAge', maxAge);
    if (religion) params.append('religion', religion);
    if (location) params.append('location', location);

    window.location.href = 'browse.html' + (params.toString() ? '?' + params.toString() : '');
}

/**
 * Initialize page
 */
function initHomePage() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', searchProfilesWithFilters);
    }

    loadFeaturedProfiles();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initHomePage);