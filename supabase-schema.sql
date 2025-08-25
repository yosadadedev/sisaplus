-- Sisa Plus App - Supabase SQL Schema
-- Database schema untuk aplikasi food rescue

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE user_role AS ENUM ('donor', 'receiver', 'admin');
CREATE TYPE food_status AS ENUM ('available', 'booked', 'completed', 'expired', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('booking_created', 'booking_confirmed', 'reminder', 'expired');
CREATE TYPE price_type AS ENUM ('free', 'paid');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'receiver',
  expo_push_token TEXT,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_donations INTEGER DEFAULT 0,
  total_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foods table
CREATE TABLE foods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'porsi',
  image_urls TEXT[],
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_time_start TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_time_end TIMESTAMP WITH TIME ZONE NOT NULL,
  expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status food_status DEFAULT 'available',
  dietary_info TEXT[], -- ['halal', 'vegetarian', 'vegan', 'gluten-free']
  allergen_info TEXT[], -- ['nuts', 'dairy', 'eggs', 'seafood']
  preparation_notes TEXT,
  price_type price_type DEFAULT 'free',
  price DECIMAL(10,2) DEFAULT 0.00,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_pickup_time CHECK (pickup_time_end > pickup_time_start),
  CONSTRAINT valid_expiry CHECK (expired_at > pickup_time_start),
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT price_consistency CHECK (
    (price_type = 'free' AND price = 0) OR 
    (price_type = 'paid' AND price > 0)
  )
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quantity_requested INTEGER NOT NULL DEFAULT 1,
  pickup_time TIMESTAMP WITH TIME ZONE,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  whatsapp_chat_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_quantity_requested CHECK (quantity_requested > 0),
  CONSTRAINT no_self_booking CHECK (receiver_id != donor_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table (for rating system)
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per booking per reviewer
  UNIQUE(booking_id, reviewer_id)
);

-- Create indexes for performance optimization
-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_profiles_expo_token ON profiles(expo_push_token) WHERE expo_push_token IS NOT NULL;

-- Foods indexes
CREATE INDEX idx_foods_donor_id ON foods(donor_id);
CREATE INDEX idx_foods_status ON foods(status);
CREATE INDEX idx_foods_expired_at ON foods(expired_at);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_location ON foods USING GIST(pickup_location);
CREATE INDEX idx_foods_created_at ON foods(created_at DESC);
CREATE INDEX idx_foods_status_expired ON foods(status, expired_at) WHERE status = 'available';

-- Bookings indexes
CREATE INDEX idx_bookings_food_id ON bookings(food_id);
CREATE INDEX idx_bookings_receiver_id ON bookings(receiver_id);
CREATE INDEX idx_bookings_donor_id ON bookings(donor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire old foods
CREATE OR REPLACE FUNCTION expire_old_foods()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE foods 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'available' 
    AND expired_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby foods
CREATE OR REPLACE FUNCTION get_nearby_foods(
  user_location GEOGRAPHY,
  radius_meters INTEGER DEFAULT 5000,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  quantity INTEGER,
  pickup_address TEXT,
  expired_at TIMESTAMP WITH TIME ZONE,
  distance_meters DOUBLE PRECISION,
  donor_name TEXT,
  donor_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.title,
    f.description,
    f.category,
    f.quantity,
    f.pickup_address,
    f.expired_at,
    ST_Distance(f.pickup_location, user_location) as distance_meters,
    p.full_name as donor_name,
    p.rating as donor_rating
  FROM foods f
  JOIN profiles p ON f.donor_id = p.id
  WHERE f.status = 'available'
    AND f.expired_at > NOW()
    AND ST_DWithin(f.pickup_location, user_location, radius_meters)
  ORDER BY distance_meters ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for food listings with donor info
CREATE VIEW food_listings AS
SELECT 
  f.*,
  p.full_name as donor_name,
  p.avatar_url as donor_avatar,
  p.rating as donor_rating,
  p.total_donations as donor_total_donations,
  ST_X(f.pickup_location::geometry) as pickup_longitude,
  ST_Y(f.pickup_location::geometry) as pickup_latitude
FROM foods f
JOIN profiles p ON f.donor_id = p.id;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for foods
CREATE POLICY "Anyone can view available foods" ON foods
  FOR SELECT USING (status = 'available' OR donor_id = auth.uid());

CREATE POLICY "Donors can insert their own foods" ON foods
  FOR INSERT WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Donors can update their own foods" ON foods
  FOR UPDATE USING (donor_id = auth.uid());

CREATE POLICY "Donors can delete their own foods" ON foods
  FOR DELETE USING (donor_id = auth.uid());

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (receiver_id = auth.uid() OR donor_id = auth.uid());

CREATE POLICY "Receivers can create bookings" ON bookings
  FOR INSERT WITH CHECK (receiver_id = auth.uid());

CREATE POLICY "Involved users can update bookings" ON bookings
  FOR UPDATE USING (receiver_id = auth.uid() OR donor_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Insert sample data (optional)
INSERT INTO profiles (id, email, full_name, role, address) VALUES
  ('00000000-0000-0000-0000-000000000001', 'donor@example.com', 'John Donor', 'donor', 'Jakarta Selatan'),
  ('00000000-0000-0000-0000-000000000002', 'receiver@example.com', 'Jane Receiver', 'receiver', 'Jakarta Pusat')
ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profiles with role-based access';
COMMENT ON TABLE foods IS 'Food donations with location and time constraints';
COMMENT ON TABLE bookings IS 'Food booking requests and status tracking';
COMMENT ON TABLE notifications IS 'Push notifications and in-app messages';
COMMENT ON TABLE reviews IS 'User rating and review system';

COMMENT ON COLUMN foods.dietary_info IS 'Array of dietary information tags';
COMMENT ON COLUMN foods.allergen_info IS 'Array of allergen warning tags';
COMMENT ON COLUMN profiles.location IS 'User location for nearby food discovery';
COMMENT ON COLUMN foods.pickup_location IS 'Food pickup location for distance calculation';