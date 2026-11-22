const mysql = require('mysql2/promise');

async function seedPairs() {
  const conn = await mysql.createConnection('mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test');
  const [insts] = await conn.query('SELECT id, name FROM institutions ORDER BY id ASC');
  
  for (let i = 0; i < insts.length; i++) {
    for (let j = i + 1; j < insts.length; j++) {
      const a = insts[i].id;
      const b = insts[j].id;
      const ch = `conv-inst-${a}-inst-${b}`;
      
      const [existing] = await conn.query(
        'SELECT id FROM conversations WHERE channel_identifier = ?',
        [ch]
      );
      
      if (existing.length === 0) {
        await conn.query(
          'INSERT INTO conversations (channel_identifier, institution_a_id, institution_b_id, status, created_at, last_message_at) VALUES (?, ?, ?, "ACTIVE", NOW(3), NOW(3))',
          [ch, a, b]
        );
      }
    }
  }
  
  const [convs] = await conn.query('SELECT COUNT(*) as count FROM conversations');
  console.log('Total conversations now in database:', convs[0].count);
  await conn.end();
}

seedPairs().catch(console.error);
