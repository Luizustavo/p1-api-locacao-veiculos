const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Crie o pool de conexão com o banco de dados Azure MySQL
const pool = mysql.createPool({
  host: "servermysqlcn1.mysql.database.azure.com",
  user: "userdb",
  password: "admin@123",
  database: "luizgustavo", // Defina o nome do seu banco de dados
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* ------------------- ROTAS DE VEÍCULOS ------------------- */

// Cadastro de novo veículo
app.post("/vehicles", async (req, res) => {
  const { marca, modelo, ano, placa, disponibilidade, preco } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO vehicles (marca, modelo, ano, placa, disponibilidade, preco) VALUES (?, ?, ?, ?, ?, ?)",
      [marca, modelo, ano, placa, disponibilidade, preco]
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        marca,
        modelo,
        ano,
        placa,
        disponibilidade,
        preco,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Busca de veículos com filtros opcionais
app.get("/vehicles", async (req, res) => {
  const { marca, modelo, preco, disponibilidade } = req.query;
  let query = "SELECT * FROM vehicles WHERE 1=1";
  let params = [];

  if (marca) {
    query += " AND marca = ?";
    params.push(marca);
  }
  if (modelo) {
    query += " AND modelo = ?";
    params.push(modelo);
  }
  if (preco) {
    query += " AND preco = ?";
    params.push(preco);
  }
  if (disponibilidade) {
    query += " AND disponibilidade = ?";
    params.push(disponibilidade);
  }
  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualização de veículo
app.put("/vehicles/:id", async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, ano, placa, disponibilidade, preco } = req.body;
  try {
    await pool.query(
      "UPDATE vehicles SET marca = ?, modelo = ?, ano = ?, placa = ?, disponibilidade = ?, preco = ? WHERE id = ?",
      [marca, modelo, ano, placa, disponibilidade, preco, id]
    );
    res.json({ id, marca, modelo, ano, placa, disponibilidade, preco });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exclusão de veículo
app.delete("/vehicles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM vehicles WHERE id = ?", [id]);
    res.json({ message: "Veículo deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- ROTAS DE CLIENTES ------------------- */

// Cadastro de novo cliente
app.post("/clients", async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO clients (nome, email, telefone) VALUES (?, ?, ?)",
      [nome, email, telefone]
    );
    res.status(201).json({ id: result.insertId, nome, email, telefone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listagem de clientes
app.get("/clients", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM clients");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualização de cliente
app.put("/clients/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone } = req.body;
  try {
    await pool.query(
      "UPDATE clients SET nome = ?, email = ?, telefone = ? WHERE id = ?",
      [nome, email, telefone, id]
    );
    res.json({ id, nome, email, telefone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exclusão de cliente
app.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM clients WHERE id = ?", [id]);
    res.json({ message: "Cliente deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Histórico de locações do cliente
app.get("/clients/:id/rentals", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM rentals WHERE client_id = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- ROTAS DE LOCAÇÕES ------------------- */

// Criação de nova locação
app.post("/rentals", async (req, res) => {
  const { vehicle_id, client_id, data_inicio, data_fim, valor } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO rentals (vehicle_id, client_id, data_inicio, data_fim, valor) VALUES (?, ?, ?, ?, ?)",
      [vehicle_id, client_id, data_inicio, data_fim, valor]
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        vehicle_id,
        client_id,
        data_inicio,
        data_fim,
        valor,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualização de locação
app.put("/rentals/:id", async (req, res) => {
  const { id } = req.params;
  const { vehicle_id, client_id, data_inicio, data_fim, valor } = req.body;
  try {
    await pool.query(
      "UPDATE rentals SET vehicle_id = ?, client_id = ?, data_inicio = ?, data_fim = ?, valor = ? WHERE id = ?",
      [vehicle_id, client_id, data_inicio, data_fim, valor, id]
    );
    res.json({ id, vehicle_id, client_id, data_inicio, data_fim, valor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancelamento (exclusão) de locação
app.delete("/rentals/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM rentals WHERE id = ?", [id]);
    res.json({ message: "Locação cancelada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
