const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");

const validarJWT = async (req, res, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      msg: "No hay token en la petición",
    });
  }

  try {
    //verificación de token
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    //leer el usuario que corresponde al uid
    const usuario = await Usuario.findById(uid);
    //verificar que el usuario exista.
    if (!usuario) {
      return res.status(401).json({
        msg: "Usuario no existe en la base de datos",
      });
    }
    //verificar si el uid está habilidato.
    if (!usuario.estado) {
      return res.status(401).json({
        msg: "Token no válido - usuario con estado:false",
      });
    }

    req.usuario = usuario;

    next();
  } catch (e) {
    console.log(e),
      res.status(401).json({
        msg: "Token no válido",
      });
  }
};

module.exports = {
  validarJWT,
};
