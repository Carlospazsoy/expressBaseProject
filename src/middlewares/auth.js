// atencion a al importacion de libreria para crear middlewares personalizados, esta es una funcionalidad que viene de npm i express-jwt --save mas no de la libreria jwt.
const {expressjwt} = require('express-jwt') //  npm install express-jwt
const { jwtKey } = require('../config') // npm install jsonwebtoken ya instalado

// Funcion que recibira la peticion para extraer token creado en el logeo de sesión. Solo si el usuario presenta el token tendra autorizacion de realizar mas peticiones en el servidor

const getToken = (req) => {
  const {authorization} = req.headers
  /// Verificar que concida el token
  if (authorization) {
    // bearer, token separar por espacios el header 'autorizacion' dividiendolos en elementos de un array
      const [type, token] = authorization.split(' ') // ['Bearer', 'eyJH ...' ]

      //si esto es verdadero entonces regresa el token, sino null
      return (type === 'Bearer' || type === 'Token') ? token : null 
    
  }

  return null
}
  // Creacion del middleware de autenticaion
  // Su objetivo es validar que el token que firmaste en controllers sea VALIDO Y VIGENTE . Utiliza expressjwt para validar un token creado con la libreria jwt 
const authToken = expressjwt({
  // userProperty: 'user', // indica en que propiedad del cuerpo de la solicitud buscar, PERO resulto darnos undefined y terminasmos usando   console.log(req.auth) en ves de   console.log(req.user)
  secret: jwtKey,       // Debe ser la misma con la que se firmó en controllers
  algorithms: ['HS256'], // Verifica que la estructura de tu token corresponda a un token creado con SHA-256
  getToken  // se utiliza la funcion getToken definida anteriormente. Este es el token en si a validar
            // segun chat gpt esta funcion podria talves ser mas corta algo como:  getToken: (req) => req.headers.authorization
})

// Creacion de middleware gestionador de error
// El objetivo de este middleware es crear una pequeño json de respuesta personalizada y despues mostrar directamente el error
const handleAuthError = (error,req, res, next) => {
  console.log(" mensaje del handleAuthError en el middleware");
  if (error.name === "UnauthorizedError") { 
    return res.status(401).json({
      success: false,
      message: "No autorizado o no proporcionaste un token"
    })
  } else {
    next(error)
  }
}

//Middleware custom
const verifyRole = (req, res, next ) => {
  console.log(req.auth);
  if (req.auth.role!=="ADMIN") {
    return res.status(403).json({
      succes: false,
      message: "No tienes el rol necario para realizar este cambio según el middleware"
    })  
  }
  return next()
}

//Middleware que verifica cualquier rol
const verifyAllRoles = (allowedRoles) => { //allowedRoles es un array de roles
  return (req,res,next) => {
    if (allowedRoles  .includes(req.auth.role) ) {  // si el usuario tiene un rol de los que estan permitidos continua
      return next()
    }
    
    return res.status(403).json({
      succes: false,
      message: "No tienes el rol necario para realizar este cambio según el middleware"
    })   
      
    }
  }


module.exports = {
  authToken, //se usara en rutas
  handleAuthError, //se usar en index.js
  verifyRole,
  verifyAllRoles
}

// El objetivo de este middleware es gestionar que el usuario tenga autorizacion validando que este proprcione un bearer token correcto
// El Segundo middleware se encarga de que salgan mensajes explicatorios si hay algun error de autenticacion