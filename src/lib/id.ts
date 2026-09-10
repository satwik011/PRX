const ALPHABET = 'useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict';

/**
 * 21-char random id. Not cryptographically strong, but the collision space is
 * ~62^21 which is far beyond anything a single user's gym log can reach, and
 * it needs no native module.
 */
export function id(): string {
  let out = '';
  for (let i = 0; i < 21; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
