let mongoose = require('mongoose');
let CategorySchema = require('../schemas/category');

module.exports = mongoose.model('Category',CategorySchema)