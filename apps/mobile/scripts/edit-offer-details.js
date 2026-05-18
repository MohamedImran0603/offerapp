const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/offer/[id].tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `{/* Terms */}`;
const replacement = `{/* Price History Section */}
            <PriceHistoryChart 
              currentPrice={offer.newPrice || offer.price || 0} 
              oldPrice={offer.oldPrice} 
              title={offer.title} 
            />

            {/* Terms */}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Offer detail file successfully modified!');
} else {
  console.log('❌ Target terms string not found in details file.');
}
