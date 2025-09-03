-- SECURITY FIX: Prevent users from modifying their admin status
-- This fixes the privilege escalation vulnerability where users could potentially modify is_admin

-- 1. Update existing RLS policy to exclude is_admin from user updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a more restrictive policy that excludes is_admin field
CREATE POLICY "Users can update own profile (non-admin fields only)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Ensure is_admin cannot be modified by regular users
  (
    -- Either is_admin is not being changed
    is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()) OR
    -- Or the user is already an admin (admins can modify admin status)
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
);

-- 2. Add a constraint to prevent direct manipulation of is_admin for non-admins
-- Create a function to validate admin changes
CREATE OR REPLACE FUNCTION public.validate_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If is_admin is being changed and the user is not already an admin, reject
  IF OLD.is_admin != NEW.is_admin AND OLD.is_admin = false THEN
    -- Check if current user is admin
    IF NOT (SELECT is_admin FROM profiles WHERE id = auth.uid()) THEN
      RAISE EXCEPTION 'Only existing admins can grant admin privileges';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce admin validation
DROP TRIGGER IF EXISTS validate_admin_change_trigger ON public.profiles;
CREATE TRIGGER validate_admin_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.is_admin IS DISTINCT FROM NEW.is_admin)
  EXECUTE FUNCTION public.validate_admin_change();

-- 3. Fix remaining functions with mutable search_path
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_admin FROM public.profiles WHERE id = uid;
$$;