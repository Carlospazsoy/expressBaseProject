//importar jwt npm i jsonwebtoken
const jwt = require("jsonwebtoken"); 
const { jwtKey } = require("../config");

const User = require("../model/User");
const bcrypt = require("bcrypt"); // npm i bcrypt  es externa
const { sendEmail } = require("../libs/email"); // importa configuración de sendgrid, sendmail es ahora utlizable como un metodo sendEmail(valor1,valor2,valor3) se rellenara con valores que pueden o no venir del req.body
const {randomUUID} = require('crypto') //es nativa de node

const users = async (req, res) => {
  try {
    const allUsers = await User.find()
    
    return res.status(200).json({
      success: true,
      data: allUsers
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se encontraron usuarios",
    });
  }
}

// el objetivo del login es que el usuario obtenga un token que le permita hacer solicitudes a la aplicacion 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //Si el email y el password no estan definidos
    if (!(email && password)) {
      return res.status(400).json({
        success: false,
        message: "Las credenciales no coinciden",
      });
    }

    //encontrar si hay un documento de algun usuario  que coincida con el email ingresado por el usuario.
    const user = await User.findOne({ email });
    console.log(user);

    //Si el email y el password comparados son iguales( En bcrypt el password no hasheado se compara con el password hasheado con bcrypt almacenado en la DB), el password comparado (texto plano) se concatena con el salt unico y se le aplica un algoritmo que finalmente se espera que coincida con el password hasheado(password unico) que hay almacenado en al DB relacionado a este usuario, asi como se protege al usuario sin transferir este dato).
    //Si la comparacion de password no es valida nisiquiera se procede a tokenisar, pero si si es valida se procede a tokenisar sin el password. Este token sirve para mantener sesion iniciada
    if (user && email === user.email && bcrypt.compareSync(password, user.password)) 
      {
      //asegurarse que tu documento sea un string o json
      const userJSON = user.toJSON();
      //omitir password en el payload antes de tokenisar
      delete userJSON.password;

      // Firmar un Token
      //tokenisar payload, asignar un secretKey y optionales: tiempo de expiracion, algorithm, callback
      const token = jwt.sign(userJSON, jwtKey, { expiresIn: "7d" });

      return res.status(202).json({
        success: true,
        message: "Usuario loggeado correctamente",
        data: userJSON,  //muestra toda la info del usuario definida en el model menos el password
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Credenciales no coinciden",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// ya no usar .create
const signup = async (req, res) => {
  try {

    //delete req.body.role
    // Se extrae el body de la solicitud a la ves que se crea un objeto del modelo User
    const user = new User(req.body);

    const validationResult = user.validateSync();
    console.log("Error de validación: ", validationResult?.errors)

    // pese a que validatesync nos devuelva los errores existntes este no se sincronisa automaticamente con el bloque catch por eso ponemos manualmente este return 
    if (validationResult?.errors) {   /* si validation result existe (es undefined) */
      return res.status(400).json({
        success: false,
        message: Object.keys(validationResult.errors).map((key) => {return {property: key, message: validationResult.errors[key].message}}) // Nos muestra la key o propiedad qeu contiene el error. Es una respuesta filtrada de les respuesta larga que daba ValidationResult.error
      })
    }
    // Se todo salio correcto y sin errores se indica el campo a hashear
    user.hashPassword(req.body.password);
    // Guarda en mongoDb el objeto modificado
    // encapsular el await en parentesis asegura que se haga primero eso
    const userSaved = (await user.save()).toJSON();
    delete userSaved.password
    return res.status(201).json({
      success: true,
      message: "Usuario registrado con éxito",
      data: userSaved,
    });
  } catch (error) {
    console.log(error);
    if (error.code===11000) {  //es el error que la consola nos enseña cuando hay duplicados de esta manera especificamos una respuesta para este error partcular y en seguida se configura un mensaje generico para cualquier otro error
      return res.json({
        success: false,
        message: "Usuario ya registrado",
        error: error.message,
      });
    }else{
      return res.json({
        success: false,
        message: "Ocurrio un error. Intente mas tarde"
      })
    }
    
  }
};
// Recuperar la sesión aunque se actualice la pagina
const recover_session =(req, res) => {
  console.log(req.auth); /* auth es un metodo de  express-jwt lo encontro en la documentacion , muestra los credenciales del token S22 dentro de un objeto 3:18:00*/
  return res.json({
    success:true,
    data:req.auth
  })
}
// lo que hace es accedera aun jason con toda la info del usuario

const updateRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // este trabajo es ahora del middleware
   /*  if (req.auth.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "No tienes un rol con los permisos necesarios",
      });
    } */

    // Actualizar el rol del usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true } // Devuelve el documento actualizado
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "No se encontró al usuario",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rol de usuario actualizado correctamente",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar si el usuario tiene permisos de administrador
    if (req.auth.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "No tienes los permisos necesarios para eliminar al usuario",
      });
    }

    // Eliminar al usuario
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "No se encontró al usuario",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado correctamente",
      data: deletedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const passwordRecovery = async (req, res) => {
  try {
    const { email } = req.body;
    const passwordRecoveryCode = randomUUID();
    console.log('Este es mi password de recuperación: ' + passwordRecoveryCode);
    // se guarda UUID en la DB
    //encontrar mediante email proprcionado y el amacenar el passwordRecoveryCode generado
    const user = await User.findOneAndUpdate({email}, {passwordRecoveryCode})
    const result = await sendEmail(email, "ejemplo email  de recuperación", `Tu codigo de recuperación es: ${passwordRecoveryCode}` + ' \n Puedes ingresarlo en la siguiente url:  http://localhost:5173/v1/forgotten-password/change-password' ); //  + https://midominio.com/password_recovery?code=' + passwordRecoveryCode)
    console.log(result); 

    //notese como no es requisito utilizar la variable user para que se ejecute su igualdad
    
    // Manejar la respuesta de sendEmail
    if (result.success) {
      return res.json({
        success: true,
        message: "Se ha enviado el correo de recuperación",
        //user: user //NO SE DEBE VER
      });
    } else {
      return res.json({
        success: false,
        message: "Hubo un error al enviar el correo de recuperación"
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
// El objetivo de esta función es mandar un correo de recuperación, verificar que existe el correo , proporcionar un codigo de acceso y redireccionar a la ruta de recuperación

const changePassword = async (req, res) => {
  const {code, newPassword} = req.body
try {
    //consulta de comparacion del UUID ingresado con el UUID almacenado en la DB y nos aseguramos que estamos sobreescribiendo con new: true
  //const user = await User.findOneAndUpdate({passwordRecoveryCode: code},{password: newPassword, passwordRecoveryCode: null},{ new: true} ) // esta opción no se uso porque expondria el password por ello hcimos la version de abajo qu enos ermite hashearlo
  const user = await User.findOne({passwordRecoveryCode: code})
  if (user) { 
    //el password del usuario encontrado se actualiza por el password que se proprciona en la solicitud
     //user.password = newPassword
     user.passwordRecoveryCode = null // solo nos servia pra encontrar el ususario
     user.hashPassword(newPassword)
     const newUser = await user.save()
     console.log(newUser);
     
     return res.status(201).json({
      success: true,
      message: "Password modificado con éxito"
    })
  }else{
    return res.status(400).json({
      success: false,
      message: "Codigo o URL invalido"
    })
  }
} catch (error) {
  console.log(error)
        return res.json({
            success: false,
            message: error.error
        })
}
  
}



module.exports = {
  users,
  login,
  signup,
  recover_session,
  updateRole, // siempre y cuando tengamos un rol administrador
  deleteUser,
  passwordRecovery,
  changePassword
};
