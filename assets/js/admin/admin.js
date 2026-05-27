// ================================================
// ADMIN API FUNCTIONS
// Complete admin operations with Supabase
// ================================================

/**
 * CHECK ADMIN ACCESS
 * Verify if user is admin
 */
async function checkAdminAccess() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, isAdmin: false };

        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            return { success: false, isAdmin: false };
        }

        return { success: true, isAdmin: true, admin: data };
    } catch (error) {
        console.error('Admin check error:', error);
        return { success: false, isAdmin: false };
    }
}

/**
 * GET ALL USERS
 * Get list of all users with pagination
 */
async function getAllUsers(page = 0, limit = 10, search = '') {
    try {
        let query = supabase
            .from('profiles')
            .select('*', { count: 'est' });

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const from = page * limit;
        const to = from + limit - 1;

        query = query.range(from, to).order('created_at', { ascending: false });

        const { data, error, count } = await query;
        if (error) throw error;

        return { success: true, data, count };
    } catch (error) {
        console.error('Get users error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET USER DETAILS
 * Get complete details of a specific user
 */
async function getUserDetails(userId) {
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        const { data: gallery } = await supabase
            .from('gallery_images')
            .select('*')
            .eq('user_id', userId);

        return {
            success: true,
            data: {
                profile,
                galleryImages: gallery || []
            }
        };
    } catch (error) {
        console.error('Get user details error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * BLOCK USER
 * Block a user account
 */
async function blockUser(userId, reason = '') {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                is_blocked: true,
                block_reason: reason || 'Blocked by admin'
            })
            .eq('id', userId)
            .select();

        if (error) throw error;

        // Log admin activity
        await logAdminActivity('BLOCK_USER', userId, `Blocked user: ${reason}`);

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Block user error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * UNBLOCK USER
 * Unblock a user account
 */
async function unblockUser(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                is_blocked: false,
                block_reason: null
            })
            .eq('id', userId)
            .select();

        if (error) throw error;

        await logAdminActivity('UNBLOCK_USER', userId, 'User unblocked');

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Unblock user error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * VERIFY PROFILE
 * Mark profile as verified
 */
async function verifyProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                is_verified: true
            })
            .eq('id', userId)
            .select();

        if (error) throw error;

        await logAdminActivity('VERIFY_PROFILE', userId, 'Profile verified');

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Verify profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * DELETE USER PROFILE
 * Delete a user profile and related data
 */
async function deleteUserProfile(userId, reason = '') {
    try {
        // Delete gallery images first
        const { data: images } = await supabase
            .from('gallery_images')
            .select('image_public_id')
            .eq('user_id', userId);

        if (images && images.length > 0) {
            const imagePaths = images.map(img => img.image_public_id);
            await supabase.storage.from('gallery-images').remove(imagePaths);
        }

        // Delete profile (cascade will handle related records)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        await logAdminActivity('DELETE_PROFILE', userId, `Profile deleted: ${reason}`);

        return { success: true };
    } catch (error) {
        console.error('Delete profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET ALL INTERESTS
 * Get all interest requests with pagination
 */
async function getAllInterests(page = 0, limit = 10, status = '') {
    try {
        let query = supabase
            .from('interests')
            .select(`
                *,
                sender:sender_id(full_name, profile_image_url),
                receiver:receiver_id(full_name, profile_image_url)
            `, { count: 'est' });

        if (status) {
            query = query.eq('status', status);
        }

        const from = page * limit;
        const to = from + limit - 1;

        query = query.range(from, to).order('sent_at', { ascending: false });

        const { data, error, count } = await query;
        if (error) throw error;

        return { success: true, data, count };
    } catch (error) {
        console.error('Get interests error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET ALL IMAGES
 * Get all uploaded images with pagination
 */
async function getAllImages(page = 0, limit = 10, userId = '') {
    try {
        let query = supabase
            .from('gallery_images')
            .select('*, profiles:user_id(full_name, email)', { count: 'est' });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const from = page * limit;
        const to = from + limit - 1;

        query = query.range(from, to).order('uploaded_at', { ascending: false });

        const { data, error, count } = await query;
        if (error) throw error;

        return { success: true, data, count };
    } catch (error) {
        console.error('Get images error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * DELETE IMAGE BY ADMIN
 * Delete any image from gallery
 */
async function deleteImageByAdmin(imageId, imagePath, reason = '') {
    try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('gallery-images')
            .remove([imagePath]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
            .from('gallery_images')
            .delete()
            .eq('id', imageId);

        if (dbError) throw dbError;

        await logAdminActivity('DELETE_IMAGE', null, `Image deleted: ${reason}`);

        return { success: true };
    } catch (error) {
        console.error('Delete image error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET DASHBOARD STATISTICS
 * Get overall platform statistics
 */
async function getDashboardStats() {
    try {
        // Total users
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'est', head: true });

        // Verified profiles
        const { count: verifiedProfiles } = await supabase
            .from('profiles')
            .select('*', { count: 'est', head: true })
            .eq('is_verified', true);

        // Blocked users
        const { count: blockedUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'est', head: true })
            .eq('is_blocked', true);

        // Premium users
        const { count: premiumUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'est', head: true })
            .eq('is_premium', true);

        // Pending interests
        const { count: pendingInterests } = await supabase
            .from('interests')
            .select('*', { count: 'est', head: true })
            .eq('status', 'PENDING');

        // Total interests
        const { count: totalInterests } = await supabase
            .from('interests')
            .select('*', { count: 'est', head: true });

        return {
            success: true,
            stats: {
                totalUsers: totalUsers || 0,
                verifiedProfiles: verifiedProfiles || 0,
                blockedUsers: blockedUsers || 0,
                premiumUsers: premiumUsers || 0,
                pendingInterests: pendingInterests || 0,
                totalInterests: totalInterests || 0
            }
        };
    } catch (error) {
        console.error('Get stats error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET GENDER DISTRIBUTION
 * Get user distribution by gender
 */
async function getGenderDistribution() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('gender');

        if (error) throw error;

        const distribution = {
            Male: 0,
            Female: 0,
            Other: 0
        };

        data.forEach(profile => {
            if (profile.gender in distribution) {
                distribution[profile.gender]++;
            }
        });

        return { success: true, data: distribution };
    } catch (error) {
        console.error('Get gender distribution error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET RELIGION DISTRIBUTION
 * Get user distribution by religion
 */
async function getReligionDistribution() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('religion');

        if (error) throw error;

        const distribution = {};
        data.forEach(profile => {
            if (profile.religion) {
                distribution[profile.religion] = (distribution[profile.religion] || 0) + 1;
            }
        });

        return { success: true, data: distribution };
    } catch (error) {
        console.error('Get religion distribution error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET USER GROWTH
 * Get new users per day/week/month
 */
async function getUserGrowth(period = 'month') {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('created_at');

        if (error) throw error;

        const grouped = {};
        data.forEach(profile => {
            const date = new Date(profile.created_at);
            let key;

            if (period === 'day') {
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                key = time;
            } else if (period === 'week') {
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                key = day;
            } else if (period === 'month') {
                const day = date.getDate();
                key = `Day ${day}`;
            } else if (period === 'year') {
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                key = month;
            }

            grouped[key] = (grouped[key] || 0) + 1;
        });

        return { success: true, data: grouped };
    } catch (error) {
        console.error('Get growth error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET RECENT ACTIVITIES
 * Get recent admin and user activities
 */
async function getRecentActivities(limit = 10) {
    try {
        const { data: logs, error } = await supabase
            .from('admin_activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { success: true, data: logs };
    } catch (error) {
        console.error('Get activities error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * LOG ADMIN ACTIVITY
 * Log admin actions
 */
async function logAdminActivity(action, affectedUserId, details) {
    try {
        const user = await getCurrentUser();
        if (!user) return;

        await supabase
            .from('admin_activity_logs')
            .insert({
                admin_id: user.id,
                action: action,
                affected_user_id: affectedUserId,
                details: details,
                ip_address: await getClientIP(),
                user_agent: navigator.userAgent
            });
    } catch (error) {
        console.error('Log activity error:', error);
    }
}

/**
 * GET CLIENT IP
 * Get client IP address
 */
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * SEARCH USERS
 * Search users by various criteria
 */
async function searchUsers(query, filters = {}) {
    try {
        let dbQuery = supabase
            .from('profiles')
            .select('*', { count: 'est' });

        // Text search
        if (query) {
            dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
        }

        // Apply filters
        if (filters.gender) dbQuery = dbQuery.eq('gender', filters.gender);
        if (filters.minAge) dbQuery = dbQuery.gte('age', filters.minAge);
        if (filters.maxAge) dbQuery = dbQuery.lte('age', filters.maxAge);
        if (filters.religion) dbQuery = dbQuery.eq('religion', filters.religion);
        if (filters.isVerified !== undefined) dbQuery = dbQuery.eq('is_verified', filters.isVerified);
        if (filters.isBlocked !== undefined) dbQuery = dbQuery.eq('is_blocked', filters.isBlocked);

        const { data, error, count } = await dbQuery.limit(50);
        if (error) throw error;

        return { success: true, data, count };
    } catch (error) {
        console.error('Search users error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * CREATE REPORT
 * Create admin report
 */
async function createReport(reportType, details) {
    try {
        const user = await getCurrentUser();

        const { data, error } = await supabase
            .from('report_logs')
            .insert({
                report_type: reportType,
                generated_by: user?.id,
                details: details
            })
            .select();

        if (error) throw error;

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create report error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * EXPORT USERS TO CSV
 * Export user list as CSV
 */
async function exportUsersToCSV() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, age, gender, religion, profession, location, is_verified, is_blocked, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const csv = convertToCSV(data);
        downloadCSV(csv, 'users-export.csv');

        return { success: true };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * CONVERT TO CSV
 * Convert data array to CSV string
 */
function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row =>
            headers.map(field => {
                const value = row[field];
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    return csv;
}

/**
 * DOWNLOAD CSV
 * Download CSV file
 */
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
