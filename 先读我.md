## 部署Api基本步骤
1. 将源码部署Linux服务器或本地服务器即可。
1. 进入项目根目录执行指令`npm i `安装项目所需依赖
1. 将当前data目录中的vueshop.sql文件导入到自己的数据库中。 可以使用navicat连接远程数据库，但要开启远程数据库的访问权限方可连接。连接成功后先创建数据库，在右键运行sql文件，选择此sql文件导入即可)
1. 修改utils/model.js ,改为自己的数据库配置信息
```json
{
    host: "ip地址",
    port: 3306,
    user: '数据库用户名',
    password: '数据库密码',
    database: "数据库名",
}
```
1. 进入项目根目录执行指令，  `nodemon ./server.js`。
