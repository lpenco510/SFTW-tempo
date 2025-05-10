
-- Consulta para verificar políticas RLS
SELECT n.nspname as schema,
       c.relname as table_name,
       CASE WHEN c.relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_enabled,
       pol.polname as policy_name,
       pol.polcmd as policy_command,
       pol.polpermissive as policy_permissive,
       pg_get_expr(pol.polqual, pol.polrelid) as policy_expression
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy pol ON c.oid = pol.polrelid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY schema, table_name, policy_name;
