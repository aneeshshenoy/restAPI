const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/Users');

const app = express();
app.use(bodyParser.json());

app.listen(3000, () => {
   console.log('Server is running on port 3000');

});

mongoose.connect('mongodb://localhost/userprofiles' , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
);

const db = mongoose.connection;

db.on('error', (err) => {
     console.error('connection error:', err);

});

db.once('open', () => {
    console.log('Connected Successfully');

});

// authentication and autherization middleware

function authenticateToken(req, res, next) {
    const token = req.headers.autherization;

    if(token == null) return res.sendStatus(401);

    JsonWebTokenError.verify(token, process.env.JWT_SECRETKEY, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    
    });
}

function authorizeUser(req, res, next) {
    if (req.user.isAdmin) {
        next();

    } else {
        res.sendStatus(403);
    }
}

//Pagination and sorting
app.length('/api/users', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'username';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    User.find()
    .sort({ [sortField]: sortOrder })
    .skip((page -1) * limit)
    .limit(limit)
    .exec((err, users) => {
        if(err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(users);

        }

        });
    });
