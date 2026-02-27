const bcrypt = require('bcryptjs');

// Get password from command line argument or use default
const password = process.argv[2] || 'admin123';

// Generate hash
const hash = bcrypt.hashSync(password, 10);

console.log('\n=================================');
console.log('Password Hash Generator');
console.log('=================================\n');
console.log('Plain Password:', password);
console.log('\nBcrypt Hash:');
console.log(hash);
console.log('\n=================================');
console.log('\nYou can use this hash in your database.');
console.log('Example SQL:');
console.log(`
INSERT INTO users (id, email, firstname, surname, password, role, "createdAt", "updatedAt")
VALUES (
  'super-admin-id',
  'admin@aceportal.com',
  'Super',
  'Admin',
  '${hash}',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
`);
console.log('=================================\n');

