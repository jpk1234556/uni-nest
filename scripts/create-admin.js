const bcrypt = require('bcryptjs');

async function createAdminPassword() {
  const password = 'admin123'; // Default admin password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Admin Login Credentials:');
  console.log('Email: admin@uni-nest.ug');
  console.log('Password:', password);
  console.log('Hashed Password for database:', hashedPassword);
  
  return hashedPassword;
}

createAdminPassword().catch(console.error);
