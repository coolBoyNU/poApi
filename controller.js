'use strict'

const mysql = require('mysql');
const axios = require('axios');
const fs = require('fs');
const {
    query,
    connect
} = require('./utils/model.js');

const md5 = require('md5');
var {
    genToken,
    checkToken
} = require('./utils/token.js');


var succStatus = 0 // 表示成功
var failStatus = 1 // 表示失败

// 代表返回的数据结构
var response = {
    status: succStatus,
    message: ''
}


let parseString = require('xml2js').parseString; //引入xml解析模块


var qiniudomain = "http://test.w0824.com/"; // 七牛云存储对象域名

// 定义控制器
var controller = {};


// 更新用户的头像
controller.avatar = async (req, res) => {
   let {avatar,user_id} = req.body;
   if(!avatar){
        res.json({message:'请上传文件',code:1})
   }else{
        // 更新 update
        let sql = `update users set avatar = '${avatar}' where id = '${user_id}' `;
        var result = await query(sql)
        let response = {};
        if(result.affectedRows > 0){
            response.message = 'ok',
            response.code = 0
        }else{
            response.message = '上传失败',
            response.code = 2
        }
        res.json(response);
   }
}

// 定义上传文件的方法
controller.upload = (req, res) => {
    let {user_id = 0} = req.body;
    if (req.file) {
        // 进行文件的重命名即可 fs.rename
        let {
          originalname,
          destination,
          filename
        } = req.file;
        let dotIndex = originalname.lastIndexOf('.');
        let ext = originalname.substring(dotIndex);
        let oldPath = `${destination}${filename}`;
        let newPath = `${destination}${filename}${ext}`;
        fs.rename(oldPath, newPath, async err => {
          if (err) {
            throw err;
          }
          // 更新 update
        let sql = `update users set avatar = '${newPath}' where id = '${user_id}' `;
        var result = await query(sql)
        let response = {};
        if(result.affectedRows > 0){
            res.json({
                message: '上传成功',
                status: 0,
                src: newPath
            })
        }else{
            res.json({
              message: '上传失败',
              code: 1,
              src: ''
            })
        }
        
          
        })
    } else {
       res.json({
          message: '请上传文件',
          code: 2,
          src: ''
        }) 
    }
}

// 获取首页轮播图数据
controller.getlunbo = (req, res) => {
    var response = {
        status: succStatus,
        message: [{
            url: 'http://www.baidu.com',
            img: `${qiniudomain}banner9.png`
        }, {
            url: 'http://jd.com',
            img: `${qiniudomain}banner10.jpg`
        }, {
            url: 'https://www.tmall.com/',
            img: `${qiniudomain}banner11.jpg`
        }]
    }
    res.json(response)
}

// 获取新闻资讯
controller.getnewslist = async (req, res) => {
    var page = parseInt(req.query.page) || 1;
    var pagesize = parseInt(req.query.pagesize) || 10;
    var offset = (page - 1) * pagesize;
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }
    var sql = " SELECT id,title,add_time,click,concat('" + qiniudomain + "',img_url) as img_url FROM dt_article where img_url > '' and channel_id in (6)  limit " + offset + ',' + pagesize + " "
    var rows = await query(sql)
    response.message = rows;
    res.json(response)
}

// 根据资讯id获取资讯详细内容
controller.getnew = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }

    var newid = req.params.newid || 0

    var sql = 'select id,title,click,add_time,content from dt_article  where id=' + newid
    var rows = await query(sql);
    response.status = rows[0] ? 1 : 0
    response.message = rows[0] || {}
    res.json(response);
}

// 首页推荐商品
controller.recommend = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }
    var limit = parseInt(req.query.limit) || 6;
    var sql = `select t1.* , concat('${qiniudomain}',t1.img_url) as img_url,t2.market_price, t2.sell_price 
                from dt_article t1 left join dt_article_attribute_value t2 
                on t1.id = t2.article_id where t1.channel_id = 7 order by rand()  limit ${limit}`;
    var rows = await query(sql)
    response.message = rows;
    res.json(response)

}

controller.getgoods = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }
    var pageindex = req.query.pageindex || 1
    var pagesize = req.query.pagesize || 10
    
    var offset = (pageindex - 1) * pagesize

    var sql = `SELECT a.id,a.title,a.add_time,left(a.zhaiyao,25) as zhaiyao,a.click,concat('${qiniudomain}',a.img_url) as img_url,b.sell_price,b.market_price,b.stock_quantity FROM dt_article as a,dt_article_attribute_value b where a.id = b.article_id and a.channel_id = 7 limit ${offset},${pagesize} `
    var rows = await query(sql);
    //获取数据成功
    response.message = rows
    res.json(response)
}


