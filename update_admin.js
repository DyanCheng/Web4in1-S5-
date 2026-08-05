const fs = require('fs');
const path = 'd:/Web4in1-S5-/frontend/src/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add handleApprovePayment
const target1 = "  const handleDeleteBooking = (id: string) => {\n    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;\n    setBookings((prev) => prev.filter((booking) => booking.id !== id));\n  };";
const replace1 = "  const handleApprovePayment = async (paymentCode: string) => {\n    if (!confirm('Duyệt thanh toán này? Khách hàng sẽ thấy mã QR để thanh toán.')) return;\n    try {\n      const response = await fetch(apiUrl(/api/payments//approve), {\n        method: 'POST',\n        headers: adminHeaders()\n      });\n      if (!response.ok) {\n        const err = await response.json();\n        throw new Error(err.message || 'Lỗi khi duyệt');\n      }\n      await fetchData();\n    } catch (err) {\n      alert(err instanceof Error ? err.message : 'Lỗi khi duyệt');\n    }\n  };\n\n  const handleDeleteBooking = (id: string) => {\n    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;\n    setBookings((prev) => prev.filter((booking) => booking.id !== id));\n  };";

// 2. Fix the first payment_status span
const target2 =                               <span className={\px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest \\}>
                                {tx.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                              </span>;
const replace2 =                               <span className={\px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest \\}>
                                {tx.payment_status === 'paid' ? 'Đã thanh toán' : tx.payment_status === 'pending_approval' ? 'Chờ duyệt' : 'Chờ thanh toán'}
                              </span>;

content = content.replace(target1, replace1);

// Replace all occurrences of payment_status span
content = content.split(target2).join(replace2);

// 3. Add column to "Lịch sử giao dịch SePay" table
const target3 =                         <th className="px-6 py-4 text-left">Trạng thái</th>
                        <th className="px-6 py-4 text-left">SePay ID</th>
                        <th className="px-6 py-4 text-left">Thời gian</th>
                      </tr>;
const replace3 =                         <th className="px-6 py-4 text-left">Trạng thái</th>
                        <th className="px-6 py-4 text-left">SePay ID</th>
                        <th className="px-6 py-4 text-left">Thời gian</th>
                        <th className="px-6 py-4 text-left">Thao tác</th>
                      </tr>;
content = content.replace(target3, replace3);

const target4 =                             <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{tx.sepay_transaction_id || '—'}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(tx.created_at).toLocaleString('vi-VN')}
                            </td>
                          </tr>;
const replace4 =                             <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{tx.sepay_transaction_id || '—'}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(tx.created_at).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-6 py-4">
                              {tx.payment_status === 'pending_approval' && (
                                <button 
                                  onClick={() => handleApprovePayment(tx.payment_code)}
                                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                                >
                                  Duyệt
                                </button>
                              )}
                            </td>
                          </tr>;
content = content.replace(target4, replace4);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete');
