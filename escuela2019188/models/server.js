const express = require('express');
const cors = require('cors');
const {dbConnection} = require('../db/config');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.userPath = '/api/users';
        this.authPath = '/api/auth';
        this.coursePath = '/api/courses';
        this.dbConnection();
        this.middlewares();
        this.routes();
    }
    async dbConnection() {
        await dbConnection();
    }

    middlewares() {
        
        this.app.use(express.static('public'));
        this.app.use(cors());
        this.app.use(express.json());
    }

    routes() {
        this.app.use(this.userPath, require('../routes/user.routes'));
        this.app.use(this.authPath, require('../routes/auth.routes'));
        this.app.use(this.coursePath, require('../routes/course.routes'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor ejecutado y escuchando en el puerto', this.port);
        });
    }
}

module.exports = Server;