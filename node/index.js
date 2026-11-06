const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

const names = [
  'Wescley',
  'Luiz',
  'Welben',
  'Wesley',
  'Ana',
  'Carlos',
  'Maria',
  'João',
  'Pedro',
  'Full Cycle',
];

const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'nodedb',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
};

let pool;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function connect() {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      pool = mysql.createPool(dbConfig);
      const connection = await pool.getConnection();
      await connection.query(`
        CREATE TABLE IF NOT EXISTS people (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      connection.release();
      console.log('Connected to MySQL');
      return;
    } catch (error) {
      console.log(`MySQL not ready (${attempt}/${maxAttempts}): ${error.message}`);
      if (pool) {
        await pool.end().catch(() => {});
        pool = null;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error('Could not connect to MySQL');
}

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.get('/', async (req, res) => {
  try {
    const name = names[Math.floor(Math.random() * names.length)];
    await pool.query('INSERT INTO people (name) VALUES (?)', [name]);
    const [rows] = await pool.query('SELECT name FROM people ORDER BY id');
    const items = rows.map((row) => `    <li>${escapeHtml(row.name)}</li>`).join('\n');

    res.type('html').send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Full Cycle Rocks!</title>
</head>
<body>
  <h1>Full Cycle Rocks!</h1>
  <ul>
${items}
  </ul>
</body>
</html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

let server;

connect()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function shutdown() {
  if (server) {
    server.close();
  }
  if (pool) {
    await pool.end().catch(() => {});
  }
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
