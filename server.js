'use strict'

var express = require('express');
var app = express();
var cors = require("cors");
var path = require("path");
var cookieParser = require('cookie-parser')
var morgan = require('morgan')


var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
app.use(bodyParser.xml());
var xmlparser = require('express-xml-bodyparser'); //引入

var { verifyToken } = require('./utils/middleware.js');
var { checkToken } = require('./utils/checkToken.js');
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/uploads',express.static(path.join(__dirname,'uploads')))


// app.use(cors()) 

// 请求日志
app.use(morgan('tiny'))

// 设置跨域
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Cache-Control,Authorization,token,crossDomain, Accept,X-Requested-With, If-Modified-Since");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    // res.header("Access-Control-Allow-Credentials", true);
    res.setHeader('cache-control','no-store')
    next();
})

// 检查 token 有效性
app.use('/api',verifyToken); // vue

xmlparser({ trim: false, explicitArray: false })

// parse application/json
app.use(bodyParser.json())


// 导入前端路由模块
var router = require('./router.js');

// 挂载路由中间件
app.use('/', router);

app.listen(5000, () => {
    console.log('letao api服务已启动, 请访问：http://127.0.0.1:5000');
});
