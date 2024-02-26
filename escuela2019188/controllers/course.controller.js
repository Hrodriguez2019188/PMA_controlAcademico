const Course = require('../models/curso');
const User = require('../models/user');
const { response, json } = require('express');
const jwt = require('jsonwebtoken');
const UserHasCourse = require('../models/UserHasCurso');

const asignarCursoAEstudiante = async (req, res) => {
    try {
        const { userId } = req.params;
        const { courseId } = req.body;
        const usuarioAutenticado = req.usuario;

        // Verificar si el usuario es el mismo que intenta asignar el curso
        if (usuarioAutenticado._id.toString() !== userId || usuarioAutenticado.role !== 'STUDENT_ROLE') {
            return res.status(403).json({
                msg: 'No tienes permiso para asignar este curso',
            });
        }

        // Contar las asignaciones existentes del alumno
        const existingAssignments = await UserHasCourse.countDocuments({ user: userId });

        // Verificar si el alumno ya está asignado a  3 cursos
        if (existingAssignments >= 3) {
            return res.status(400).json({
                msg: 'El alumno ya está asignado a  3 cursos',
            });
        }

        // Verificar si el alumno ya está asignado a este curso
        const existingAssignment = await UserHasCourse.findOne({ user: userId, course: courseId });
        if (existingAssignment) {
            return res.status(400).json({
                msg: 'El alumno ya está asignado a este curso',
            });
        }

        // Asignar el curso al alumno
        const asignacion = new UserHasCourse({ user: userId, course: courseId });
        await asignacion.save();

        res.status(200).json({
            msg: 'Curso asignado correctamente',
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

        // Verificar si el usuario es el mismo que intenta ver los cursos
        if (usuarioAutenticado._id.toString() !== userId || usuarioAutenticado.role !== 'STUDENT_ROLE') {
            return res.status(403).json({
                msg: 'No tienes permiso para ver los cursos de este usuario',
            });
        }

        // Buscar las asignaciones del alumno
        const assignments = await UserHasCourse.find({ user: userId });

        // Encontrar los id de los cursos
        const courseIds = assignments.map(assignment => assignment.course);

        // Buscar los detalles de los cursos con estado true
        const courses = await Course.find({ _id: { $in: courseIds }, estado: true });

        res.status(200).json({
            msg: 'A estos cursos estas asignado correctamente:',
            courses,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};

//profesores
const postCourse = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Crear el curso
        const course = new Course({
            name,
            description,
            teacher: req.usuario._id
        });
        // Guardar el curso
        await course.save();
        res.status(201).json({
            msg: 'Curso creado correctamente',
            course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};

const putCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { name, description } = req.body;

        // Comprueba si el profesor es el propietario del curso
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                msg: 'Curso no encontrado',
            });
        }
        if (course.teacher.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                msg: 'No tienes permiso para editar este curso',
            });
        }

        course.name = name;
        course.description = description;
        await course.save();

        // Actualizar la información del curso para los alumnos asignados
        await User.updateMany(
            { 'courses.courseId': courseId },
            { $set: { 'courses.$.name': name, 'courses.$.description': description } }
        );

        res.status(200).json({
            msg: 'Curso editado correctamente',
            course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Comprueba si el profesor es el propietario del curso
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                msg: 'Curso no encontrado',
            });
        }
        if (course.teacher.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                msg: 'No tienes permiso para eliminar este curso',
            });
        }

        // Cambiar el estado del curso a false
        course.estado = false;
        await course.save();

        // Desasignar a los alumnos del curso
        await User.updateMany(
            { 'courses.courseId': courseId },
            { $pull: { courses: { courseId: courseId } } }
        );

        res.status(200).json({
            msg: 'Curso eliminado correctamente',
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
        // Buscar todos los cursos donde el profesor es el creador del curso y el estado es true
        const courses = await Course.find({
            teacher: req.usuario._id,
            estado: true
        });

        // Verificar si hay cursos disponibles
        if (courses.length ===  0) {
            return res.status(200).json({
                msg: 'No tienes cursos disponibles',
                courses: []
            });
        }

        res.status(200).json({
            msg: 'Cursos obtenidos correctamente',
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
    asignarCursoAEstudiante,
    cursosPorEstudiante,
    postCourse,
    putCourse,
    deleteCourse,
    cursosDeProfesor
};
