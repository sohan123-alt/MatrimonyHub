// ═════════════════════════════════════════════════════════════════════════════
// SUPABASE CONFIGURATION
// ═════════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://rqluzupvnzbkxxfbvjli.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mp_k0ppL3FJ0O5VgA4iwpA_niPLDH7m';

// Initialize Supabase Client
let supabaseClient = null;

try {

    const { createClient } = window.supabase;

    if (!createClient) {
        throw new Error('Supabase library not loaded.');
    }

    supabaseClient = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    console.log('✓ Supabase initialized successfully');

} catch (error) {

    console.error('✗ Supabase initialization error:', error);

}

// ═════════════════════════════════════════════════════════════════════════════
// APP CONFIG
// ═════════════════════════════════════════════════════════════════════════════

const APP_CONFIG = {
    appName: 'MatrimonyHub',
    appVersion: '1.0.0'
};

// ═════════════════════════════════════════════════════════════════════════════
// AUTH FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════
async function getCurrentUser() {

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        return user || null;

    } catch (error) {

        console.log('No active session');

        return null;
    }
}


async function signUp(email, password, fullName) {

    try {

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        console.error('Signup Error:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

async function signIn(email, password) {

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        console.error('Signin Error:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

async function signOut() {

    try {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) throw error;

        return true;

    } catch (error) {

        console.error('Logout Error:', error);

        return false;
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// PROFILE FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

async function createProfile(profileData) {

    try {

        const { data, error } =
            await supabaseClient
                .from('profiles')
                .insert([profileData]);

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        console.error('Create Profile Error:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

async function getProfile(userId) {

    try {

        const { data, error } =
            await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

        if (error) throw error;

        return data;

    } catch (error) {

        console.error('Get Profile Error:', error);

        return null;
    }
}

async function updateProfile(userId, updates) {

    try {

        const { data, error } =
            await supabaseClient
                .from('profiles')
                .update(updates)
                .eq('id', userId);

        if (error) throw error;

        return {
            success: true,
            data
        };

    } catch (error) {

        console.error('Update Profile Error:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// STORAGE FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

async function uploadImage(file, bucket = 'profile-images') {

    try {

        const fileExt = file.name.split('.').pop();

        const fileName =
            `${Date.now()}.${fileExt}`;

        const { error } =
            await supabaseClient.storage
                .from(bucket)
                .upload(fileName, file);

        if (error) throw error;

        const { data } =
            supabaseClient.storage
                .from(bucket)
                .getPublicUrl(fileName);

        return {
            success: true,
            url: data.publicUrl
        };

    } catch (error) {

        console.error('Upload Error:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function validatePassword(password) {

    return password.length >= 6;

}

function showNotification(message, type = 'success') {

    console.log(`${type}: ${message}`);

}

// ═════════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ═════════════════════════════════════════════════════════════════════════════

window.supabaseClient = supabaseClient;

window.APP_CONFIG = APP_CONFIG;

window.getCurrentUser = getCurrentUser;
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;

window.createProfile = createProfile;
window.getProfile = getProfile;
window.updateProfile = updateProfile;

window.uploadImage = uploadImage;

window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.showNotification = showNotification;

console.log('✓ Supabase Config Loaded');
