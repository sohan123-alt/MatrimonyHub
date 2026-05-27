// ================================================
// PROFILE PAGE JAVASCRIPT
// ================================================

let currentUser = null;
let currentProfile = null;
let currentGalleryImages = [];

/**
 * Initialize profile page
 */
async function initProfilePage() {
    // Check authentication
    currentUser = await checkAuthentication();
    if (!currentUser) return;

    // Load profile data
    await loadProfileData();

    // Setup event listeners
    setupEventListeners();

    // Display stats
    updateStats();
}

/**
 * Load profile data
 */
async function loadProfileData() {
    showLoading('Loading profile...');

    const result = await getUserProfile(currentUser.id);
    hideLoading();

    if (result.success && result.data) {
        currentProfile = result.data;
        populateProfileForm(result.data);
        await loadGallery();
    } else {
        // New user, show empty form
        currentProfile = { id: currentUser.id };
        currentProfile.full_name = currentUser.user_metadata?.full_name || '';
    }
}

/**
 * Populate form with profile data
 */
function populateProfileForm(profile) {
    document.getElementById('full_name').value = profile.full_name || '';
    document.getElementById('age').value = profile.age || '';
    document.getElementById('gender').value = profile.gender || '';
    document.getElementById('religion').value = profile.religion || '';
    document.getElementById('profession').value = profile.profession || '';
    document.getElementById('education').value = profile.education || '';
    document.getElementById('location').value = profile.location || '';
    document.getElementById('marital_status').value = profile.marital_status || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('looking_for').value = profile.looking_for || '';
    document.getElementById('bio').value = profile.bio || '';
    document.getElementById('preferences').value = profile.preferences || '';
    document.getElementById('family_details').value = profile.family_details || '';
    document.getElementById('height').value = profile.height || '';
    document.getElementById('weight').value = profile.weight || '';
    document.getElementById('caste').value = profile.caste || '';
    document.getElementById('show_phone').checked = profile.show_phone || false;
    document.getElementById('show_email').checked = profile.show_email || false;

    // Load profile image
    if (profile.profile_image_url) {
        document.getElementById('profile-image-preview').src = profile.profile_image_url;
        document.getElementById('image-upload-info').textContent = 'Profile picture uploaded';
        document.getElementById('delete-profile-image-btn').style.display = 'inline-block';
    }

    // Update bio counter
    updateBioCounter();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Profile image upload
    document.getElementById('image-upload-input').addEventListener('change', handleProfileImageUpload);

    // Delete profile image
    document.getElementById('delete-profile-image-btn').addEventListener('click', deleteProfileImage);

    // Gallery upload
    document.getElementById('gallery-upload-input').addEventListener('change', handleGalleryUpload);

    // Profile form submit
    document.getElementById('profile-form').addEventListener('submit', handleProfileFormSubmit);

    // Bio character counter
    document.getElementById('bio').addEventListener('input', updateBioCounter);
}

/**
 * Handle profile image upload
 */
async function handleProfileImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'warning');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size must be less than 5MB', 'warning');
        return;
    }

    showLoading('Uploading image...');

    const result = await uploadProfileImage(currentUser.id, file);
    hideLoading();

    if (result.success) {
        currentProfile.profile_image_url = result.url;
        document.getElementById('profile-image-preview').src = result.url;
        document.getElementById('image-upload-info').textContent = 'Profile picture uploaded';
        document.getElementById('delete-profile-image-btn').style.display = 'inline-block';
        showToast('Profile image uploaded successfully!', 'success');
    } else {
        showAlert('Failed to upload image: ' + result.error, 'danger');
    }

    // Reset input
    e.target.value = '';
}

/**
 * Delete profile image
 */
async function deleteProfileImage() {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;

    showLoading('Deleting image...');

    try {
        // Update profile to remove image
        const result = await updateUserProfile(currentUser.id, {
            profile_image_url: null
        });

        hideLoading();

        if (result.success) {
            currentProfile.profile_image_url = null;
            document.getElementById('profile-image-preview').src = 'https://via.placeholder.com/200';
            document.getElementById('image-upload-info').textContent = 'No image uploaded';
            document.getElementById('delete-profile-image-btn').style.display = 'none';
            showToast('Profile image deleted', 'success');
        } else {
            showAlert('Failed to delete image', 'danger');
        }
    } catch (error) {
        hideLoading();
        showAlert('Error: ' + error.message, 'danger');
    }
}

/**
 * Handle gallery upload
 */
