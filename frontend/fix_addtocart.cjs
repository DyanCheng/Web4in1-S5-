const fs = require('fs');

let content = fs.readFileSync('src/app/hotel/page.tsx', 'utf-8');

const oldAddToCart = /addToCart\(\{([\s\S]*?)guests: adults,([\s\S]*?)children: children\s*\}\);/;

const newAddToCart = `const nights = Math.max(1, Math.round((displayToDate.getTime() - displayFromDate.getTime()) / (1000 * 60 * 60 * 24)));
                              addToCart({$1guests: adults,$2children: children,
                                  totalNights: nights
                                });`;

content = content.replace(oldAddToCart, newAddToCart);

fs.writeFileSync('src/app/hotel/page.tsx', content);
