const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    nameCourse: {
        type: String,
        required: [true, 'El nombre el obligatorio']
    },
    descripcion: {
        type: String,
        required: [true, 'Se necesita una descripcion']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El profesor es obligatorio']
    },
    student: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    estado: {
        type: Boolean,
        default: true
    }
});

courseSchema.methods.toJSON = function () {
    const { __v, _id, ...course } = this.toObject();
    course.cid = _id;
    return course;
}

module.exports = mongoose.model('Course', courseSchema);
