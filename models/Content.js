let mongoose = require('mongoose');
let ContentSchema = require('../schemas/contents');

module.exports = mongoose.model('Content',ContentSchema)