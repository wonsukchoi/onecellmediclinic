-- Fix selfie_reviews table to add proper foreign key constraint
-- This fixes the "Could not find a relationship between 'selfie_reviews' and 'procedure_id'" error
-- Run this in your Supabase SQL Editor

-- First, check if the constraint already exists
DO $$
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'selfie_reviews_procedure_id_fkey'
        AND table_name = 'selfie_reviews'
    ) THEN
        ALTER TABLE selfie_reviews DROP CONSTRAINT selfie_reviews_procedure_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint';
    END IF;
END $$;

-- Add the proper foreign key constraint
-- This allows NULL values but ensures that non-NULL values reference valid procedures
ALTER TABLE selfie_reviews
ADD CONSTRAINT selfie_reviews_procedure_id_fkey
FOREIGN KEY (procedure_id)
REFERENCES procedures(id)
ON DELETE SET NULL;

-- Verify the constraint was added
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'selfie_reviews'
    AND kcu.column_name = 'procedure_id';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'SELFIE_REVIEWS FOREIGN KEY CONSTRAINT FIXED!';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'The selfie_reviews.procedure_id column now has a proper foreign key constraint.';
    RAISE NOTICE 'Edge function queries should now work correctly.';
    RAISE NOTICE 'Constraint: selfie_reviews.procedure_id -> procedures.id (ON DELETE SET NULL)';
    RAISE NOTICE '===============================================';
END $$;