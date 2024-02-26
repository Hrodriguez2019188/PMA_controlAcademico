const express = require('express');
const { Router } = require('express');
const { tieneRole } = require('../middlewares/validar-roles');
const { check } = require('express-validator');
const { asignarCurso,
    cursosPorEstudiante,
    deleteCurso,
    postCurso,
    putCurso,
    cursosDeProfesor } = require('../controllers/course.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/', [
    validarJWT,
    tieneRole('TEACHER_ROLE'),
    validarCampos,
    postCurso
]);
router.put('/:courseId', [
    validarJWT,
    tieneRole('TEACHER_ROLE'),
    validarCampos,
    putCurso
]);
router.delete('/:courseId', [
    validarJWT,
    tieneRole('TEACHER_ROLE'),
    deleteCurso
]);
router.post('/students/:userId/courses', [
    validarJWT,
    tieneRole('STUDENT_ROLE'),
    check('courseId', 'El ID del curso es requerido').notEmpty(),
    validarCampos,
    asignarCurso
]);
router.get('/students/:userId/courses', [
    validarJWT,
    tieneRole('STUDENT_ROLE'),
    cursosPorEstudiante
]);
router.get('/teachers/:teacherId/courses', [
    validarJWT,
    tieneRole('TEACHER_ROLE'),
    cursosDeProfesor
]);






module.exports = router;
