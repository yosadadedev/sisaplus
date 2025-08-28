-- Setup Profile Auto-Creation Trigger
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- untuk mengaktifkan pembuatan profile otomatis saat user registrasi

-- Function to handle new user signup and create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    address,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'whatsapp'),
    NEW.raw_user_meta_data->>'address',
    COALESCE((NEW.raw_user_meta_data->>'status')::user_role, 'receiver')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify trigger creation
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test query to check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;