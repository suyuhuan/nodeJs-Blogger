let express = require('express');
let router = express.Router();

let Category = require('../models/Category');  

router.get('/',function(req,res,next){

	Category.find().then(function(categories) {
		res.render('main/index',{
		userInfo: req.userInfo,
		categories:categories
	  });

	});
	
	// res.send('user');
})

module.exports = router;