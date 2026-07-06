const fs = require('fs');
let content = fs.readFileSync('src/app/hotel/page.tsx', 'utf8');

const regex = /<AlertDialogAction[^>]*>[\s\S]*?<\/AlertDialogAction>/g;

content = content.replace(regex, (match) => {
  if (match.includes('setNotice') && match.includes('CMC Travel')) {
    return `<AlertDialogAction
                            onClick={() => {
                              addToCart({
                                itemType: 'hotel',
                                hotelId: selectedHotel?.id,
                                hotelName: selectedHotel?.name,
                                roomId: selectedRoom?.id,
                                title: \`\${selectedHotel?.name} - \${selectedRoom?.name}\`,
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
                            }}
                          >
                            Xác nhận đặt
                          </AlertDialogAction>`;
  }
  return match;
});

fs.writeFileSync('src/app/hotel/page.tsx', content, 'utf8');
