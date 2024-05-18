const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  // console.log("Server succesfully running in port ", PORT);
});

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
  },
});

app.post("/books", async (req, res) => {
  const { name, author, year } = req.body;
  console.log("BODY:::", req.body);

  async function addNewBook(name, author, year) {
    const client = await pool.connect();
    try {
      const insertQuery = `INSERT INTO books (name, author, year) VALUES ($1, $2, $3)`;
      const values = [name, author, year];
      await client.query(insertQuery, values);
    } finally {
      client.release();
    }
  }

  addNewBook(name, author, year)
    .then((data) => res.send({ message: "Book added succesfully" }))
    .catch((err) => console.log(err));
});

app.get("/books", async (req, res) => {
  async function getAllBooks() {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM books");
      return result.rows;
    } finally {
      client.release();
    }
  }

  const books = await getAllBooks();

  res.send({ books: books });
});

app.get("/", (req, res) => {
  res.send({ message: "Hello World!" });
});
