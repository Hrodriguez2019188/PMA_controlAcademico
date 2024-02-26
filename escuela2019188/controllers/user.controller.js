const { response } = require('express');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');

const userDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario no existe'
            });
        }

        // Verificar si el usuario tiene permiso y si es el mismo usuario
        const usuarioAutenticado = req.usuario;
        if (usuarioAutenticado._id !== id || usuarioAutenticado.role !== 'STUDENT_ROLE') {
            return res.status(403).json({
                msg: 'No tienes permiso para eliminar este perfil'
            });
        }

        usuario.estado = false;
        await usuario.save();

        res.status(200).json({
            msg: 'Perfil a.ctualizado correctamente',
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
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

        // Buscar y actualizar el usuario
        const usuario = await User.findByIdAndUpdate(id, resto, { new: true });
        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario no encontrado',
            });
        }

        res.status(200).json({
            msg: 'Usuario actualizado correctamente',
            usuario,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};
 
module.exports = {

    userDelete,
    userPut
}