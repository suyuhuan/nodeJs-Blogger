let mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({

	title:String,
	category:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Category'
	},
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	addTime:{
		type:Date,
		default:new Date()
	},
	views:{
		type: Number,
		default:0
	},
	description:{
		type: String,
		default:''
	},
	content:{
		type: String,
		default:''
	}
})