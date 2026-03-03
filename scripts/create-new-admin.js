const bcrypt = require('bcryptjs');

async function createNewAdminPassword() {
  const email = 'pjulius793@gmail.com';
  const password = 'Juliuspaul793$';
  
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('New Admin Login Credentials:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Hashed Password for database:', hashedPassword);

  return hashedPassword;
}

createNewAdminPassword().catch(console.error);
