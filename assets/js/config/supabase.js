/**
 * ═════════════════════════════════════════════════════════════════════════════
 * SUPABASE CONFIGURATION & INITIALIZATION
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * This file initializes and configures Supabase for the MatrimonyHub application.
 * It provides centralized access to database, authentication, and storage services.
 * 
 * IMPORTANT: Update your Supabase credentials below!
 * ═════════════════════════════════════════════════════════════════════════════
 */

// ═════════════════════════════════════════════════════════════════════════════
// SUPABASE CREDENTIALS (UPDATE THESE!)
// ═════════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://rqluzupvnzbkxxfbvjli.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mp_k0ppL3FJ0O5VgA4iwpA_niPLDH7m';

// Initialize Supabase Client
let supabase = null;

try {
    const { createClient } = window.supabase;

    if (!createClient) {
        throw new Error('Supabase library not loaded. Make sure script tag is included.');
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase initialized successfully');
} catch (error) {
    console.error('✗ Supabase initialization error:', error);
    showNotification('Supabase connection failed. Check console for details.', 'error');
}

// ═════════════════════════════════════════════════════════════════════════════
// APPLICATION CONFIGURATION
// ═════════════════════════════════════════════════════════════════════════════

const APP_CONFIG = {
    appName: 'MatrimonyHub',
    appVersion: '1.0.0',
    environment: 'production',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    imageQuality: 0.8,
    itemsPerPage: 10,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes

    // Storage buckets
    storageBuckets: {
        profileImages: 'profile-images',
        adminImages: 'admin-images',
        galleryImages: 'gallery-images'
    },

    // Application features
    features: {
        premiumProfiles: true,
        videoCall: false,
        messaging: true,
        interests: true,
        favorites: true,
        verification: true,
        premiumFeatures: false
    },

    // Admin settings
    admin: {
        role: 'super_admin',
        dashboardRefresh: 5 * 60 * 1000,
        maxActivities: 50
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * PROFILES TABLE OPERATIONS
 */

async function getProfiles(filters = {}) {
    try {
        let query = supabase.from('profiles').select('*');

        if (filters.gender) query = query.eq('gender', filters.gender);
        if (filters.religion) query = query.eq('religion', filters.religion);
        if (filters.location) query = query.eq('location', filters.location);
        if (filters.isVerified) query = query.eq('is_verified', filters.isVerified);
        if (filters.isBlocked === false) query = query.eq('is_blocked', false);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return [];
    }
}

async function getProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

async function updateProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

async function deleteProfile(userId) {
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
    }
}

async function blockUser(userId, block = true) {
    try {
        return await updateProfile(userId, { is_blocked: block });
    } catch (error) {
        console.error('Error blocking user:', error);
        throw error;
    }
}

/**
 * INTERESTS TABLE OPERATIONS
 */

async function getInterests(filters = {}) {
    try {
        let query = supabase.from('interests').select(`
            *,
            sender_profile:sender_id(full_name, profile_image_url),
            receiver_profile:receiver_id(full_name, profile_image_url)
        `);

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.senderId) query = query.eq('sender_id', filters.senderId);
        if (filters.receiverId) query = query.eq('receiver_id', filters.receiverId);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching interests:', error);
        return [];
    }
}

async function createInterest(senderId, receiverId) {
    try {
        const { data, error } = await supabase
            .from('interests')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                status: 'PENDING',
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating interest:', error);
        throw error;
    }
}

async function updateInterestStatus(interestId, status) {
    try {
        const { data, error } = await supabase
            .from('interests')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', interestId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating interest:', error);
        throw error;
    }
}

