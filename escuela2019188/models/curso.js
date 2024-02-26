const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Teacher is required']
    },
    students: [{
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
