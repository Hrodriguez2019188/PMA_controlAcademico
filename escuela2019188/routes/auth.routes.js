const { Router } = require('express');
const { check } = require('express-validator');
const { login, registrarse } = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { existenteEmail } = require('../helpers/db-validators');

const router = Router();

router.post(
    '/registrarse', [
    check('nameUser', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe ser de más de 6 letras').isLength({ min: 6 }),
    check('email', 'El correo no es válido').isEmail(),
    check('email').custom(existenteEmail),
    validarCampos
], registrarse);

router.post('/login',
    [
        check('email', 'El email no es un correo valido').isEmail(),
        check('password', 'La contraseña es obligatoria').not().isEmpty(),
        validarCampos
    ], login);


module.exports = router;
