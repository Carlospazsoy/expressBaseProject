const express = require('express')
const cors = require('cors')
const { port } = require('./config')
const connect  = require('./config/db')

const app = express() /// se crea app
connect() //  se conecta a DB

app.use(cors({
  origin: ['http://localhost:5173'] // el de vite
}))
//Middleware para cnvertir todas las consultas recibidas en un json
app.use(express.json())

app.get("/", (req, res) => {
  return res.json({
    message: "Aplicacion en ejecución 👍🏽",
  });
});

app.listen(port, () => {
  console.log('Escuchando en el puerto: http://localhost:' + port);
} )