// 获取商品标题，价格，参数区数据
controller.getgoodsinfo = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }
    var artid = req.params.id || 0;
    var sql = ` SELECT t1.id,t1.title,t1.add_time,t1.zhaiyao,t1.content,
                t2.goods_no,t2.stock_quantity,t2.market_price,t2.sell_price 
                FROM dt_article t1 left join  dt_article_attribute_value t2 
                on t1.id = t2.article_id where t1.id = ${artid} `

    var rows = await query(sql);
    response.status = rows[0] ? 1 : 0
    response.message = rows[0] || {};
    res.json(response)
}


// 商品搜索
controller.search = async (req, res) => {
    // 代表返回的数据结构
    
    let {value='',sort='buy',order='desc',page=1,pagesize=10} = req.query
    
    let offset = parseInt( (page - 1) * pagesize );
    // 设置别名
    if(['sell_price','market_price'].includes(sort)){
        sort = 'b.' + sort
    }
            
    let sql = `SELECT a.likes,a.buy,a.id,a.title,a.add_time,left(a.zhaiyao,25) as zhaiyao,a.click,concat('${qiniudomain}',a.img_url) as img_url,b.sell_price,b.market_price,b.stock_quantity FROM dt_article as a,dt_article_attribute_value b where a.id = b.article_id and a.channel_id = 7 and title like '%${value}%'  order by ${sort} ${order} limit ${offset},${pagesize}`
    
    try{
        var rows = await query(sql);
        res.json(rows);
    }catch (e) {
        res.json({message:"sql错误，请检查参数"});
    }
   
}

// 获取购物车列表数据
controller.getshopcarlist = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }
    var ids = req.params.ids || '0'
    var sql = `
          SELECT count(distinct tb1.id) as cou, tb1.* FROM (
          SELECT  da.id,da.title,daa.sell_price,concat('${qiniudomain}',alb.thumb_path) as thumb_path
          FROM dt_article da 
          LEFT JOIN dt_article_attribute_value daa ON (da.id = daa.article_id)
          LEFT JOIN dt_article_albums alb ON (da.id = alb.article_id)
        WHERE  da.id IN(${ids}) ) AS tb1 GROUP BY tb1.id
        `
    var rows = await query(sql)
    response.message = rows
    res.json(response)
}

// 获取图片分享指定分类列表数据
controller.getcatelist = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }

    var cateid = req.params.cateid - 0

    var sql = ' select id,title,concat("' + qiniudomain + '",img_url) as img_url,zhaiyao from dt_article where channel_id = 9 and category_id=' + cateid
    try {
        var rows = await query(sql);
        response.message = rows
    } catch (e) {
        response.message = e.message;
        response.status = failStatus
    }


    res.json(response)
}

// 根据商品id或图片id获取图片缩略图
controller.getthumbimages = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }

    // 1.0 获取路由参数值
    var art_id = req.params.imgid || 0

    // 2.0 执行查询操作
    var sql = 'select concat("' + qiniudomain + '",thumb_path)  as src  from dt_article_albums where article_id =' + art_id;

    var rows = await query(sql)
    response.message = rows
    res.json(response)
}

// 根据id获取图片详细内容
controller.getimageInfo = async (req, res) => {
    // 代表返回的数据结构
    var response = {
        status: succStatus,
        message: ''
    }
    var art_id = req.params.imgid || 0

    var sql = `select id,title,click,add_time,content from dt_article where id = ${art_id}`

    var rows = await query(sql)
    response.message = rows;
    res.json(response)
}

// 5.0 获取图片分享数据
controller.getcategory = async (req, res) => {
    var response = {
        status: succStatus,
        message: ''
    }
    var sql = ' select title,id from dt_article_category where channel_id = 9'
    var rows = await query(sql);
    response.message = rows
    res.json(response);
}

// 6.0 获取评论信息
controller.getcomments = async (req, res) => {
    var response = {
        status: succStatus,
        message: ''
    }

    var artid = req.params.artid || 0
    var pageindex = req.query.pageindex || 1
    var pagesize = req.query.pagesize || 10;
    
    var offset = (pageindex - 1) * pagesize

    var sql = `select  id,user_name,add_time,content from dt_article_comment 
                where article_id = ${artid} order by add_time asc 
                limit ${offset},${pagesize}`
    var rows = await query(sql);
    response.message = rows
    res.json(response)
}

