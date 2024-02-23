const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { existeCursoById, noExistenteEmail} = require('../helpers/db-validators');

const { usuarioHasCursoPost, usuarioHasCursoGet, getUsuarioHasCursoByid, usuarioHasCursoDelete } = require('../controllers/usuarioHasCurso.controller');

const router = Router();

router.get("/", usuarioHasCursoGet);

router.get(
    "/buscar",
    [
        check("correo").custom(noExistenteEmail),
        validarCampos
    ], getUsuarioHasCursoByid);

router.delete(
        "/:id",
        [
            check("id","El id no es un formato válido de MongoDB").isMongoId(),
            check("id").custom(existeCursoById),
            validarCampos
        ], usuarioHasCursoDelete);

        
router.post(
    "/", 
    [
        check("correo","El estudiante es obligatorio").not().isEmpty(),
        check("materia","El curso es obligatorio").not().isEmpty(),
        validarCampos,
    ], usuarioHasCursoPost); 

module.exports = router;