async function deleteInterest(interestId) {
    try {
        const { error } = await supabase
            .from('interests')
            .delete()
            .eq('id', interestId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting interest:', error);
        throw error;
    }
}

/**
 * GALLERY IMAGES TABLE OPERATIONS
 */

async function getGalleryImages(userId) {
    try {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }
}

async function addGalleryImage(userId, imageUrl) {
    try {
        const { data, error } = await supabase
            .from('gallery_images')
            .insert({
                user_id: userId,
                image_url: imageUrl,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding gallery image:', error);
        throw error;
    }
}

async function deleteGalleryImage(imageId) {
    try {
        const { error } = await supabase
            .from('gallery_images')
            .delete()
            .eq('id', imageId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        throw error;
    }
}

/**
 * FAVORITES TABLE OPERATIONS
 */

async function getFavorites(userId) {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                *,
                favorite_profile:favorite_id(full_name, profile_image_url, location)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
}

async function addFavorite(userId, favoriteId) {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .insert({
                user_id: userId,
                favorite_id: favoriteId,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
}

async function removeFavorite(favoriteId) {
    try {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favoriteId);

        if (error) throw error;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
}

/**
 * REPORT LOGS TABLE OPERATIONS
 */

async function getReports(filters = {}) {
    try {
        let query = supabase.from('report_logs').select(`
            *,
            reported_profile:reported_user_id(full_name, profile_image_url),
            reporter_profile:reporter_user_id(full_name)
        `);

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.reason) query = query.eq('reason', filters.reason);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
}

async function createReport(reportedUserId, reporterUserId, reason, description) {
    try {
        const { data, error } = await supabase
            .from('report_logs')
            .insert({
                reported_user_id: reportedUserId,
                reporter_user_id: reporterUserId,
                reason,
                description,
                status: 'PENDING',
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}

async function updateReportStatus(reportId, status) {
    try {
        const { data, error } = await supabase
            .from('report_logs')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', reportId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating report:', error);
        throw error;
    }
}

/**
 * AUTHENTICATION OPERATIONS
 */

async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
}

/**
 * STORAGE OPERATIONS (Image Upload)
 */

async function uploadImage(file, bucket = 'profile-images') {
    try {
        // Validate file
        if (!file) throw new Error('No file selected');
        if (file.size > APP_CONFIG.maxImageSize) {
            throw new Error(`File size exceeds ${APP_CONFIG.maxImageSize / 1024 / 1024}MB limit`);
        }
        if (!file.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            path: filePath,
            url: publicData.publicUrl,
            bucket
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

async function deleteImage(bucket, path) {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

/**
 * REAL-TIME SUBSCRIPTIONS
 */

function subscribeToProfileUpdates(userId, callback) {
    try {
        const subscription = supabase
            .channel(`profile:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`
                },
                callback
            )
            .subscribe();

        return subscription;
    } catch (error) {
        console.error('Error subscribing to profile updates:', error);
        return null;
    }
}

function subscribeToInterests(userId, callback) {
    try {
        const subscription = supabase
            .channel(`interests:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'interests',
                    filter: `receiver_id=eq.${userId}`
                },
                callback
            )
            .subscribe();

        return subscription;
    } catch (error) {
        console.error('Error subscribing to interests:', error);
        return null;
    }
}

/**
 * UTILITY FUNCTIONS
 */

function getStorageUrl(bucket, path) {
    try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    } catch (error) {
        console.error('Error getting storage URL:', error);
        return null;
    }
}

async function getStats() {
    try {
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true });

        const { count: activeUsers } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('is_blocked', false);

        const { count: premiumUsers } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('is_premium', true);

        return {
            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,
            premiumUsers: premiumUsers || 0
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return { totalUsers: 0, activeUsers: 0, premiumUsers: 0 };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT FOR USE
// ═════════════════════════════════════════════════════════════════════════════

// Make supabase available globally (for backward compatibility)
window.supabaseClient = supabase;
window.appConfig = APP_CONFIG;

console.log('✓ Supabase configuration loaded');
console.log(`✓ App: ${APP_CONFIG.appName} v${APP_CONFIG.appVersion}`);
console.log('✓ All database operations ready');