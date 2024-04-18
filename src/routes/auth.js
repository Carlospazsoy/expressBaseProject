const { Router } = require("express");
const {login, signup, users, recover, updateRole, deleteUser, passwordRecovery, change_password, changePassword, } = require("../controllers/auth");
const { authToken, verifyRole, verifyAllRoles } = require("../middlewares/auth");


function auth(app) {
  const authRouter = Router();
  app.use("/v1/auth", authRouter);

  authRouter.get('/users', users)
  authRouter.post("/login", login ); //endpoint 
  authRouter.post('/signup', signup );
  authRouter.get('/recover', authToken, recover ); /* ultima feature para que la sesion se pueda recuperar, implementando middleware que recibe el token al hacer login */
  authRouter.post('/password_recovery', passwordRecovery );
  authRouter.post('/change_password', changePassword);
  authRouter.patch('/update_role/:id', authToken, verifyAllRoles(['ADMIN', 'EDITOR']),  updateRole ); /* ultima feature para que la sesion se pueda recuperar */
  
  authRouter.delete('/delete_user/:id', authToken, verifyAllRoles(['ADMIN']), deleteUser );
  
  // authToken verifica que el token de login es valido y vigente.
  // verifyRole verifica que el token de login corresponde a un usuario con el rol necesario para editar 
  
}

module.exports = auth;
