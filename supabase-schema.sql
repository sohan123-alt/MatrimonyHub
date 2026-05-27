-- ========================================================
-- MATRIMONY PLATFORM - COMPLETE DATABASE SCHEMA
-- PostgreSQL for Supabase
-- ========================================================

-- ========================================================
-- 1. DROP EXISTING TABLES (if needed)
-- ========================================================
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS report_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS interests CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users_metadata CASCADE;

-- ========================================================
-- 2. CREATE PROFILES TABLE (Main User Profile)
-- ========================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    age INTEGER CHECK (age >= 18 AND age <= 100),
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    religion VARCHAR(50),
    education VARCHAR(200),
    profession VARCHAR(100),
    marital_status VARCHAR(50) CHECK (marital_status IN ('Never Married', 'Divorced', 'Widowed')),
    height DECIMAL(5,2),
    weight DECIMAL(6,2),
    bio TEXT,
    location VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Bangladesh',
    phone VARCHAR(20),
    profile_image_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason VARCHAR(255),
    show_phone BOOLEAN DEFAULT FALSE,
    show_email BOOLEAN DEFAULT FALSE,
    looking_for TEXT,
    family_details TEXT,
    caste VARCHAR(100),
    height_unit VARCHAR(10) DEFAULT 'cm',
    profile_views INT DEFAULT 0,
    interests_count INT DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 3. CREATE GALLERY IMAGES TABLE
-- ========================================================
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255),
    image_size INT,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 4. CREATE INTERESTS TABLE
-- ========================================================
CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_users CHECK (sender_id != receiver_id),
    CONSTRAINT unique_interest UNIQUE(sender_id, receiver_id)
);

-- ========================================================
-- 5. CREATE FAVORITES TABLE
-- ========================================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    favorite_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_users CHECK (user_id != favorite_user_id),
    CONSTRAINT unique_favorite UNIQUE(user_id, favorite_user_id)
);

-- ========================================================
-- 6. CREATE ADMIN USERS TABLE
-- ========================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'MODERATOR' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')),
    permissions TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 7. CREATE TASKS TABLE (Admin Tasks)
-- ========================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    task_type VARCHAR(50) DEFAULT 'VERIFICATION' CHECK (task_type IN ('VERIFICATION', 'REVIEW', 'APPROVAL', 'INVESTIGATION')),
    task_status VARCHAR(20) DEFAULT 'PENDING' CHECK (task_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- 8. CREATE PAYMENTS TABLE
-- ========================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('BKASH', 'NAGAD', 'ROCKET', 'BANK_TRANSFER', 'CARD')),
    plan_type VARCHAR(20) CHECK (plan_type IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PAID', 'PENDING', 'FAILED', 'REFUNDED')),
    transaction_id VARCHAR(100),
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    plan_start_date DATE,
    plan_end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- 9. CREATE REPORT LOGS TABLE
-- ========================================================
CREATE TABLE report_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) CHECK (report_type IN ('USER_REGISTRATION', 'PROFILE_VERIFICATION', 'TASK_STATUS', 'PAYMENT_STATUS', 'SYSTEM_ACTIVITY', 'DAILY_STATS')),
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB,
    total_count INTEGER,
    verified_count INTEGER,
    pending_count INTEGER,
    blocked_count INTEGER,
    paid_count INTEGER,
    unpaid_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 10. CREATE ADMIN ACTIVITY LOGS TABLE
-- ========================================================
CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    affected_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 11. CREATE INDEXES FOR PERFORMANCE
-- ========================================================
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_profession ON profiles(profession);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_is_blocked ON profiles(is_blocked);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX idx_interests_sender_id ON interests(sender_id);
CREATE INDEX idx_interests_receiver_id ON interests(receiver_id);
CREATE INDEX idx_interests_status ON interests(status);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_tasks_status ON tasks(task_status);
CREATE INDEX idx_admin_logs_admin_id ON admin_activity_logs(admin_id);

-- ========================================================
-- 12. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 13. RLS POLICIES FOR PROFILES
-- ========================================================

-- View profiles (non-blocked only)
CREATE POLICY "profiles_select_public"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_blocked = FALSE OR auth.uid() = id);

