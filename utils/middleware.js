
let { genToken,checkToken } = require('./token.js');

// 导出模块
module.exports = {
    verifyToken(req,res,next){
        let token = req.headers['token'];
        // 有token则验证 ，无token则放行
        if(token){
            
            let result = checkToken(token);
            if(result === false){
                let response = {
                    status: 40001,
                    message: 'token失效-乐淘'
                }
            //   console.log('校验token 失败')
                res.json(response);
                return;
            }else{
                // console.log('校验token 成功')
               next(); 
            }
        }else{
            next();
        }
        
        
    }
};