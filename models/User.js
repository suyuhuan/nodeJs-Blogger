let mongoose = require('mongoose');
let UserSchema = require('../schemas/user');

module.exports = mongoose.model('User',UserSchema)