// 7.0 提交评论数据
controller.postcomment = async (req, res) => {

    var artid = req.params.artid
    var content = req.body.content;
    
    var response = {
        status: succStatus,
        message: ''
    }


    var sql = `insert into  dt_article_comment(article_id,user_name,content,add_time)
              values (${artid},'匿名用户','${content}',NOW())`
    try {
        var rows = await query(sql);
        response.message = '评论提交成功';
        response.insertId = rows.insertId;
    } catch (e) {
        response.message = e.message;
        response.status = failStatus;
    }

    res.json(response)
}

// 用户登录接口
controller.login = async (req, res) => {
    let {
        username,
        password
    } = req.body;

    password = md5(password);
    let sql = `select id,username,avatar,tel,email,openid,sex from users where username='${username}' and password='${password}'`
    let rows = await query(sql);
    if (!rows.length) {
        res.json({
            status: failStatus,
            message: "用户名或密码错误"
        })
    } else {
        let userInfo = rows[0];
        let token = genToken(userInfo)
        res.json({
            token,
            status: succStatus,
            message: "登录成功",
            userInfo,
            
        })
    }

}

// 用户注册接口
controller.register = async (req, res) => {
    var {
        username,
        password
    } = req.body;
    //1. 校验用户名唯一性
    var sql = `select id  from users where username='${username}'`
    var rows = await query(sql);
    if (rows.length) {
        res.json({
            status: failStatus,
            message: "用户名已被占用"
        })
    } else {
        password = md5(password);
        var sql = `insert into users(username,password) values('${username}','${password}')`;
        var rows = await query(sql);

        var status = rows.affectedRows ? 0 : 1;
        var message = rows.affectedRows ? '注册成功' : '注册失败';
        var response = {
            status,
            message
        }
        res.json(response)
    }

}

// 获取用户所有收货地址
controller.getaddress = async (req, res) => {
    var {
        user_id
    } = req.params;
    var response = {};
    var sql = `select * from address where user_id = ${user_id}`;
    try {
        var rows = await query(sql);
        response = rows;
    
    } catch (e) {
        response.message = e.message;
    }

    res.json(response)
}

// 用户添加收货地址
controller.addaddress = async (req, res) => {
    var {
        name,
        tel,
        province,
        city,
        country,
        postalCode,
        isDefault,
        areaCode,
        user_id,
        addressDetail
    } = Object.assign(req.body, req.params);
    // var add_time
    var sql = `insert into 
                address(name,tel,province,city,country,postalCode,isDefault,areaCode,addressDetail,user_id,add_time) 
                values('${name}', '${tel}', '${province}', '${city}', '${country}', '${postalCode}', 
                ${isDefault}, '${areaCode}', '${addressDetail}',${user_id},now() )`;
    try {
        var rows = await query(sql);
        response.status = rows.affectedRows ? 0 : 1;
        response.message = rows.affectedRows ? '添加地址成功' : '添加地址失败';
        let insertId = rows.insertId;
        // 修改默认收货地址
        var sql2 = `update address set isDefault = 0 where user_id=${user_id} and id != ${insertId}`;
        if(isDefault == 1){
            query(sql2);
        }
    } catch (e) {
        response.status = failStatus;
        response.message = e.message;
    }

    res.json(response)
}

// 用户删除收货地址
controller.deladdress = async (req, res) => {
    var {
        address_id
    } = req.params;
    var sql = `delete from address where id=${address_id}`;

    try {
        var rows = await query(sql);
        response.status = rows.affectedRows ? 0 : 1;
        response.message = rows.affectedRows ? '添加删除成功' : '删除地址失败';
    } catch (e) {
        response.status = failStatus;
        response.message = e.message;
    }
    res.json(response)
}


// 用户编辑收货地址
controller.updateaddress = async (req, res) => {
    var {
        address_id
    } = req.params;
    var {
        name,
        tel,
        province,
        city,
        country,
        postalCode,
        isDefault,
        areaCode,
        user_id,
        addressDetail
    } = req.body;
    
    isDefault = (isDefault == 1) ? 1 : 0;
    var arr = [address_id, name, tel, province, city, country,postalCode,user_id,addressDetail,areaCode];
    
    var  isCorrect = true; // 记录参数是否错误
    arr.forEach(v=>{
        if(!v){
            isCorrect = false;
        }
    })
    
    if(!isCorrect){
        res.json({
            status: 1,
            message: '接口参数非法，请检查'
        })
    }else{
        var sql = `update address set name='${name}', tel='${tel}', province='${province}', 
                city='${city}', country='${country}', 
                postalCode='${postalCode}', isDefault=${isDefault}, 
                areaCode='${areaCode}', addressDetail = '${addressDetail}',
                user_id='${user_id}', add_time=now()
                where id = ${address_id}
                `;
        // 修改默认收货地址
        var sql2 = `update address set isDefault = 0 where user_id=${user_id} and id != ${address_id}`;
        if(isDefault == 1){
            query(sql2);
        }
        
        try {
            var rows = await query(sql);
            response.status = rows.affectedRows ? 0 : 1;
            response.message = rows.affectedRows ? '修改地址成功' : '修改地址失败';
        } catch (e) {
            response.status = failStatus;
            response.message = e.message;
        }

        res.json(response)
    }

}


