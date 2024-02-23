const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos, validarRolTeacher } = require('../middlewares/validar-campos');
const { existeCursoById, existeCursoByNombre} = require('../helpers/db-validators');

const { cursosPost, cursosGet, getCursoByid, cursosPut, cursosDelete } = require('../controllers/cursos.controller');

const router = Router();

router.get("/", cursosGet);

router.get(
    "/:id",
    [
        check("id","El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeCursoById),
        validarCampos
    ], getCursoByid);

router.put(
    "/:id",
    [
        check("id","El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeCursoById),
        validarCampos,
        validarRolTeacher
    ], cursosPut);

router.delete(
        "/:id",
        [
            check("id","El id no es un formato válido de MongoDB").isMongoId(),
            check("id").custom(existeCursoById),
            validarCampos,
            validarRolTeacher
        ], cursosDelete);

        
router.post(
    "/", 
    [
        check("nombre","El nombre es obligatorio").not().isEmpty(),
        check("nombre").custom(existeCursoByNombre),
        check("maestro","Debes escribir tu correo, no tu usuario").isEmail(),
        validarCampos
    ], cursosPost); 

module.exports = router;