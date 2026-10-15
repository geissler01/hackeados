export function generatePasswordsPool(count: number = 30): string[] {
  const prefixes = [
    'FIREWALL', 'QUANTUM', 'MAINFRAME', 'CIPHER', 'ROOT',
    'GLITCH', 'CYBER', 'NEXUS', 'BYTE', 'SHADOW',
    'SYNAPSE', 'VORTEX', 'VECTOR', 'TITAN', 'PROXY',
    'DAEMON', 'PULSE', 'ECHO', 'HYDRA', 'SPECTRE',
    'ZERO', 'MATRIX', 'ORBIT', 'ENIGMA', 'KRONOS'
  ];
  const suffixes = ['X', '01', '99', 'SEC', 'KEY', 'CORE', 'NET', 'SYS', 'PASS', '77', 'ROOT', 'SYNC', 'HEX', 'LOCK'];
  const pool = new Set<string>();

  while (pool.size < count) {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    pool.add(`${p}_${s}`);
  }
  return Array.from(pool);
}
