const { response } = require('express');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');



const userPut = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, password, ...resto } = req.body;

        const usuarioAutenticado = req.usuario;
        const idCoincide = usuarioAutenticado._id.toString() === id;
        const tienePermiso = usuarioAutenticado.role === 'STUDENT_ROLE';

        if (!idCoincide || !tienePermiso) {
            return res.status(403).json({
                msg: 'No tienes permiso para actualizar este usuario',
            });
        }
        const usuario = await User.findByIdAndUpdate(id, resto, { new: true });
        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario no encontrado',
            });
        }

        res.status(200).json({
            msg: 'Se actualizo el perfil',
            usuario,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};




const userDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario no existe'
            });
        }
        const usuarioAutenticado = req.usuario;
        if (usuarioAutenticado._id !== id || usuarioAutenticado.role !== 'STUDENT_ROLE') {
            return res.status(403).json({
                msg: 'Solo maestros pueden eliminar perfiles'
            });
        }
        usuario.estado = false;
        await usuario.save();

        res.status(200).json({
            msg: 'Se elimino el perfil',
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};
 
module.exports = {
    userPut,
    userDelete
}