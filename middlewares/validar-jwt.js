const jwt = require('jsonwebtoken');
const User = require('../models/user');

const validarJWT = async (req, res, next) => {
    const token = req.header('x-token');
    if (!token) {
        return res.status(401).json({
            msg: 'No tiene token'
        });
    }
    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const usuario = await User.findById(uid);
        if (!usuario) {
            return res.status(401).json({
                msg: 'Usuario no existe'
            });
        }
        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Usuario desactivado'
            });
        }
        req.usuario = usuario;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        });
    }
}

module.exports = {
    validarJWT
}
