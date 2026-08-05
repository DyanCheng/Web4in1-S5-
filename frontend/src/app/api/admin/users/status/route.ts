import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json({ message: 'Thiếu thông tin user_id hoặc status' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json({ message: 'Cấu hình máy chủ lỗi' }, { status: 500 });
    }

    // Use service_role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json({ message: error.message || 'Lỗi server' }, { status: 500 });
  }
}
