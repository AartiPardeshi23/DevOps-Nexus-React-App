const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const pool = require("./db");

const app = express();
app.use(bodyParser.json());

/* Serve frontend */
app.use(express.static(path.join(__dirname, "frontend")));

/* Explicit root route */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

/* Create table if not exists */
pool.query(`
  CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(100)
  );
`);

/* CREATE */
app.post("/employees", async (req, res) => {
  const { name, role } = req.body;
  const result = await pool.query(
    "INSERT INTO employees (name, role) VALUES ($1, $2) RETURNING *",
    [name, role]
  );
  res.json(result.rows[0]);
});

/* READ */
app.get("/employees", async (req, res) => {
  const result = await pool.query("SELECT * FROM employees");
  res.json(result.rows);
});

/* DELETE */
app.delete("/employees/:id", async (req, res) => {
  await pool.query("DELETE FROM employees WHERE id=$1", [req.params.id]);
  res.send("Deleted");
});

app.listen(3000, () => {
  console.log("✅ Node app running on port 3000");
});
