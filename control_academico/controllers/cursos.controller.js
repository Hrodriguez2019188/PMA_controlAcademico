

const { response, json } = require('express');
const Curso = require('../models/curso');
const Usuario = require('../models/usuario');
const usuarioHasCurso = require('../models/usuarioHasCurso');

const cursosGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, cursos] = await Promise.all([
        Curso.countDocuments(query),
        Curso.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        cursos
    });
}

const getCursoByid = async (req, res) => {
    const { id } = req.params;
    const curso = await Curso.findOne({ _id: id });

    res.status(200).json({
        curso
    });
}

const cursosPut = async (req, res) => {
    const { id } = req.params;
    const { _id, ...resto } = req.body;

    const curso = await Curso.findByIdAndUpdate(id, resto);

    res.status(200).json({
        msg: 'Curso actualizado'
    })
}

const cursosDelete = async (req, res) => {
    const { id } = req.params;
    const curso = await Curso.findByIdAndUpdate(id, { estado: false });

    await usuarioHasCurso.updateMany({ curso: id }, { estado: false });

    res.status(200).json({
        msg_1: 'Curso eliminado:',
        msg_2: curso.nombre
    });
}

const cursosPost = async (req, res) => {
    const { nombre, categoria, maestro } = req.body;

    const Maestro = await Usuario.findOne({ correo: maestro });
    if (!Maestro) {
        res.status(400).json({
            msg: 'el maestro asignado no existe'
        })
    }

    if (Maestro.role !== "TEACHER_ROLE") {
        return res.status(400).json({
            msg: 'Un estudiante no puede crear cursos'
        });
    }

    const curso = new Curso({ nombre, categoria, maestro });

    await curso.save();
    res.status(200).json({
        curso
    });
}

module.exports = {
    cursosDelete,
    cursosPost,
    cursosGet,
    getCursoByid,
    cursosPut
}