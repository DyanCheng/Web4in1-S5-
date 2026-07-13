-- Allow backend (Supabase service_role REST) to write auth audit logs
GRANT SELECT, INSERT ON public.user_login_logs TO service_role;
GRANT SELECT, INSERT ON public.user_registration_logs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.user_login_logs_login_log_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.user_registration_logs_reg_log_id_seq TO service_role;
