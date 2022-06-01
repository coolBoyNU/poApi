const jwt = require('jsonwebtoken');
const secret = "%^^&GTUYH&*";
var tokenTool = {};
tokenTool.genToken = (data, hours = 10) => {
    data = Object.assign({},data); // 要转为原始对象 plain Object,否则通不过
    let token = jwt.sign(data, secret, {expiresIn:`${hours}h`});
    return token;
}

tokenTool.checkToken = (token) => {
    try{
        let decoded = jwt.verify(token, secret);
        return decoded;
    }catch(e){
        return false;
    }
}

module.exports = tokenTool;