-- Update own profile
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Insert own profile
CREATE POLICY "profiles_insert_own"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Admin can view all
CREATE POLICY "profiles_admin_all"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- ========================================================
-- 14. RLS POLICIES FOR GALLERY IMAGES
-- ========================================================

-- Anyone can view public images
CREATE POLICY "gallery_images_select_public"
    ON gallery_images FOR SELECT
    TO authenticated
    USING (TRUE);

-- Users manage only their own images
CREATE POLICY "gallery_images_manage_own"
    ON gallery_images FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- 15. RLS POLICIES FOR INTERESTS
-- ========================================================

-- Users can view interests sent/received
CREATE POLICY "interests_select_own"
    ON interests FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create interests
CREATE POLICY "interests_insert_own"
    ON interests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- Update interests
CREATE POLICY "interests_update_own"
    ON interests FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id OR auth.uid() = sender_id)
    WITH CHECK (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- ========================================================
-- 16. RLS POLICIES FOR FAVORITES
-- ========================================================

-- Users manage only their own favorites
CREATE POLICY "favorites_manage_own"
    ON favorites FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- 17. RLS POLICIES FOR ADMIN USERS
-- ========================================================

-- Only admins can view
CREATE POLICY "admin_users_admin_only"
    ON admin_users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

-- ========================================================
-- 18. RLS POLICIES FOR TASKS
-- ========================================================

-- Admin can manage tasks
CREATE POLICY "tasks_admin_all"
    ON tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- ========================================================
-- 19. RLS POLICIES FOR PAYMENTS
-- ========================================================

-- Users see their own payments
CREATE POLICY "payments_select_own"
    ON payments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin see all
CREATE POLICY "payments_admin_all"
    ON payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- ========================================================
-- 20. CREATE STORAGE BUCKETS
-- ========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('profile-images', 'profile-images', true),
    ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- 21. STORAGE POLICIES - PROFILE IMAGES
-- ========================================================

CREATE POLICY "profile_images_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_user_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'profile-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "profile_images_user_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'profile-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ========================================================
-- 22. STORAGE POLICIES - GALLERY IMAGES
-- ========================================================

CREATE POLICY "gallery_images_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery-images');

CREATE POLICY "gallery_images_user_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'gallery-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "gallery_images_user_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'gallery-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ========================================================
-- 23. CREATE FUNCTIONS
-- ========================================================

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profile updates
CREATE TRIGGER profile_update_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profile_timestamp();

-- ========================================================
-- 24. SAMPLE DATA (for testing)
-- ========================================================

-- Note: In production, use proper admin account creation flow

-- ========================================================
-- 25. ADMIN SETUP GUIDE
-- ========================================================

/*
TO CREATE ADMIN USER:

1. Create a user in Supabase Auth
2. Run this query:

INSERT INTO admin_users (id, full_name, role, is_active, permissions)
VALUES (
    'USER_ID_HERE',
    'Admin Name',
    'SUPER_ADMIN',
    true,
    ARRAY['manage_users', 'manage_profiles', 'manage_reports', 'manage_payments', 'manage_settings']
);

TO MAKE EXISTING USER ADMIN:

UPDATE admin_users 
SET role = 'ADMIN' 
WHERE id = 'USER_ID_HERE';

*/

-- ========================================================
-- 26. DATABASE QUERIES FOR ADMIN
-- ========================================================

-- Get all users with profile info
-- SELECT p.*, u.email, COUNT(DISTINCT i.id) as interests_count
-- FROM profiles p
-- LEFT JOIN auth.users u ON p.id = u.id
-- LEFT JOIN interests i ON p.id = i.receiver_id AND i.status = 'PENDING'
-- ORDER BY p.created_at DESC;

-- Get dashboard statistics
-- SELECT 
--     (SELECT COUNT(*) FROM profiles) as total_users,
--     (SELECT COUNT(*) FROM profiles WHERE is_verified = true) as verified_users,
--     (SELECT COUNT(*) FROM profiles WHERE is_blocked = true) as blocked_users,
--     (SELECT COUNT(*) FROM interests) as total_interests,
--     (SELECT COUNT(*) FROM interests WHERE status = 'ACCEPTED') as accepted_interests;

-- ========================================================
-- 27. VERIFICATION
-- ========================================================

-- Verify tables created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Verify RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = true;
