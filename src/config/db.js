const mongoose = require('mongoose')
const { dbName } = require('.')


const connect = async ()=>{
    const connection = await mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`)
    console.log("Conectados a la BD:", connection.connection.host)
}
 
module.exports = connect

// en alguna semana descubriste que es recomendable agregar un manejo de errores a esta configuraciión std