'use strict'

const express = require('express')
let route = express.Router();

const multer = require('multer');
// 定义上传的目录
let upload = multer({ dest: 'uploads/' })

const controller = require('./controller.js')

route.post('/api/avatar',controller.avatar)

route.post('/api/upload',upload.single('file'),controller.upload)

route.get('/api/getlunbo', controller.getlunbo)

route.get('/api/kuaidi100', controller.kuaidi100)

route.get('/api/recommend', controller.recommend)

route.get('/api/getnewslist', controller.getnewslist)

route.get('/api/getnew/:newid', controller.getnew)

route.get('/api/getcatelist/:cateid', controller.getcatelist)

route.get('/api/getthumbimages/:imgid', controller.getthumbimages) 

route.get('/api/getimageInfo/:imgid', controller.getimageInfo)

route.get('/api/getcategory', controller.getcategory)

route.get('/api/getcomments/:artid', controller.getcomments)

route.post('/api/postcomment/:artid', controller.postcomment)

route.get('/api/getgoods', controller.getgoods)

route.get('/api/getgoodsinfo/:id', controller.getgoodsinfo)

route.get('/api/getshopcarlist/:ids', controller.getshopcarlist)

// 商品搜索接口
route.get('/api/search', controller.search)

// 登录
route.post('/api/login', controller.login)

// 注册
route.post('/api/register', controller.register)

// 获取用户收货地址
route.get('/api/getaddress/:user_id', controller.getaddress);

// 用户添加收货地址
route.post('/api/addaddress/:user_id', controller.addaddress);

// 用户删除收货地址
route.post('/api/deladdress/:address_id', controller.deladdress);

// 用户编辑收货地址
route.post('/api/updateaddress/:address_id', controller.updateaddress);

// 验证gentoken
route.post('/api/checktoken', controller.checktoken);

// 提交订单
route.post('/api/commitorder', controller.commitorder)

// 模拟提交订单
route.post('/api/payorder/:order_id', controller.payorder)

// 获取个人订单
route.post('/api/userorder/:user_id', controller.userorder)

// 查询某个订单
route.post('/api/getorder/:order_id', controller.getorder)

route.all('*',(req,res)=>{
    res.json({message:"请检查乐淘接口地址是否有误"})
})

module.exports = route;

