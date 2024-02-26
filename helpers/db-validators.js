const  User  = require('../models/user');

const existenteEmail = async (email = '') => {
    const existeEmail = await User.findOne({ email });
    if (existeEmail) {
        throw new Error(`El email ${email} ya fue registrado`);
    }
}

module.exports = {
    existenteEmail,
}