controller.checktoken = (req, res) => {
    var {
        token
    } = req.query;
    var decoded = checkToken(token);
    if (decoded === false) {
        var response = {
            status: 40001,
            message: 'token失效'
        }
        res.json(response);
    } else {
        // 数据库检测用户 
        // to do...
        var response = {
            status: succStatus,
            message: 'ok'
        }
        res.json(response);
    }
}

// 用户提交订单
controller.commitorder = async (req, res) => {
    // 入库，操作，校验用户，订单金额
    var time = Math.floor(new Date().getTime() / 1000);
    var {user_id, order_id, address_id=0, total_price, number, goods_ids} = req.body;
    var  isCorrect = true;
    // 检验参数，必填
    [user_id, order_id, address_id, total_price, number, goods_ids].forEach(v=>{
        if(!v){
            isCorrect = false;
        }
    })
    
    if (!isCorrect) {
        res.json({
            status: 1,
            message: '接口参数错误，请检查'
        })
    }else{
        // 获取订单地址信息
        let sql = 'select * from address where id = ' + address_id
        let addressInfo = await query(sql);
        let address_info = JSON.stringify({
            ...addressInfo[0]
        })
        // 参数正确，插入新订单
        // 支付订单信息 
        let orderData = {
            ...req.body,
            actual_price: 0.01,
            pay_way: "微信支付",
            status: 0,  // 默认0为未付款
            address_info,
            add_time: time
        }
        connect.query('INSERT INTO goods_order SET ?', orderData, (error, results, fields) => {
            if (error) throw error;
            res.json({ message:"生成订单成功",status:0 })

        });
        
    }
    
}

// 模拟支付成功接口
controller.payorder = async (req,res) => {
    const {order_id} = req.params;
    if(!order_id){
        res.json({
            status: 1,
            message: '订单号错误'
        })
        return;
    }
    
    let sql = `update goods_order set status = 2,is_take = 1,is_out = 1 where order_id = '${order_id}'`
    await query(sql);
    let response = {
        status: 0,
        message: "支付成功",
    }
    res.json(response)
    
}

// 获取用户订单
controller.userorder = async (req, res) => {
    let user_id   = parseInt( req.params.user_id || 0 );
    if (!user_id) {
        res.json({status: 0, message: "参数有误"})
    }else{
        let sql = `select * from goods_order where user_id = ${user_id} order by id desc`;
        let rows = await query(sql)
        rows = rows.map(item=>{
            item.address_info = JSON.parse(item.address_info || '{}');
            return item;
        })
        res.json(rows)
    }
    
}

// 查询某个订单状态
controller.getorder = async (req, res) => {
    var order_id = req.params.order_id;

    var response = {};
    if (!order_id) {
        res.json({status: 0, message: "订单号参数有误"})
    }else{
        var sql = `select * from goods_order where order_id = '${order_id}'`;
        var rows = await query(sql)
        response = rows[0] || {};
        if(rows[0]){
            response.address_info = JSON.parse(response.address_info || '{}')
        }
        res.json(response)
    }
    
}


controller.kuaidi100 = (req,res) => {
    let data = [
        {time:'2021.12.07 16:11 星期二',location:'【佛山市】已离开 广东佛山分拨交付中心；发往 广东广州南沙公司'},
        {time:'2021.12.07 16:07',location:'【佛山市】已到达 广东佛山分拨交付中心'},
        {time:'2021.12.07 02:05',location:'【南宁市】已离开 广西南宁分拨交付中心；发往 广东佛山分拨交付中心'},
        {time:'2021.12.06 11:18',location:'【南宁市】已到达 广西南宁分拨交付中心'},
        {time:'2021.12.05 13:42 星期天',location:'【南宁市】广西南宁分拨营销市场部南韵分部-陈惠玲（15114917493） 已揽收'}
    ];
    res.json(data)
}

// 导出模块
module.exports = controller;

