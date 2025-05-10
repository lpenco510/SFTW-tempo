import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { 
    VITE_SUPABASE_URL: !!supabaseUrl, 
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey 
  });
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);

// Test function to check connection
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key present:', !!supabaseAnonKey);
    
    const { data, error } = await supabase.from('test').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error };
    }
    
    console.log('Supabase connection successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error testing Supabase:', error);
    return { success: false, error };
  }
} 

// Function to generate optimized RLS policy SQL
export async function generateOptimizedRLSPolicies() {
  try {
    console.log('Generating optimized RLS policy SQL...');
    
    // This is a template for a database function that can be run to diagnose RLS policies
    // needing optimization
    const diagnosisSql = `
-- Function to optimize auth functions in RLS policies
CREATE OR REPLACE FUNCTION public.optimize_rls_policies()
RETURNS TEXT AS $$
DECLARE
  policy_record RECORD;
  table_record RECORD;
  policy_definition TEXT;
  optimized_definition TEXT;
  result TEXT := '';
BEGIN
  -- Loop through tables with RLS enabled
  FOR table_record IN
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    -- Get policies for each table
    FOR policy_record IN
      SELECT policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = table_record.schemaname
        AND tablename = table_record.tablename
    LOOP
      policy_definition := COALESCE(policy_record.qual::TEXT, '') || COALESCE(policy_record.with_check::TEXT, '');
      
      -- Check if policy contains auth.uid() without being wrapped in (SELECT ...)
      IF policy_definition ~ 'auth\\.(uid|role)\\(\\)' AND 
         policy_definition !~ '\\(\\s*SELECT\\s+auth\\.(uid|role)\\(\\)\\s*\\)' THEN
        
        -- Create optimized version with (SELECT auth.function())
        optimized_definition := regexp_replace(
          policy_definition, 
          'auth\\.(uid|role)\\(\\)', 
          '(SELECT auth.\\1())', 
          'g'
        );
        
        -- Generate SQL to update the policy
        result := result || format(
          'ALTER POLICY %I ON %I.%I USING (%s);%s',
          policy_record.policyname,
          table_record.schemaname,
          table_record.tablename,
          CASE WHEN policy_record.cmd IN ('SELECT', 'DELETE') THEN 
            optimized_definition 
          ELSE 
            policy_record.qual::TEXT 
          END,
          E'\n'
        );
        
        -- Add WITH CHECK clause for INSERT/UPDATE policies
        IF policy_record.cmd IN ('INSERT', 'UPDATE', 'ALL') AND policy_record.with_check IS NOT NULL THEN
          result := result || format(
            'ALTER POLICY %I ON %I.%I WITH CHECK (%s);%s',
            policy_record.policyname,
            table_record.schemaname,
            table_record.tablename,
            optimized_definition,
            E'\n'
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to get optimization SQL
SELECT public.optimize_rls_policies();
`;

    // This SQL can be executed in the Supabase SQL Editor to generate the optimization SQL
    console.log('SQL to run in Supabase SQL Editor:', diagnosisSql);
    
    // In a real application, you might want to execute this with RPC
    // const { data, error } = await supabase.rpc('optimize_rls_policies');
    
    return {
      success: true,
      diagnosisSql
    };
  } catch (error) {
    console.error('Error generating RLS policy optimization SQL:', error);
    return { success: false, error };
  }
} 