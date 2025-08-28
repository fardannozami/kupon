/*
  # Add function to reset coupon number sequence

  1. Functions
    - `reset_coupon_number_sequence()` - Resets the coupon number sequence to 1
*/

-- Function to reset coupon number sequence
CREATE OR REPLACE FUNCTION reset_coupon_number_sequence()
RETURNS void AS $$
BEGIN
  -- Reset the sequence to start from 1
  ALTER SEQUENCE coupon_number_seq RESTART WITH 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_coupon_number_sequence() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_coupon_number_sequence() TO anon;