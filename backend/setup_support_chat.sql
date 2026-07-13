-- Support 1:1 chat: extend sessions + realtime policies
-- Run after setup_realtime_chat.sql / setup_chat_messages_room.sql

ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS customer_id text,
  ADD COLUMN IF NOT EXISTS customer_avatar text,
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_message_preview text,
  ADD COLUMN IF NOT EXISTS customer_last_read_at timestamptz,
  ADD COLUMN IF NOT EXISTS staff_last_read_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_sessions_customer_id_unique
  ON public.chat_sessions (customer_id)
  WHERE customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at
  ON public.chat_sessions (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON public.chat_messages (session_id, created_at ASC);

COMMENT ON COLUMN public.chat_sessions.customer_id IS 'App user id (one open support thread per customer)';

-- Realtime authorization for support channels
DROP POLICY IF EXISTS "cmc support thread read" ON realtime.messages;
DROP POLICY IF EXISTS "cmc support thread write" ON realtime.messages;
DROP POLICY IF EXISTS "cmc support inbox read" ON realtime.messages;
DROP POLICY IF EXISTS "cmc support inbox write" ON realtime.messages;

-- Customer: own support thread; staff (admin/employee): any support thread
CREATE POLICY "cmc support thread read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() LIKE 'cmc-travel:support:%'
  AND realtime.topic() <> 'cmc-travel:support:inbox'
  AND (
    COALESCE(
      current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'app_role',
      ''
    ) IN ('admin', 'employee')
    OR EXISTS (
      SELECT 1
      FROM public.chat_sessions s
      WHERE ('cmc-travel:support:' || s.session_id::text) = realtime.topic()
        AND s.customer_id = COALESCE(
          current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'user_id',
          ''
        )
    )
  )
);

CREATE POLICY "cmc support thread write"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() LIKE 'cmc-travel:support:%'
  AND realtime.topic() <> 'cmc-travel:support:inbox'
  AND (
    COALESCE(
      current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'app_role',
      ''
    ) IN ('admin', 'employee')
    OR EXISTS (
      SELECT 1
      FROM public.chat_sessions s
      WHERE ('cmc-travel:support:' || s.session_id::text) = realtime.topic()
        AND s.customer_id = COALESCE(
          current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'user_id',
          ''
        )
    )
  )
);

CREATE POLICY "cmc support inbox read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() = 'cmc-travel:support:inbox'
  AND COALESCE(
    current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'app_role',
    ''
  ) IN ('admin', 'employee')
);

CREATE POLICY "cmc support inbox write"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() = 'cmc-travel:support:inbox'
  AND COALESCE(
    current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'app_role',
    ''
  ) IN ('admin', 'employee')
);
