let express = require('express');
let router = express.Router();
let User = require('../models/User');   
let Category = require('../models/Category');   
let Content = require('../models/Content');  

router.use(function(req,res,next){
	if(!req.userInfo.isAdmin){
		res.send('对不起，你不是管理员!');
		return;
	}
	next();
})

router.get('/',function(req,res,next){
	res.render('admin/index', {
		userInfo: req.userInfo
	});
	// res.send('后台管理');
})

router.get('/user',function(req,res,next){
    let page = Number(req.query.page || 1);
	let limit = 1;
	let pages = 0;

	User.count().then(function(count){

       pages = Math.ceil(count / limit);

       page = Math.min(page,pages);

       page = Math.max(page,1);

       let skip = (page - 1) * limit;

		User.find().limit(limit).skip(skip).then(function(users){
			res.render('admin/user_index', {
			userInfo: req.userInfo,
			users: users,
			pageUrl:'/admin/user',
			count:count,
			pages:pages,
			limit:limit,
			page: page
		   });
		});

	});

	// res.send('后台管理');
})

router.get('/category',function(req,res,next){
	 let page = Number(req.query.page || 1);
	let limit = 3;
	let pages = 0;

	Category.count().then(function(count){

       pages = Math.ceil(count / limit);

       page = Math.min(page,pages);

       page = Math.max(page,1);

       let skip = (page - 1) * limit;

		Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categorys){
			res.render('admin/category_index', {
			userInfo: req.userInfo,
			categorys: categorys,
			pageUrl:'/admin/category',
			count:count,
			pages:pages,
			limit:limit,
			page: page
		   });
		});

	});

	// res.render('admin/category_index',{
	// 	userInfo: req.userInfo,
	// })
})

router.get('/category/add',function(req,res,next){
	res.render('admin/category_add',{
		userInfo: req.userInfo,
	})
})
// 分类添加
router.post('/category/add',function(req,res){

	let name = req.body.name || '';

	if (name == '') {
		res.render('admin/error',{
			userInfo: req.userInfo,
			message:'名称不能为空！'
		});
		return;
	}
	Category.findOne({
		name:name
	}).then(function(data){
		if(data){
			res.render('admin/error',{
				userInfo: req.userInfo,
			    message:'名称已存在！'
			});
			return Promise.reject();
		}else{
			return new Category({
				name:name
			}).save();
		}
	}).then(function(newCategory){
		res.render('admin/success',{
			userInfo: req.userInfo,
			message:'分类添加成功！',
			url:'/admin/category'
		})
	})
})

// 分类修改
router.get('/category/edit',function(req,res){
	let id = req.query.id || '';


	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			res.render('admin/error',{
				userInfo: req.userInfo,
				message:'分类信息不存在！',
			});
			return Promise.reject();
		}else{
			res.render('admin/category_edit',{
				userInfo: req.userInfo,
				category:category
			});
		}
	})

})

router.post('/category/edit',function(req,res){
	let id = req.query.id || '';
	let name = req.body.name || '';

	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			res.render('admin/error',{
				userInfo: req.userInfo,
				message:'分类信息不存在！',
			});
			return Promise.reject();
		}else{

			if(name == category.name) {

			res.render('admin/success',{
				userInfo: req.userInfo,
				message:'修改成功！',
				url:'/admin/category'
			});

			return Promise.reject();

			} else {

			return Category.findOne({
					_id:{$ne:id},
					name:name
				})

			}
		}
	}).then(function(sameCategory){
		if(sameCategory) {
			res.render('admin/error',{
				userInfo: req.userInfo,
				message:'分类信息名存在！',
			})
			return Promise.reject();
		} else {
			return Category.update({
				_id:id
			},{
				name:name
			});
		}
	}).then(function() {
		res.render('admin/success',{
			userInfo: req.userInfo,
			message:'修改成功！',
			url:'/admin/category'
		});
	})

})

router.get('/category/delete',function(req,res){
	let id = req.query.id || '';


	Category.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
			userInfo: req.userInfo,
			message:'分类信息删除成功！',
			url:'/admin/category'
		});
		return Promise.reject();
	})

})

