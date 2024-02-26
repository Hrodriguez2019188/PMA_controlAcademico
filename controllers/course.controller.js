const Course = require('../models/curso');
const User = require('../models/user');
const { response, json } = require('express');
const jwt = require('jsonwebtoken');
const UserHasCourse = require('../models/UserHasCurso');

const postCurso = async (req, res) => {
    try {
        const { nameCourse, descripcion } = req.body;
        const course = new Course({
            nameCourse,
            descripcion,
            teacher: req.usuario._id
        });
        await course.save();
        res.status(201).json({
            msg: 'Se creo el curso',
            course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};

const putCurso = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { nameCourse, descripcion } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                msg: 'Curso no existe',
            });
        }
        if (course.teacher.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                msg: 'No puedes editar el curso',
            });
        }

        course.nameCourse = nameCourse;
        course.descripcion = descripcion;
        await course.save();

        await User.updateMany(
            { 'courses.courseId': courseId },
            { $set: { 'courses.$.nameCourse': nameCourse, 'courses.$.descripcion': descripcion } }
        );

        res.status(200).json({
            msg: 'Curso editado',
            course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};

const deleteCurso = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                msg: 'Curso no encontrado',
            });
        }
        if (course.teacher.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                msg: 'No puedes eliminar este curso',
            });
        }

        course.estado = false;
        await course.save();

        await User.updateMany(
            { 'courses.courseId': courseId },
            { $pull: { courses: { courseId: courseId } } }
        );

        res.status(200).json({
            msg: 'Curso eliminado',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};

const asignarCurso = async (req, res) => {
    try {
        const { userId } = req.params;
        const { courseId } = req.body;
        const usuarioAutenticado = req.usuario;

        if (usuarioAutenticado._id.toString() !== userId || usuarioAutenticado.role !== 'STUDENT_ROLE') {
            return res.status(403).json({
                msg: 'No te puedes asignar el curso',
            });
        }

        const existingAssignments = await UserHasCourse.countDocuments({ user: userId });

        if (existingAssignments >= 3) {
            return res.status(400).json({
                msg: 'El estudiante ya está asignado a  3 cursos',
            });
        }

        const existingAssignment = await UserHasCourse.findOne({ user: userId, course: courseId });
        if (existingAssignment) {
            return res.status(400).json({
                msg: 'El estudiante ya esta en el curso',
            });
        }

        const asignacion = new UserHasCourse({ user: userId, course: courseId });
        await asignacion.save();

        res.status(200).json({
            msg: 'Curso asignado',
            asignacion,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};


const cursosPorEstudiante = async (req, res) => {
    try {
        const { userId } = req.params;
        const usuarioAutenticado = req.usuario;

        if (usuarioAutenticado._id.toString() !== userId || usuarioAutenticado.role !== 'STUDENT_ROLE') {
            return res.status(403).json({
                msg: 'Solo puedes ver tus cursos',
            });
        }

        const assignments = await UserHasCourse.find({ user: userId });
        const courseIds = assignments.map(assignment => assignment.course);
        const courses = await Course.find({ _id: { $in: courseIds }, estado: true });

        res.status(200).json({
            msg: 'Estos son tus cursos:',
            courses,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};

const cursosDeProfesor = async (req, res) => {
    try {
        const courses = await Course.find({
            teacher: req.usuario._id,
            estado: true
        });

        if (courses.length ===  0) {
            return res.status(200).json({
                msg: 'No existen cursos',
                courses: []
            });
        }

        res.status(200).json({
            msg: 'Estos son tus cursos',
            courses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};



module.exports = {
    postCurso,
    putCurso,
    deleteCurso,
    asignarCurso,
    cursosPorEstudiante,
    cursosDeProfesor
};
