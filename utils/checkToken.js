
let { genToken,checkToken } = require('./token.js');

// 导出模块
module.exports = {
    checkToken(req,res,next){
        let token = req.headers['authorization'];
        // 有token则验证 ，无token则放行
        if(token){
             // 把token设置在req对象身上，便于后续的控制器的方法去接受使用
            req.token = token;
            let result = checkToken(token);
            if(result=== false){
                let response = {
                    errcode: 40001,
                    message: 'token失效-middleware'
                }
               
                res.json(response);
                return;
                
            }else{
                
               next(); 
            }
        }else{
            next();
        }
        
        
    }
};