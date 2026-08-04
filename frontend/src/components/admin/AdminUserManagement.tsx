"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ShieldAlert, CheckCircle2, Search, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('user_id, full_name, email, phone, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Lỗi tải dữ liệu người dùng');
    } else if (data) {
      setUsers(data);
    }
    setLoading(false);
  }

  const toggleUserStatus = async (user: any) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    
    // Optimistic update
    setUsers(users.map(u => u.user_id === user.user_id ? { ...u, status: newStatus } : u));
    
    try {
      const response = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.user_id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Cập nhật thất bại');
      }

      if (newStatus === 'banned') {
        toast.success(`Đã khóa tài khoản: ${user.email}`);
      } else {
        toast.success(`Đã mở khóa tài khoản: ${user.email}`);
      }
    } catch (error) {
      // Revert if failed
      setUsers(users.map(u => u.user_id === user.user_id ? { ...u, status: user.status } : u));
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-slate-800 dark:text-slate-100">Quản lý người dùng</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Xem danh sách, khóa và mở khóa tài khoản khách hàng / nhân viên</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Họ và tên</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Email</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Số điện thoại</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{user.full_name || 'Khách vãng lai'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'banned' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      }`}>
                        {user.status === 'banned' ? (
                          <><ShieldAlert className="size-3" /> Đã khóa</>
                        ) : (
                          <><CheckCircle2 className="size-3" /> Hoạt động</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === 'banned' ? (
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40 rounded-lg text-sm font-bold transition-colors"
                        >
                          <UserCheck className="size-4" /> Mở khóa
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/40 rounded-lg text-sm font-bold transition-colors"
                        >
                          <UserX className="size-4" /> Khóa TK
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
