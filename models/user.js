const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nameUser: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La password es obligatoria']
    },
    estado: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        default: 'STUDENT_ROLE',
        enum: ["STUDENT_ROLE", "TEACHER_ROLE"]
    }
});


userSchema.methods.toJSON = function () {
    const { __v, password, _id, ...usuario } = this.toObject();
    usuario.uid = _id;
    return usuario;
}


module.exports = mongoose.model('User', userSchema);