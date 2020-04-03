// node 后端服务器
const adminApi = require('./api/adminAPI');
const userApi = require('./api/userAPI');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// app.use('/uploads', express.static(__dirname + '/uploads'))
// const upload = multer({dest: __dirname + '/../../uploads'})
app.use('/uploads', express.static('/uploads'))
const multer = require('multer')
const upload = multer({dest: '/../../uploads'})
app.post('/api/admin/upload',upload.array('file'), async (req, res) => {
  const file = req.files
  // file.url = `http://47.112.238.198:3000/uploads/${file[0].filename}.${req.files[0].originalname.split(".")[1]}`
  file.url = `http://127.0.0.1:3000/uploads/${file[0].filename}.${req.files[0].originalname.split(".")[1]}`
  res.send(file.url)
})

//处理跨域
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8082');
   // res.header('Access-Control-Allow-Origin', 'http://47.112.238.198:3001');
  res.header('Access-Control-Allow-Headers', 'X-Token, Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials','true');   // 新增
  if (req.method == 'OPTIONS') {
    res.sendStatus(200); /*让options请求快速返回*/
  }
  else {
    next();
  }
})

// 后端api路由
app.use('/api/admin', adminApi);
app.use('/api/user', userApi);

// 监听端口
app.listen(3000);
console.log('success listen at port:3000......');
