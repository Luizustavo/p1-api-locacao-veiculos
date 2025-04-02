const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const cors = require("cors");
require("dotenv").config();


const PORT =  3000;

app.use(cors()); 

app.use(express.json());

const pool = mysql.createPool({
  host: "servermysqlcn1.mysql.database.azure.com",
  user: "userdb",
  password: "admin@123",
  database: "luizgustavo",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* ------------------- ROTAS DE VEÍCULOS ------------------- */

// Cadastro de novo veículo
app.post("/vehicles", async (req, res) => {
  const { brand, model, year, licensePlate, available, dailyRate } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO vehicles (brand, model, year, licensePlate, available, dailyRate) VALUES (?, ?, ?, ?, ?, ?)",
      [brand, model, year, licensePlate, available, dailyRate]
    );
    res.status(201).json({
      id: result.insertId,
      brand,
      model,
      year,
      licensePlate,
      available,
      dailyRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Busca de veículos com filtros opcionais
app.get("/vehicles", async (req, res) => {
  const { brand, model, dailyRate, available } = req.query;
  let query = "SELECT * FROM vehicles WHERE 1=1";
  let params = [];

  if (brand) {
    query += " AND brand = ?";
    params.push(brand);
  }
  if (model) {
    query += " AND model = ?";
    params.push(model);
  }
  if (dailyRate) {
    query += " AND dailyRate = ?";
    params.push(dailyRate);
  }
  if (available) {
    query += " AND available = ?";
    params.push(available);
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
  const { brand, model, year, licensePlate, available, dailyRate } = req.body;
  try {
    await pool.query(
      "UPDATE vehicles SET brand = ?, model = ?, year = ?, licensePlate = ?, available = ?, dailyRate = ? WHERE id = ?",
      [brand, model, year, licensePlate, available, dailyRate, id]
    );
    res.json({ id, brand, model, year, licensePlate, available, dailyRate });
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
  const { name, email, phone, document, address } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO clients (name, email, phone, document, address) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, document, address]
    );
    res
      .status(201)
      .json({ id: result.insertId, name, email, phone, document, address });
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
  const { name, email, phone, document, address } = req.body;
  try {
    await pool.query(
      "UPDATE clients SET name = ?, email = ?, phone = ?, document = ?, address = ? WHERE id = ?",
      [name, email, phone, document, address, id]
    );
    res.json({ id, name, email, phone, document, address });
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
      "SELECT * FROM rentals WHERE customerId = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- ROTAS DE LOCAÇÕES ------------------- */

// Listagem de locações
app.get("/rentals", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rentals");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criação de nova locação
app.post("/rentals", async (req, res) => {
  const { vehicleId, customerId, startDate, endDate, totalValue } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO rentals (vehicleId, customerId, startDate, endDate, totalValue) VALUES (?, ?, ?, ?, ?)",
      [vehicleId, customerId, startDate, endDate, totalValue]
    );
    res.status(201).json({
      id: result.insertId,
      vehicleId,
      customerId,
      startDate,
      endDate,
      totalValue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualização de locação
app.put("/rentals/:id", async (req, res) => {
  const { id } = req.params;
  const { vehicleId, customerId, startDate, endDate, totalValue } = req.body;
  try {
    await pool.query(
      "UPDATE rentals SET vehicleId = ?, customerId = ?, startDate = ?, endDate = ?, totalValue = ? WHERE id = ?",
      [vehicleId, customerId, startDate, endDate, totalValue, id]
    );
    res.json({ id, vehicleId, customerId, startDate, endDate, totalValue });
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
