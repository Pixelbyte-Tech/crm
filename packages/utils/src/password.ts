/**
 * Generates a secure password with the specified length
 * @param length The number of characters to generate the password with
 */
export function securePassword(length: number = 8): string {
  const numbers = '0123456789';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const specialChars = '!@#$%^~*_.';

  const allChars = numbers + uppercase + lowercase + specialChars;

  // Ensure we have at least one of each required type
  let password = '';
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill the rest with random characters from all available chars
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns (first chars always being number, uppercase, special)
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
