const { response, json } = require('express');
const usuarioHasCurso = require('../models/usuarioHasCurso');
const Usuario = require('../models/usuario');
const Curso = require('../models/curso');

const usuarioHasCursoGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, usuarioHasCursos] = await Promise.all([
        usuarioHasCurso.countDocuments(query),
        usuarioHasCurso.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        usuarioHasCursos
    });
}

const getUsuarioHasCursoByid = async (req, res) => {
    const { correo } = req.body;

    try {
        const estudiante = await Usuario.findOne({ correo });

        const cursosInscritos = await usuarioHasCurso.find({ estudiante: estudiante.id, estado: true }).populate('curso');

        if (cursosInscritos.length === 0) {
            return res.status(400).json({ msg: 'El estudiante no está inscrito en ningún curso' });
        }

        const listaCursos = cursosInscritos.map(curso => ({
            nombre: curso.curso.nombre,
            fecha_inscripcion: curso.fecha_inscripcion
        }));

        res.status(200).json({ 
            cursos: listaCursos 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }

}

const usuarioHasCursoDelete = async (req, res) => {
    const { id } = req.params;
    const usuarioHasCursos = await usuarioHasCurso.findByIdAndUpdate(id, { estado: false });

    res.status(200).json({
        msg: 'estudiante eliminado del curso'
    });
}

const usuarioHasCursoPost = async (req, res) => {
    const { correo, materia } = req.body;

    const Estudiante = await Usuario.findOne({ correo });
    const estudiante = Estudiante.id;

    const Cursoo = await Curso.findOne({ nombre: materia });

    if(!Cursoo){
        return res.status(400).json({
            msg:
                'El curso que se quiere asignar no existe'
        });
    }
    
    const curso = Cursoo.id;



    try {
        const cantidadCursosInscritos = await usuarioHasCurso.countDocuments({ estudiante });

        if (cantidadCursosInscritos >= 3) {
            return res.status(400).json({
                msg: 'El estudiante ya está inscrito en el máximo número de cursos permitidos'
            });
        }

        const existeAsignacion = await usuarioHasCurso.findOne({ estudiante, curso });

        if (existeAsignacion) {
            return res.status(400).json({
                msg:
                    'El estudiante ya está en este curso'
            });
        }

        const usuarioHasCursos = new usuarioHasCurso({
            estudiante: estudiante,
            curso: curso
        });

        await usuarioHasCursos.save();

        res.status(200).json({
            estudiante: Estudiante.nombre,
            correo_estudiante: correo,
            curso: materia,
            fecha_inscripcion: usuarioHasCursos.fecha_inscripcion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg:
                'Error interno del servidor'
        });
    }
};




module.exports = {
    usuarioHasCursoDelete,
    usuarioHasCursoPost,
    usuarioHasCursoGet,
    getUsuarioHasCursoByid
}
