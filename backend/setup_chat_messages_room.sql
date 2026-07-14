-- Link realtime room chat to public.chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS room_topic text,
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS sender_avatar text;

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_topic_created
  ON public.chat_messages (room_topic, created_at DESC);

COMMENT ON COLUMN public.chat_messages.room_topic IS 'Supabase Realtime room topic, e.g. cmc-travel:lobby';
