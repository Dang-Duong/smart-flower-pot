import 'dotenv/config';
import jwt from 'jsonwebtoken';

const deviceId = process.argv[2];

if (!deviceId) {
  console.error('Usage: npm run generate-token <deviceId>');
  console.error('Example: npm run generate-token flower-pot-01');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in .env file');
  process.exit(1);
}

const token = jwt.sign({ deviceId }, process.env.JWT_SECRET);
// No expiry — device token is permanent until manually revoked via secret rotation

console.log(`\nDevice token for "${deviceId}":\n`);
console.log(token);
console.log('\nUse in the Authorization header:');
console.log(`Authorization: Bearer ${token}\n`);
