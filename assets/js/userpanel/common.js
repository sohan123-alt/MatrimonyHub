// ================================================
// COMMON JAVASCRIPT FUNCTIONS - FIXED VERSION
// ================================================

// ================================================
// ALERT SYSTEM
// ================================================

function showAlert(message, type = 'info', container = null) {

    const alertContainer =
        container ||
        document.getElementById('alerts-container') ||
        document.body;

    const alert = document.createElement('div');

    alert.className = `alert alert-${type}`;

    alert.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            gap:10px;
        ">
            <i class="fas fa-${
                type === 'success'
                    ? 'check-circle'
                    : type === 'danger'
                    ? 'exclamation-circle'
                    : type === 'warning'
                    ? 'exclamation-triangle'
                    : 'info-circle'
            }"></i>

            <span>${message}</span>

            <button class="alert-close"
                style="
                    margin-left:auto;
                    background:none;
                    border:none;
                    cursor:pointer;
                    color:inherit;
                    font-size:18px;
                ">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    alertContainer.prepend(alert);

    const closeBtn = alert.querySelector('.alert-close');

    if (closeBtn) {

        closeBtn.addEventListener('click', () => {
            alert.remove();
        });
    }

    setTimeout(() => {

        if (alert.parentNode) {
            alert.remove();
        }

    }, 5000);
}

// ================================================
// TOAST
// ================================================

function showToast(message, type = 'success') {

    showAlert(message, type);

}

// ================================================
// LOADING SYSTEM
// ================================================

function showLoading(message = 'Loading...') {

    let loader =
        document.getElementById('global-loader');

    if (!loader) {

        loader = document.createElement('div');

        loader.id = 'global-loader';

        loader.innerHTML = `
            <div style="
                background:white;
                padding:30px;
                border-radius:12px;
                text-align:center;
                min-width:250px;
            ">

                <div style="
                    width:40px;
                    height:40px;
                    border:4px solid #eee;
                    border-top:4px solid #e91e63;
                    border-radius:50%;
                    margin:auto;
                    animation:spin 1s linear infinite;
                "></div>

                <p style="margin-top:15px;">
                    ${message}
                </p>

            </div>
        `;

        loader.style.cssText = `
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.5);
            display:flex;
            justify-content:center;
            align-items:center;
            z-index:99999;
        `;

        document.body.appendChild(loader);
    }
}

function hideLoading() {

    const loader =
        document.getElementById('global-loader');

    if (loader) {
        loader.remove();
    }
}

// ================================================
// EMAIL VALIDATION
// ================================================

function validateEmail(email) {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
}

// ================================================
// PASSWORD VALIDATION
// ================================================

function validatePassword(password) {

    return password.length >= 6;

}

// ================================================
// AUTH CHECK
// ================================================

async function isUserAuthenticated() {

    try {

        if (!window.supabaseClient) {
            return false;
        }

        const {
            data: { session }
        } = await window.supabaseClient.auth.getSession();

        return !!session;

    } catch (error) {

        console.error('Auth Check Error:', error);

        return false;
    }
}

// ================================================
// GET CURRENT USER
// ================================================

async function getCurrentUser() {

    try {

        if (!window.supabaseClient) {
            return null;
        }

        const {
            data: { session }
        } = await window.supabaseClient.auth.getSession();

        // No session
        if (!session) {
            return null;
        }

        return session.user;

    } catch (error) {

        console.log('No active session');

        return null;
    }
}

// ================================================
// REGISTER USER
// ================================================

