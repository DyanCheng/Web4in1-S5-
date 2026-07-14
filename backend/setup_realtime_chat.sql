-- Supabase Realtime Authorization for CMC Travel chat
-- Run in Supabase SQL Editor, then disable "Allow public access" in Realtime Settings.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cmc chat read broadcast and presence" ON realtime.messages;
DROP POLICY IF EXISTS "cmc chat write broadcast and presence" ON realtime.messages;
DROP POLICY IF EXISTS "cmc staff chat read" ON realtime.messages;
DROP POLICY IF EXISTS "cmc staff chat write" ON realtime.messages;

-- Public lobby: any authenticated app user (JWT user_metadata.user_id claim)
CREATE POLICY "cmc chat read broadcast and presence"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() = 'cmc-travel:lobby'
  AND COALESCE(
    current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'user_id',
    ''
  ) <> ''
);

CREATE POLICY "cmc chat write broadcast and presence"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() = 'cmc-travel:lobby'
  AND COALESCE(
    current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'user_id',
    ''
  ) <> ''
);

-- Staff room: admin, employee, hotel_owner, accountant
CREATE POLICY "cmc staff chat read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() = 'cmc-travel:staff'
  AND COALESCE(
    current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'app_role',
    ''
  ) IN ('admin', 'employee', 'hotel_owner', 'accountant')
);

CREATE POLICY "cmc staff chat write"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.messages.extension IN ('broadcast', 'presence')
  AND realtime.topic() = 'cmc-travel:staff'
  AND COALESCE(
    current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'app_role',
    ''
  ) IN ('admin', 'employee', 'hotel_owner', 'accountant')
);