async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (currentGalleryImages.length + files.length > 5) {
        showAlert(`You can only upload up to 5 photos. You already have ${currentGalleryImages.length}`, 'warning');
        return;
    }

    showLoading(`Uploading ${files.length} image(s)...`);

    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const result = await uploadGalleryImage(currentUser.id, file);
        if (!result.success) {
            console.error('Failed to upload:', result.error);
        }
    }

    hideLoading();
    showToast('Images uploaded successfully!', 'success');
    await loadGallery();
    e.target.value = '';
}

/**
 * Load gallery images
 */
async function loadGallery() {
    const result = await getUserGallery(currentUser.id);

    if (result.success) {
        currentGalleryImages = result.data;
        displayGallery();
    }
}

/**
 * Display gallery images
 */
function displayGallery() {
    const galleryGrid = document.getElementById('gallery-grid');

    if (currentGalleryImages.length === 0) {
        galleryGrid.innerHTML = '<p style="color: var(--text-lighter);">No photos uploaded yet</p>';
        return;
    }

    galleryGrid.innerHTML = currentGalleryImages
        .map(image => `
            <div class="gallery-item">
                <img src="${image.image_url}" alt="Gallery image" onerror="this.src='https://via.placeholder.com/150'">
                <button class="gallery-item-delete" onclick="deleteGalleryImageClick('${image.id}', '${image.image_public_id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `)
        .join('');
}

/**
 * Delete gallery image
 */
async function deleteGalleryImageClick(imageId, imagePath) {
    if (!confirm('Delete this image?')) return;

    showLoading('Deleting image...');
    const result = await deleteGalleryImage(currentUser.id, imageId, imagePath);
    hideLoading();

    if (result.success) {
        showToast('Image deleted', 'success');
        await loadGallery();
    } else {
        showAlert('Failed to delete image', 'danger');
    }
}

/**
 * Update bio character counter
 */
function updateBioCounter() {
    const bio = document.getElementById('bio').value;
    const counter = document.getElementById('bio-count');
    counter.textContent = `${bio.length}/500 characters`;
}

/**
 * Handle profile form submit
 */
async function handleProfileFormSubmit(e) {
    e.preventDefault();

    const formData = {
        full_name: document.getElementById('full_name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        religion: document.getElementById('religion').value,
        profession: document.getElementById('profession').value,
        education: document.getElementById('education').value,
        location: document.getElementById('location').value,
        marital_status: document.getElementById('marital_status').value,
        phone: document.getElementById('phone').value,
        looking_for: document.getElementById('looking_for').value,
        bio: document.getElementById('bio').value,
        preferences: document.getElementById('preferences').value,
        family_details: document.getElementById('family_details').value,
        height: parseFloat(document.getElementById('height').value) || null,
        weight: parseFloat(document.getElementById('weight').value) || null,
        caste: document.getElementById('caste').value || null,
        show_phone: document.getElementById('show_phone').checked,
        show_email: document.getElementById('show_email').checked,
        profile_image_url: currentProfile.profile_image_url || null
    };

    // Validation
    if (!formData.full_name || !formData.age || !formData.gender) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    if (formData.age < 18 || formData.age > 100) {
        showAlert('Age must be between 18 and 100', 'warning');
        return;
    }

    showLoading('Saving profile...');

    const result = await updateUserProfile(currentUser.id, formData);
    hideLoading();

    if (result.success) {
        currentProfile = result.data;
        showAlert('Profile saved successfully!', 'success');
        updateStats();
    } else {
        showAlert('Error saving profile: ' + result.error, 'danger');
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabIndex) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.form-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    document.querySelectorAll('.form-tab-btn')[tabIndex].classList.add('active');
    document.querySelectorAll('.tab-content')[tabIndex].classList.add('active');
}

/**
 * Update stats
 */
function updateStats() {
    const statsContainer = document.getElementById('stats-container');

    if (!currentProfile) {
        statsContainer.innerHTML = '';
        return;
    }

    const profileCompletion = calculateProfileCompletion(currentProfile);
    const viewsCount = currentProfile.profile_views || 0;
    const interestsCount = currentProfile.interests_count || 0;

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${profileCompletion}%</div>
            <div class="stat-label">Profile Completion</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${currentGalleryImages.length}</div>
            <div class="stat-label">Photos Uploaded</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${interestsCount}</div>
            <div class="stat-label">Interest Received</div>
        </div>
    `;
}

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profile) {
    const fields = [
        'full_name',
        'age',
        'gender',
        'profession',
        'location',
        'bio',
        'profile_image_url'
    ];

    const filledFields = fields.filter(field => {
        const value = profile[field];
        return value && value !== '' && value !== null;
    }).length;

    return Math.round((filledFields / fields.length) * 100);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initProfilePage);