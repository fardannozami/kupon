/*
  # Create coupons table for production-ready coupon system

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `coupon_number` (integer, unique, auto-increment)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `status` (text, enum: 'active', 'drawn')
      - `created_at` (timestamp)
      - `drawn_at` (timestamp, nullable)

  2. Security
    - Enable RLS on `coupons` table
    - Add policies for public read access and admin write access
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_number integer UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'drawn')),
  created_at timestamptz DEFAULT now(),
  drawn_at timestamptz
);

-- Create sequence for coupon numbers
CREATE SEQUENCE IF NOT EXISTS coupon_number_seq START 1;

-- Function to auto-assign coupon numbers
CREATE OR REPLACE FUNCTION assign_coupon_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_number IS NULL THEN
    NEW.coupon_number := nextval('coupon_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign coupon numbers
DROP TRIGGER IF EXISTS assign_coupon_number_trigger ON coupons;
CREATE TRIGGER assign_coupon_number_trigger
  BEFORE INSERT ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION assign_coupon_number();

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view coupons)
CREATE POLICY "Anyone can view coupons"
  ON coupons
  FOR SELECT
  TO public
  USING (true);

-- Policy for public insert (anyone can create coupons)
CREATE POLICY "Anyone can create coupons"
  ON coupons
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for admin update (only authenticated users can update)
CREATE POLICY "Authenticated users can update coupons"
  ON coupons
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy for admin delete (only authenticated users can delete)
CREATE POLICY "Authenticated users can delete coupons"
  ON coupons
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_email ON coupons(email);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);