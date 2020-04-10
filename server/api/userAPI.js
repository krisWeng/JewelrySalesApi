var models = require('../db');
var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var path = require("path");
var fs = require("fs");


// 连接数据库
var conn = mysql.createConnection(models.mysql);

conn.connect();
var jsonWrite = function(res, ret) {
    if(typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};


// -----------------------------用户---------------------------
// 登录
router.post('/userLogin', (req, res) => {
  var sql = 'select * from user_info where user_name = ? and user_password = ? and IsDelete = 1'
  var params = req.body;
  conn.query(sql, [params.user_name, params.user_password], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 注册
router.post('/adduser', (req, res) => {
  var sql = 'select * from user_info where user_name = ? and IsDelete = 1'
  var sql1 = 'insert into user_info (user_name, user_password, pay_password, user_phone, nick_name, sex, register_time, account, IsDelete) value (?, ?, ?, ?, ?, ?, ?, 10000, 1)'
  var params = req.body;
  conn.query(sql, [params.user_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      if(result.length==0){
        conn.query(sql1, [params.user_name, params.user_password, params.pay_password, params.user_phone, params.nick_name, params.sex, params.register_time], function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            jsonWrite(res, result);
          }
        })
      }else if(result.length!=0){
        let message="该账号已存在"
        result[0] = message
        jsonWrite(res, result);
      }
    }
  })
});


// 轮播图
router.post('/carousel', (req, res) => {
  var sql = 'select carousel_info.* from carousel_info, user_info where user_info.user_id=(select user_id from user_info where user_id=?)'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 首页商品列表
router.post('/ShopListHome', (req, res) => {
  var sql = "select shop_info.* from shop_info, user_info where shop_info.IsDelete=1 and show_index='true' and user_info.user_id=(select user_id from user_info where user_id=?)"
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 单个商品详情
router.post('/OneShopMsg', (req, res) => {
  var sql = 'select shop_info.*, brand_info.brand_name from shop_info, user_info, brand_info where shop_id=? and shop_info.brand_id=brand_info.brand_id and shop_info.IsDelete=1 and user_info.user_id=(select user_id from user_info where user_id=?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 单个商品详情图片
router.post('/OneShopDetail', (req, res) => {
  var sql = 'select detail_info.* from detail_info, user_info where shop_id=? and user_info.user_id=(select user_id from user_info where user_id=?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      var detail_list=[]
      result.map(item=>{
        detail_list.push(item.detail_root)
      })
      result=detail_list
      jsonWrite(res, result);
    }
  })
});

// 单个商品轮播图片
router.post('/OneShopPhoto', (req, res) => {
  var sql = 'select photo_info.* from photo_info, user_info where shop_id=? and user_info.user_id=(select user_id from user_info where user_id=?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      var photo_list=[]
      result.map(item=>{
        photo_list.push(item.photo_root)
      })
      result=photo_list
      jsonWrite(res, result);
    }
  })
});

// 收藏夹验证
router.post('/checkOneCollection', (req, res) => {
  var sql = 'select collection_info.* from collection_info where shop_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 加入收藏
router.post('/colShopCar', (req, res) => {
  var sql = 'insert into collection_info (shop_id, user_id) value (?, ?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 显示评价
router.post('/theShopEvaluate', (req, res) => {
  var sql = 'select evaluate_info.*, user_info.*, shop_info.shop_name from evaluate_info, user_info, shop_info where evaluate_info.shop_id=? and evaluate_info.user_id=user_info.user_id and evaluate_info.shop_id=shop_info.shop_id'
  var params = req.body;
  conn.query(sql, [params.shop_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 商品列表
router.post('/theShopList', (req, res) => {
  var sql = 'select shop_info.* from shop_info, user_info where second_classify_id=? and shop_info.IsDelete=1 and user_info.user_id=(select user_id from user_info where user_id=?)'
  // 升序
  var sql1 = 'select * from shop_info where second_classify_id=? and IsDelete=1 order by shop_price asc'
  // 降序
  var sql2 = 'select * from shop_info where second_classify_id=? and IsDelete=1 order by shop_price desc'
  // 销量
  var sql3 = 'select * from shop_info where second_classify_id=? and IsDelete=1 order by buyPersonNum desc'
  var params = req.body;
  if(params.btnID==1){
    conn.query(sql, [params.second_classify_id, params.user_id], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else if(params.btnID==2){
    conn.query(sql1, [params.second_classify_id, params.user_id], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else if(params.btnID==3){
    conn.query(sql2, [params.second_classify_id, params.user_id], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else if(params.btnID==4){
    conn.query(sql3, [params.second_classify_id, params.user_id], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }
});



// 一级分类
router.post('/FirstClassifyList', (req, res) => {
  var sql = 'select first_classify_info.* from first_classify_info, user_info where user_info.user_id=(select user_id from user_info where user_id=?)'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 二级分类
router.post('/secondClassifyList', (req, res) => {
  var sql1 = 'select second_classify_pic_info.second_classify_id, second_classify_info.second_classify_name, CONCAT(GROUP_CONCAT (concat(concat(pic_root)))) AS picList from second_classify_info, second_classify_pic_info, user_info where second_classify_info.first_classify_id=? and second_classify_pic_info.second_classify_id=second_classify_info.second_classify_id and user_info.user_id=(select user_id from user_info where user_id=?) GROUP BY second_classify_pic_info.second_classify_id'
  var params = req.body;
  conn.query(sql1, [params.first_classify_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      result.map((item,index)=>{
        result[index].picList = result[index].picList.split(',')
      })
      jsonWrite(res, result);
    }
  })
});


// 个人信息
router.post('/userMsg', (req, res) => {
  var sql = 'select * from user_info where user_id=?'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 充值
router.post('/updateAccount', (req, res) => {
  var sql = 'select user_password, account from user_info where user_id=? and user_password=?'
  var sql1 = "update user_info set account=? where user_id=?"
  var params = req.body;
  conn.query(sql, [params.user_id, params.user_password], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      if(result.length==0){
        result[0]='支付密码错误'
        jsonWrite(res, result);
      }else{
        result=result[0].account
        conn.query(sql1, [parseInt(result)+params.account, params.user_id], function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            jsonWrite(res, result);
          }
        })
      }
    }
  })
});

// 个人订单数
router.post('/mineOrder', (req, res) => {
  var sql = 'select count(case when order_status = 2 then 1 end) as wait_pay, count(case when order_status = 3 then 1 end) as wait_send, count(case when order_status = 4 then 1 end) as wait_get, count(case when order_status = 5 then 1 end) as wait_write, count(case when order_status = 0 then 1 end) as wait_back from (select order_info.* from order_info GROUP BY order_id HAVING count(order_id)>=1) tb_1 where user_id = ?'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 收藏夹
router.post('/theShopCollection', (req, res) => {
  var sql = 'select shop_info.shop_name, shop_info.shop_id, shop_info.shop_price, shop_info.shop_photo from collection_info, shop_info, user_info where collection_info.shop_id=shop_info.shop_id and collection_info.user_id=user_info.user_id and user_info.user_id=(select user_id from user_info where user_id=?)'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 删除收藏夹
router.post('/delShopCollection', (req, res) => {
  var sql = 'delete from collection_info where shop_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 收货地址
router.post('/userAddressList', (req, res) => {
  var sql = 'select * from receiving_info where user_id=? order by consignee_id desc'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 单个地址
router.post('/userOneAddress', (req, res) => {
  var sql = 'select * from receiving_info where consignee_id=?'
  var params = req.body;
  conn.query(sql, [params.consignee_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑地址
router.post('/updateOneAddress', (req, res) => {
  var sql = 'update receiving_info set consignee=?, consignee_phone=?, province=?, city=?, address=? where consignee_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.consignee, params.consignee_phone, params.province, params.city, params.address, params.consignee_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 删除地址
router.post('/delOneAddress', (req, res) => {
  var sql = 'delete from receiving_info where consignee_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.consignee_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 添加地址
router.post('/addOneAddress', (req, res) => {
  var sql = 'insert into receiving_info (consignee, consignee_phone, province, city, address, user_id) value (?, ?, ?, ?, ?, ?)'
  var params = req.body;
  conn.query(sql, [params.consignee, params.consignee_phone, params.province, params.city, params.address, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 修改个人信息
router.post('/updateMine', (req, res) => {
  var sql = 'update user_info set nick_name=?, sex=? where user_id=?'
  var params = req.body;
  conn.query(sql, [params.nick_name, params.sex, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 重置用户密码
router.post('/updatePass', (req, res) => {
  var sql = 'update user_info set user_password=? where user_id=?'
  var params = req.body;
  conn.query(sql, [params.user_password, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 重置用户支付密码
router.post('/updatePay', (req, res) => {
  var sql = 'update user_info set pay_password=? where user_id=?'
  var params = req.body;
  conn.query(sql, [params.pay_password, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 消息管理列表
router.post('/newsToAdmin', (req, res) => {
  var sql = 'select admin_info.* from admin_info, user_info where admin_info.IsDelete = 1 and user_info.user_id=(select user_id from user_info where user_id=?)'
  var sql1 = 'select chat_info.user, chat_info.admin, chat_record_info.* from chat_info, chat_record_info where chat_record_info.id=chat_info.id and chat_info.user=? order by chat_record_info.id'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    var newsAdmin=[]
    if (result) {
      newsAdmin=result
      conn.query(sql1, [params.user_id], function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result) {
          if(result.length==0){
            newsAdmin.map((item,index)=>{
              newsAdmin[index].chat_list = []
            })
          }else{
            result.map((itemA,indexA)=>{
              newsAdmin.map((item,index)=>{
                if(itemA.admin==item.admin_uuid){
                  newsAdmin[index].chat_list = result[indexA]
                }else{
                  newsAdmin[index].chat_list = []
                }
              })
            })
          }
          jsonWrite(res, newsAdmin);
        }
      })
    }
  })
});

// 已读
router.post('/readTheNewsUser', (req, res) => {
  var sql = 'update chat_record_info set is_read=0 where chat_tips=1 and id in (select id from chat_info where user=? and admin=?)'
  var params = req.body;
  conn.query(sql, [params.user, params.admin], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 聊天记录
router.post('/chatToAdmin', (req, res) => {
  var sql = 'select chat_record_info.* from chat_info, chat_record_info, user_info, admin_info where chat_record_info.id=chat_info.id and chat_info.user=? and chat_info.admin=?'
  var sql1= 'select user_info.sex as userSex, admin_info.sex as adminSex, admin_info.admin_name from user_info, admin_info where user_id=? and admin_uuid=?'
  var params = req.body;
  conn.query(sql, [params.user, params.admin], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      var chat_list = []
      chat_list = result
      conn.query(sql1, [params.user_id, params.admin_uuid], function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result) {
          if(chat_list.length==0){
            result = result
          }else{
            result.map((item,index)=>{
              result[index].chatList = chat_list
            })
          }
          jsonWrite(res, result);
        }
      })
    }
  })
});

// 发送消息
// 添加chat_info
router.post('/addPersonList', (req, res) => {
  var sql = 'insert into chat_info (id, user, admin) value (?, ?, ?)'
  var params = req.body;
  conn.query(sql, [params.user, params.admin], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 添加chat_record_info
router.post('/addMsgList', (req, res) => {
  var sql = 'insert into chat_record_info (id, chat_msg, chat_time, chat_tips, is_read) value (?, ?, ?, 1)'
  var params = req.body;
  conn.query(sql, [params.chat_msg, params.chat_time, params.chat_tips], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 各个状态订单信息
router.post('/orderAll', (req, res) => {
  var sql = 'select order_id, order_status, brand_name, CONCAT(GROUP_CONCAT (concat(concat(shop_name), concat(";",shop_price), concat(";",totalNum), concat(";",shop_photo), concat(";",totalPrice), concat(";", shop_id), concat(";", buyPersonNum)))) AS shopList from (select order_info.order_id, order_info.totalNum, order_info.order_status, order_info.totalPrice, shop_info.shop_id, shop_info.buyPersonNum, shop_info.shop_name, shop_info.shop_price, shop_info.shop_photo, brand_name from order_info, shop_info, brand_info where order_info.shop_id=shop_info.shop_id and shop_info.brand_id=brand_info.brand_id and user_id=? order by order_info.id desc) tb1 GROUP BY order_id'
  var sql2 = 'select order_id, order_status, brand_name, CONCAT(GROUP_CONCAT (concat(concat(shop_name), concat(";",shop_price), concat(";",totalNum), concat(";",shop_photo), concat(";",totalPrice), concat(";", shop_id), concat(";", buyPersonNum)))) AS shopList from  (select order_info.order_id, order_info.totalNum, order_info.order_status, order_info.totalPrice, shop_info.shop_id, shop_info.buyPersonNum, shop_info.shop_name, shop_info.shop_price, shop_info.shop_photo, brand_name from order_info, shop_info, brand_info where order_info.shop_id=shop_info.shop_id and shop_info.brand_id=brand_info.brand_id and user_id=? order by order_info.id desc) tb1 where order_status=? GROUP BY order_id'
  var params = req.body;
  if(params.order_status==1){
    conn.query(sql, [params.user_id], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else{
    conn.query(sql2, [params.user_id, params.order_status], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }
});

// 确认收货
router.post('/ConfirmTheOrder', (req, res) => {
  var sql = 'update order_info set order_status=5, consigneeTime=? where order_id=? and order_status=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.order_status, params.consigneeTime, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 取消订单
router.post('/cancelOneOrder', (req, res) => {
  var sql = 'delete from order_info where order_id=? and order_status=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.order_status, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 退换货订单信息
router.post('/TheOrderAll', (req, res) => {
  var sql = 'select order_info.*, receiving_info.*, brand_name, CONCAT(GROUP_CONCAT (concat(concat(order_info.shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",order_info.totalNum), concat(";",shop_photo), concat(";",order_info.totalPrice), concat(";",buyPersonNum)))) AS shopList from order_info, shop_info, receiving_info, brand_info where order_info.shop_id=shop_info.shop_id and shop_info.brand_id=brand_info.brand_id and order_info.consignee_id=receiving_info.consignee_id and order_id=? and order_info.user_id=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result[0]);
    }
  })
});

// 提交退换货申请
router.post('/drawbackTheOrder', (req, res) => {
  var sql = "update order_info, user_info set order_status=0 where order_id=? and user_info.user_id=(select user_id from user_info where user_id=?)"
  var sql1 = "insert into drackback_info (order_id, drawback_reason, drawback_type, shop_status, drawback_tips) value (?, ?, ?, ?, ?)"
  var params = req.body;
  conn.query(sql, [params.order_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      conn.query(sql1, [params.order_id, params.drawback_reason, params.drawback_type, params.shop_status, params.drawback_tips], function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result) {
          jsonWrite(res, result);
        }
      })
    }
  })
});

// 写评价
router.post('/writeShopEvaluate', (req, res) => {
var sql = 'insert into evaluate_info (evaluate_cont, shop_id, evaluate_pic, evaluate_time, user_id) value (?, ?, ?, ?, ?)'

  var params = req.body;
  conn.query(sql, [params.evaluate_cont, params.shop_id, params.evaluate_pic, params.evaluate_time, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 确认评价
router.post('/EvaTheOrder', (req, res) => {
  var sql = 'update order_info set order_status=6 where order_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 购物车
router.post('/findShopCar', (req, res) => {
  var sql = 'select brand_name, CONCAT(GROUP_CONCAT (concat(concat(tb1.shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",shop_photo), concat(";",shop_num)))) AS shopList from (select shopcar_info.* from shopcar_info, shop_info where shopcar_info.shop_id=shop_info.shop_id and user_id=? group by shop_name having Count(shop_name)>=1) tb1, shop_info, brand_info where tb1.shop_id=shop_info.shop_id and shop_info.brand_id=brand_info.brand_id and user_id=? GROUP BY brand_info.brand_id'
  var sql1 = 'update shopcar_info set shop_num=(select COUNT(id) from shopcar_info where user_id=? group by shop_id having Count(shop_id)>1) where  user_id=? and shop_id in (select shopcar_info.shop_id from shopcar_info, shop_info where shopcar_info.shop_id=shop_info.shop_id and user_id=? group by shop_name having Count(shop_name)>1)'
  var sql2 = 'delete from shopcar_info where user_id=? and id not in(select max(id) from shopcar_info where user_id=? group by shop_id)'
  var params = req.body;
  conn.query(sql1, [params.user_id, params.user_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      conn.query(sql2, [params.user_id, params.user_id], function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result) {
          conn.query(sql, [params.user_id, params.user_id], function(err, result) {
            if (err) {
              console.log(err);
            }
            if (result) {
              jsonWrite(res, result);
            }
          })
        }
      })
    }
  })
});

// 购物车改变数量
router.post('/changeShopNum', (req, res) => {
  var sql = 'update shopcar_info set shop_num=? where shop_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.shop_num, params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 购物车删除
router.post('/delShopCar', (req, res) => {
  var sql = 'delete from shopcar_info where shop_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 加入购物车
router.post('/addShopCar', (req, res) => {
  var sql = 'insert into shopcar_info ( shop_id, shop_num, user_id) value (?, 1, ?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 去结算
router.post('/addShopAccounts', (req, res) => {
  var sql = 'insert into accounts_info (shop_id, shop_num, user_id) value (?, ?, ?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.shop_num,  params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 显示结算
router.post('/theShopAccounts', (req, res) => {
  var sql = 'select brand_name, CONCAT(GROUP_CONCAT (concat(concat(tb1.shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",shop_photo), concat(";",shop_num), concat(";",shop_stock), concat(";",buyPersonNum)))) AS shopList from (select accounts_info.* from accounts_info, shop_info where accounts_info.shop_id=shop_info.shop_id and user_id=? group by shop_name having Count(shop_name)>=1) tb1, shop_info, brand_info where tb1.shop_id=shop_info.shop_id and shop_info.brand_id=brand_info.brand_id and user_id=? GROUP BY brand_info.brand_id'
  var params = req.body;
  conn.query(sql, [params.user_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 取消结算
router.post('/delShopAccounts', (req, res) => {
  var sql = 'delete from accounts_info where user_id=?'
  var params = req.body;
  conn.query(sql, [params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 更改地址
router.post('/updateShopAddress', (req, res) => {
  var sql = 'select * from receiving_info where consignee_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.consignee_id, params.user_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 取消支付
router.post('/NoPayShopAccounts', (req, res) => {
  var sql = 'insert into order_info (order_id, shop_id, totalPrice, totalNum, order_status, consignee_id, user_id, remarks, orderTime, payTime) value (?, ?, ?, ?, 2, ?, ?, ?, ?, ?)'
  var sql1 = 'update shop_info set shop_stock=? where shop_id=?'
  var sql2 = 'delete from shopcar_info where shop_id=? and user_id=?'
  var sql3 = 'delete from accounts_info where shop_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.shop_id, params.totalPrice, params.totalNum, params.consignee_id, params.user_id, params.remarks, params.orderTime, params.payTime], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      conn.query(sql1, [params.shop_stock, params.shop_id], function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result) {
          conn.query(sql2, [params.shop_id, params.user_id], function(err, result) {
            if (err) {
              console.log(err);
            }
            if (result) {
              conn.query(sql3, [params.shop_id, params.user_id], function(err, result) {
                if (err) {
                  console.log(err);
                }
                if (result) {
                  jsonWrite(res, result);
                }
              })
            }
          })
        }
      })
    }
  })
});

// 完成付款
router.post('/payShopAccounts', (req, res) => {
  var sql = 'select user_password, account from user_info where user_id=? and user_password=?'
  var sql1 = 'insert into order_info (order_id, shop_id, totalPrice, totalNum, order_status, consignee_id, user_id, remarks, orderTime, payTime) value (?, ?, ?, ?, 3, ?, ?, ?, ?, ?)'
  var sql2 = "update user_info set account=? where user_id=?"
  var sql3 = 'update shop_info set shop_stock=?, buyPersonNum=? where shop_id=?'
  var sql4 = 'delete from shopcar_info where shop_id=? and user_id=?'
  var sql5 = 'delete from accounts_info where shop_id=? and user_id=?'
  var params = req.body;
  conn.query(sql, [params.user_id, params.user_password], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      if(result.length==0){
        result[0]='支付密码错误'
        jsonWrite(res, result);
      }else{
        result=result[0].account
        if(result<params.account){
          result[0]='余额不足'
          jsonWrite(res, result);
        }else{
          conn.query(sql2, [parseInt(result)-params.account, params.user_id], function(err, result) {
           if (err) {
              console.log(err);
            }
            if (result) {
              conn.query(sql1, [params.order_id, params.shop_id, params.totalPrice, params.totalNum, params.consignee_id, params.user_id, params.remarks, params.orderTime, params.payTime], function(err, result) {
                if (err) {
                  console.log(err);
                }
                if (result) {
                  conn.query(sql3, [params.shop_stock, params.buyPersonNum, params.shop_id], function(err, result) {
                    if (err) {
                      console.log(err);
                    }
                    if (result) {
                      conn.query(sql4, [params.shop_id, params.user_id], function(err, result) {
                        if (err) {
                          console.log(err);
                        }
                        if (result) {
                          conn.query(sql5, [params.shop_id, params.user_id], function(err, result) {
                            if (err) {
                              console.log(err);
                            }
                            if (result) {
                              jsonWrite(res, result);
                            }
                          })
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      }
    }
  })
});


// 付款
router.post('/PayOneOrder', (req, res) => {
  var sql = 'select user_password, account from user_info where user_id=? and user_password=?'
  var sql1 = "update user_info set account=? where user_id=?"
  var sql2 = 'update order_info set order_status=3, payTime=? where order_id=? and user_id=?'
  var sql3 = 'update shop_info set buyPersonNum=? where shop_id=?'
  var params = req.body;
  conn.query(sql, [params.user_id, params.user_password], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      if(result.length==0){
        result[0]='支付密码错误'
        jsonWrite(res, result);
      }else{
        result=result[0].account
        var tips = []
        if(result<params.account){
          tips[0]='余额不足'
          jsonWrite(res, tips);
        }else{
          conn.query(sql1, [parseInt(result)-params.account, params.user_id], function(err, result) {
            if (err) {
              console.log(err);
            }
            if (result) {
              conn.query(sql2, [ params.payTime, params.order_id, params.user_id], function(err, result) {
                if (err) {
                  console.log(err);
                }
                if (result) {
                  conn.query(sql3, [params.buyPersonNum, params.shop_id], function(err, result) {
                    if (err) {
                      console.log(err);
                    }
                    if (result) {
                      jsonWrite(res, result);
                    }
                  })
                }
              })
            }
          })
        }
      }
    }
  })
});



// 一定要加
module.exports = router;
