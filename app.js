let express = require('express');
let swig = require('swig');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let Cookies = require('cookies');
let User = require('./models/User');
let app = express();

// 设置静态文件托管
app.use('/public',express.static(__dirname + '/public'));

// 定义当前应用所使用的模板引擎
app.engine('html',swig.renderFile);

// 设置模板文件存放的目录  第一个参数必须是views  第二个参数是目录
app.set('views','./views');

//注册所使用的模板引擎
app.set('view engine','html');

//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

//
app.use(bodyParser.urlencoded({extended:true}));

app.use(function(req,res,next){
	req.cookies = new Cookies(req,res);

	req.userInfo = {};

	if(req.cookies.get('userInfo')) {
		try{
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));

			User.findById(req.userInfo._id).then(function(userInfo) {
				req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			})
		}catch(e){
			next();
		}
	}else{
		next();
	}
	
});

app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


//req request对象  res response对象  next 函数
// app.get('/',function(req,res,next){
// 	//读取views目录下的指定文件，解析并返回给客户端
// 	//第一个参数：表示模板的文件，相对于views目录
// 	//第二个参数：传递给模板使用的数据
// 	res.render('index');
// })

mongoose.connect('mongodb://localhost:27018/blog',function(err){
	if (err) {
		console.log('数据库链接失败')
	} else {
		console.log('数据库链接成功')
		app.listen(8081);
	}
});
