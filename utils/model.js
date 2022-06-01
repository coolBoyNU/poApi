const mysql = require('mysql');
var connect = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: 'root',
    password: 'root',
    database: "letao2022",
    //socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock" //mac加上

});

//进行连接
connect.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log('连接mysql数据库成功');
});


//导出模块
function query(sql) {
    return new Promise((resolve, reject) => {
        connect.query(sql, (err, rows, fields) => {
            // connect.end();
            if (err) {
                reject(err)
            }
            resolve(rows)
        })
    })
}


//导出模块
module.exports =  {
    query, connect
}