//内容
router.get('/content',function(req,res){

	let page = Number(req.query.page || 1);
	let limit = 3;
	let pages = 0;

	Content.count().then(function(count){

       pages = Math.ceil(count / limit);

       page = Math.min(page,pages);

       page = Math.max(page,1);

       let skip = (page - 1) * limit;

		Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
			res.render('admin/content_index', {
			userInfo: req.userInfo,
			contents: contents,
			pageUrl:'/admin/content',
			count:count,
			pages:pages,
			limit:limit,
			page: page
		   });
		});

	});

})

router.get('/content/add',function(req,res){

	Category.find().sort({_id:-1}).then(function(categores){
		res.render('admin/content_add',{
		userInfo: req.userInfo,
		categores:categores
	});

	})
})

router.post('/content/add',function(req,res){

	if (req.body.category == "") {
		res.render('admin/error',{
			userInfo: req.userInfo,
		    message:'分类不能为空！',
		})
		return;
	}

	if (req.body.title == "") {
		res.render('admin/error',{
			userInfo: req.userInfo,
		    message:'标题不能为空！',
		})
		return;
	}

	new Content({
		category:req.body.category,
		title:req.body.title,
		user:req.userInfo._id.toString(),
		description:req.body.description,
		content:req.body.content
	}).save().then(function(rs){
		res.render('admin/success',{
			userInfo: req.userInfo,
		    message:'内容保存成功!',
		    url:'/admin/content'
		})
	})
})


router.get('/content/edit',function(req,res){
	let id = req.query.id || '';

	Content.findOne({
		_id:id
	}).populate('category').then(function(content){
		if(!content){
			res.render('admin/error',{
				userInfo: req.userInfo,
				message:'内容不存在！',
			});
			return Promise.reject();
		}else{

			Category.find().sort({_id:-1}).then(function(categores){
				res.render('admin/content_edit',{
				userInfo: req.userInfo,
				categores:categores,
				content:content
			   });
	
           })
		}
	})

})

//内容保存
router.post('/content/edit',function(req,res){
	let id = req.query.id || '';
	Content.update({
				_id:id
			},{
				category:req.body.category,
				title:req.body.title,
				description:req.body.description,
				content:req.body.content
			}).then(function(){
				res.render('admin/success',{
			      userInfo: req.userInfo,
			      message:'修改成功！',
			      url:'/admin/content'
		      })
			});

	// let title = req.body.title || '';
	// Content.findOne({
	// 	_id:id
	// }).then(function(contents){
	// 	if(!contents){
	// 		res.render('admin/error',{
	// 			userInfo: req.userInfo,
	// 			message:'内容不存在！',
	// 		});
	// 		return Promise.reject();
	// 	}else{

	// 		if(title == contents.title) {

	// 		res.render('admin/success',{
	// 			userInfo: req.userInfo,
	// 			message:'修改成功！',
	// 			url:'/admin/content'
	// 		});

	// 		return Promise.reject();

	// 		} else {

	// 		return Content.findOne({
	// 				_id:{$ne:id},
	// 				title:title
	// 			})

	// 		}
	// 	}
	// }).then(function(sameCategory){
	// 	if(sameCategory) {
	// 		res.render('admin/error',{
	// 			userInfo: req.userInfo,
	// 			message:'内容信息名存在！',
	// 		})
	// 		return Promise.reject();
	// 	} else {
	// 		return Content.update({
	// 			_id:id
	// 		},{
	// 			category:req.body.category,
	// 			title:req.body.title,
	// 			description:req.body.description,
	// 			content:req.body.content
	// 		});
	// 	}
	// }).then(function() {
	// 	res.render('admin/success',{
	// 		userInfo: req.userInfo,
	// 		message:'修改成功！',
	// 		url:'/admin/content'
	// 	});
	// })

})

router.get('/content/delete',function(req,res){
	let id = req.query.id || '';
	Content.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
			userInfo: req.userInfo,
			message:'信息删除成功！',
			url:'/admin/content'
		});
		return Promise.reject();
	})

})


module.exports = router;