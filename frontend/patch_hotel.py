import sys, re
with open('src/app/hotel/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { useAuth } from '@/contexts/AuthContext';", "import { useAuth } from '@/contexts/AuthContext';\nimport { useCart } from '@/contexts/CartContext';")
content = content.replace("const { user } = useAuth();", "const { user } = useAuth();\n  const { addToCart } = useCart();")

new_action = '''onClick={() => {
                              addToCart({
                                itemType: 'hotel',
                                hotelId: selectedHotel?.id,
                                hotelName: selectedHotel?.name,
                                roomId: selectedRoom?.id,
                                title: `${selectedHotel?.name} - ${selectedRoom?.name}`,
                                image: selectedRoom?.image || selectedHotel?.image,
                                price: (selectedRoom?.price || 0) + (selectedRoom?.taxAndFee || 0),
                                quantity: roomQuantity,
                                date: format(displayFromDate, 'yyyy-MM-dd'),
                                checkOutDate: format(displayToDate, 'yyyy-MM-dd'),
                                guests: adults,
                                children: children
                              });
                              setSelectedRoom(null);
                              setShowConfirmModal(false);
                              router.push('/checkout');
                            }}'''

content = re.sub(r'onClick=\{\(\) => \{\s*setNotice\(`.*?thAnh cA\'ng.*?`\);\s*setSelectedRoom\(null\);\s*setShowConfirmModal\(false\);\s*\}\}', new_action, content, flags=re.DOTALL)

with open('src/app/hotel/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
