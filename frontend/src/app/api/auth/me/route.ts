import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json({ message: 'Thiếu thông tin user_id hoặc email' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ message: 'Cấu hình máy chủ lỗi' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase.from('users').select('status');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({ status: data.status });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Lỗi server' }, { status: 500 });
  }
}
