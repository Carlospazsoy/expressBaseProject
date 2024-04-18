const mongoose = require("mongoose"); // es externa , https://www.npmjs.com/package/mongoose
//const crypto = require('crypto')
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name required"], // campo requerido/ exigido para poder crear un modelo
  },
  lastName: {
    type: String,
    required: [true, "Last name required"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "E-mail required"],
  },
  password: {
    type: String,
    required: [true, "Password required"],
  },
  passwordRecoveryCode: String,
  role: {
    type: String,
    enum: ["ADMIN", "EDITOR", "REGULAR"],
    default: "REGULAR "
  }
});
userSchema.methods.hashPassword = function (password) {
  // Uso de crypto que es nativo pero mas complejo
  /*   const salt = crypto.randomBytes(16).toString('hex')
  this.password = crypto.pbkdf2sync(password, salt, 10000, 512, 'sha512').toString('hex') */

  // Uso de bcrypt con npm i bcrypt sincrono
  /* const hashing = bcrypt.hashSync(password,1000)
  console.log(hashing); */
  this.password = bcrypt.hashSync(password, 100); //el 100 es seguridad aceptable todavia y cargara mas rapido
};

const User = mongoose.model("User", userSchema);

module.exports = User;