async function registerUser(
    email,
    password,
    fullName
) {

    try {

        if (!window.supabaseClient) {

            return {
                success: false,
                error: 'Supabase not initialized'
            };
        }

        // Create Auth User
        const { data, error } =
            await window.supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

        if (error) {

            return {
                success: false,
                error: error.message
            };
        }

        // Create Profile Table Entry
        if (data.user) {

            const { error: profileError } =
                await window.supabaseClient
                    .from('profiles')
                    .insert({

                        id: data.user.id,

                        full_name: fullName,

                        email: email,

                        created_at: new Date().toISOString()
                    });

            if (profileError) {

                console.error(profileError);

                return {
                    success: false,
                    error: profileError.message
                };
            }
        }

        return {
            success: true,
            data: data
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

// ================================================
// LOGIN USER
// ================================================

async function loginUser(email, password) {

    try {

        if (!window.supabaseClient) {

            return {
                success: false,
                error: 'Supabase not initialized'
            };
        }

        const { data, error } =
            await window.supabaseClient.auth
                .signInWithPassword({

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

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

// ================================================
// LOGOUT USER
// ================================================

async function logoutUser() {

    try {

        const { error } =
            await window.supabaseClient.auth.signOut();

        if (error) throw error;

        return {
            success: true
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

// ================================================
// UPDATE PROFILE
// ================================================

async function updateUserProfile(
    userId,
    updates
) {

    try {

        const { data, error } =
            await window.supabaseClient
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

// ================================================
// GET USER PROFILE
// ================================================

async function getUserProfile(userId) {

    try {

        const { data, error } =
            await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

// ================================================
// SEARCH PROFILES
// ================================================

async function searchProfiles(filters = {}) {

    try {

        let query =
            window.supabaseClient
                .from('profiles')
                .select('*');

        if (filters.gender) {
            query = query.eq('gender', filters.gender);
        }

        const { data, error } =
            await query.limit(
                filters.limit || 6
            );

        if (error) throw error;

        return {
            success: true,
            data: data || []
        };

    } catch (error) {

        return {
            success: false,
            error: error.message,
            data: []
        };
    }
}

// ================================================
// SEND INTEREST
// ================================================

async function sendInterest(
    senderId,
    receiverId,
    message = ''
) {

    try {

        const { data, error } =
            await window.supabaseClient
                .from('interests')
                .insert({

                    sender_id: senderId,
                    receiver_id: receiverId,
                    message: message
                });

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

// ================================================
// FAVORITES
// ================================================

async function addToFavorites(
    userId,
    favoriteUserId
) {

    try {

        const { data, error } =
            await window.supabaseClient
                .from('favorites')
                .insert({

                    user_id: userId,
                    favorite_id: favoriteUserId
                });

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

async function removeFromFavorites(
    userId,
    favoriteUserId
) {

    try {

        const { error } =
            await window.supabaseClient
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('favorite_id', favoriteUserId);

        if (error) throw error;

        return {
            success: true
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}

// ================================================
// NAVBAR
// ================================================

function initNavbar() {

    const logoutBtn =
        document.getElementById('logout-btn');

    if (logoutBtn) {

        logoutBtn.addEventListener(
            'click',
            async (e) => {

                e.preventDefault();

                const result =
                    await logoutUser();

                if (result.success) {

                    window.location.href =
                        'login.html';
                }
            }
        );
    }
}

// ================================================
// UPDATE NAVBAR
// ================================================

async function updateNavbarWithUser() {

    const user =
        await getCurrentUser();

    const authContainer =
        document.getElementById('auth-container');

    const userMenu =
        document.getElementById('user-menu');

    const userName =
        document.getElementById('user-name');

    if (user) {

        const profile =
            await getUserProfile(user.id);

        if (authContainer) {
            authContainer.classList.add('hidden');
        }

        if (userMenu) {
            userMenu.classList.remove('hidden');
        }

        if (userName) {

            userName.textContent =
                profile?.data?.full_name ||
                user.email;
        }

    } else {

        if (authContainer) {
            authContainer.classList.remove('hidden');
        }

        if (userMenu) {
            userMenu.classList.add('hidden');
        }
    }
}

// ================================================
// CHECK AUTHENTICATION
// ================================================

async function checkAuthentication() {

    const user =
        await getCurrentUser();

    if (!user) {

        window.location.href =
            'login.html';

        return false;
    }

    return user;
}

// ================================================
// FORMAT CURRENCY
// ================================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        'en-BD',
        {
            style: 'currency',
            currency: 'BDT'
        }
    ).format(amount);
}

// ================================================
// TRUNCATE TEXT
// ================================================

function truncateText(text, length = 100) {

    if (!text) return '';

    if (text.length <= length) {
        return text;
    }

    return text.substring(0, length) + '...';
}

// ================================================
// CREATE PROFILE CARD
// ================================================

function createProfileCard(profile) {

    return `
        <div class="profile-card">

            <img
                src="${
                    profile.profile_image_url ||
                    'https://via.placeholder.com/300'
                }"

                alt="${profile.full_name}"

                style="
                    width:100%;
                    height:250px;
                    object-fit:cover;
                "
            >

            <div style="padding:15px;">

                <h3>
                    ${profile.full_name || 'Unknown'}
                </h3>

                <p>
                    ${profile.age || 'N/A'} years
                </p>

                <p>
                    ${profile.location || 'Bangladesh'}
                </p>

                <a href="
                    profile-detail.html?id=${profile.id}
                "
                    class="btn btn-primary"
                >
                    View Profile
                </a>

            </div>

        </div>
    `;
}

// ================================================
// INIT PAGE
// ================================================

function initPage() {

    initNavbar();

    updateNavbarWithUser();

}

// ================================================
// GLOBAL EXPORTS
// ================================================

window.showAlert = showAlert;
window.showToast = showToast;

window.showLoading = showLoading;
window.hideLoading = hideLoading;

window.validateEmail = validateEmail;
window.validatePassword = validatePassword;

window.isUserAuthenticated =
    isUserAuthenticated;

window.getCurrentUser =
    getCurrentUser;

window.registerUser =
    registerUser;

window.loginUser =
    loginUser;

window.logoutUser =
    logoutUser;

window.updateUserProfile =
    updateUserProfile;

window.getUserProfile =
    getUserProfile;

window.searchProfiles =
    searchProfiles;

window.sendInterest =
    sendInterest;

window.addToFavorites =
    addToFavorites;

window.removeFromFavorites =
    removeFromFavorites;

window.createProfileCard =
    createProfileCard;

window.checkAuthentication =
    checkAuthentication;

// ================================================
// PAGE LOAD
// ================================================

document.addEventListener(
    'DOMContentLoaded',
    initPage
);
