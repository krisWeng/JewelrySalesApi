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
        result.push(message)
        jsonWrite(res, result);
      }
    }
  })
});


// 轮播图
router.post('/carousel', (req, res) => {
  var sql = 'select * from carousel_info'
  var params = req.body;
  conn.query(sql, function(err, result) {
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
  var sql = "select * from shop_info where IsDelete=1 and show_index='true'"
  var params = req.body;
  conn.query(sql, function(err, result) {
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
  var sql = 'select * from shop_info where shop_id=? and IsDelete=1'
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

// 单个商品所有图片
router.post('/OneShopPic', (req, res) => {
  var sql = 'select * FROM pic_info where shop_id=?'
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
  var sql = 'select * from shop_info where second_classify_id=? and IsDelete=1'
  var params = req.body;
  conn.query(sql, [params.second_classify_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 商品列表 升序
router.post('/theShopListPriceAsc', (req, res) => {
  var sql = 'select * from shop_info where second_classify_id=? and IsDelete=1 order by shop_price asc'
  var params = req.body;
  conn.query(sql, [params.second_classify_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 商品列表 降序
router.post('/theShopListPriceDesc', (req, res) => {
  var sql = 'select * from shop_info where second_classify_id=? and IsDelete=1 order by shop_price desc'
  var params = req.body;
  conn.query(sql, [params.second_classify_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 商品列表 销量
router.post('/theShopListNumDesc', (req, res) => {
  var sql = 'select * from shop_info where second_classify_id=? and IsDelete=1 order by buyPersonNum desc'
  var params = req.body;
  conn.query(sql, [params.second_classify_id], function(err, result) {
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
  var sql = 'select * FROM evaluate_info where shop_id=?'

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
// 评价页用户信息
router.post('/userPic', (req, res) => {
  var sql = 'select * from user_info where IsDelete = 1'
  var params = req.body;
  conn.query(sql, function(err, result) {
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
  var sql = 'update user_info set user_password=? where user_name=?'
  var params = req.body;
  conn.query(sql, [params.user_password, params.user_name], function(err, result) {
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
  var sql = 'update user_info set pay_password=? where user_name=?'
  var params = req.body;
  conn.query(sql, [params.pay_password, params.user_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 个人信息
router.post('/userSet', (req, res) => {
  var sql = 'select * from user_info where user_id=? and IsDelete = 1'
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

// 修改个人信息
router.post('/updateMine', (req, res) => {
  var sql = 'update user_info set nick_name=?, sex=? where user_name=?'
  var params = req.body;
  conn.query(sql, [params.nick_name, params.sex, params.user_name], function(err, result) {
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
  var sql = 'select * from receiving_info where user_name=? and IsDelete = 1'
  var params = req.body;
  conn.query(sql, [params.user_name], function(err, result) {
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
  var sql = 'select * from receiving_info where consignee_id=? and IsDelete = 1'
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
  var sql = 'update receiving_info set consignee=?, consignee_phone=?, province=?, city=?, address=? where consignee_id=?'
  var params = req.body;
  conn.query(sql, [params.consignee, params.consignee_phone, params.province, params.city, params.address, params.consignee_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 保存地址
router.post('/addOneAddress', (req, res) => {
  var sql = 'insert into receiving_info (consignee, consignee_phone, province, city, address, user_name, IsDelete) value (?, ?, ?, ?, ?, ?, 1)'
  var params = req.body;
  conn.query(sql, [params.consignee, params.consignee_phone, params.province, params.city, params.address, params.user_name], function(err, result) {
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
  var sql = 'update receiving_info set IsDelete=0 where consignee_id=?'
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

// 个人订单
router.post('/mineOrder', (req, res) => {
  var sql = 'select * from order_info where user_id=? and IsDelete = 1'
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

// 各个状态订单信息
router.post('/orderAll', (req, res) => {
  var sql = 'select order_id, brand_name, order_status, totalNum, totalPrice, consignee_id, CONCAT(GROUP_CONCAT (concat(concat(shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",totalNum), concat(";",shop_photo), concat(";",totalPrice)))) AS shopList FROM order_info where order_status=? and user_name=? and IsDelete = 1 GROUP BY order_id, order_status, sameOrder'
  var sql2 = 'select order_id, brand_name, order_status, totalNum, totalPrice, consignee_id, IsDelete, CONCAT(GROUP_CONCAT (concat(concat(shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",totalNum), concat(";",shop_photo), concat(";",totalPrice)))) AS shopList FROM order_info where order_status=2 or order_status=3 or order_status=4 or order_status=5 or order_status=6 or order_status=7 or order_status=0 and user_name=? GROUP BY order_id, order_status, sameOrder'

  var params = req.body;
  if(params.order_status==1){
    conn.query(sql2, [params.user_name], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else{
    conn.query(sql, [params.order_status, params.user_name], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }
});

// 取消订单
router.post('/cancelOneOrder', (req, res) => {
  var sql = 'update order_info set IsDelete=0 where order_id=? and order_status=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.order_status], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 付款
router.post('/PayOneOrder', (req, res) => {
  var sql = 'update order_info set order_status=3, payTime=? where order_id=?'
  var params = req.body;
  conn.query(sql, [params.payTime, params.order_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 确认收货
router.post('/ConfirmTheOrder', (req, res) => {
  var sql = 'update order_info set order_status=5, consigneeTime=? where order_id=? and order_status=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.order_status, params.consigneeTime], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 退款
router.post('/drawbackTheOrder', (req, res) => {
  var sql = 'update order_info set order_status=0, drawback_type=?, drawback_reason=?, drawback_tips=?, shop_status=? where order_id=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.drawback_type, params.drawback_reason, params.drawback_tips, params.shop_status], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 这个订单信息
router.post('/TheOrderAll', (req, res) => {
  var sql = 'select order_id, brand_name, order_status, totalNum, totalPrice, consignee_id, consignee, consignee_phone, province, city, address, logistics_company, courier_number, logistic_information, orderTime, payTime, deliveryTime, consigneeTime, drawbackTime, IsDelete, CONCAT(GROUP_CONCAT (concat(concat(shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",totalNum), concat(";",shop_photo), concat(";",totalPrice)))) AS shopList FROM order_info where order_id=? GROUP BY order_id, order_status, sameOrder'

  var params = req.body;
  conn.query(sql, [params.order_id], function(err, result) {
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
  var sql = 'select * FROM collection_info where IsDelete=1'

  var params = req.body;
  conn.query(sql, function(err, result) {
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
  var sql = 'delete from collection_info where shop_id=?'

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


// 分类
router.post('/AllClassify', (req, res) => {
  var sql = 'select classify_id, classify_name, CONCAT(GROUP_CONCAT (concat(concat(classify_contID), concat(";",classify_cont)))) AS classify FROM classify_info where IsDelete = 1 GROUP BY classify_id'

  var params = req.body;
  conn.query(sql, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 各个分类
router.post('/theClassify', (req, res) => {
  var sql = 'select classify_id, classify_name, CONCAT(GROUP_CONCAT (concat(concat(classify_contID), concat(";",classify_cont)))) AS classify FROM classify_info where classify_id=? and IsDelete = 1 GROUP BY classify_name'

  var params = req.body;
  conn.query(sql, [params.classify_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 各个分类内容
router.post('/theClassifyCont', (req, res) => {
  // var sql = 'select * FROM classifyshop_info where classify_cont=? and IsDelete = 1'
  var sql = 'select classifyshop_info.classify_cont,classifyshop_info.shop_pic FROM classifyshop_info LEFT OUTER JOIN classify_info ON classifyshop_info.classify_contID = classify_info.classify_contID where classify_info.classify_name=?'

  var params = req.body;
  conn.query(sql, [params.classify_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 写评价
router.post('/theOrderMsg', (req, res) => {
  var sql = 'select * FROM order_info where order_id=?'

  var params = req.body;
  conn.query(sql, [params.order_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
router.post('/writeShopEvaluate', (req, res) => {
var sql = 'insert into evaluate_info (evaluate_cont, shop_id, shop_name, evaluate_pic, evaluate_time, nick_name, user_name) value (?, ?, ?, ?, ?, ?, ?)'

  var params = req.body;
  conn.query(sql, [params.evaluate_cont, params.shop_id, params.shop_name, params.evaluate_pic, params.evaluate_time, params.nick_name, params.user_name], function(err, result) {
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
  var sql = 'update order_info set order_status=6 where order_id=? and order_status=?'
  var params = req.body;
  conn.query(sql, [params.order_id, params.order_status], function(err, result) {
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
  var sql = 'insert into shopcar_info (shop_name, shop_id, shop_price, shop_pic, shop_num, shop_stock, brand_name, brand_id, user_name, IsDelete) value (?, ?, ?, ?, 1, ?, ?, ?, ?, 1)'
  var params = req.body;
  conn.query(sql, [params.shop_name, params.shop_id, params.shop_price, params.shop_pic, params.shop_stock, params.brand_name, params.brand_id, params.user_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 购物车
router.post('/theShopCar', (req, res) => {
  // var sql = 'select * from shopcar_info where IsDelete=1'
  var sql = 'select brand_name, brand_id, CONCAT(GROUP_CONCAT (concat(concat(shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",shop_pic), concat(";",shop_num), concat(";",shop_stock)))) AS shopList FROM shopcar_info where user_name=? and IsDelete=1 GROUP BY brand_id'

  var params = req.body;
  conn.query(sql, [params.user_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 购物车改变数量
router.post('/changeShopNum', (req, res) => {
  var sql = 'update shopcar_info set shop_num=? where shop_id=?'
  var params = req.body;
  conn.query(sql, [params.shop_num, params.shop_id], function(err, result) {
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
  var sql = 'delete from shopcar_info where shop_id=?'
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

// 购物车收藏
router.post('/colShopCar', (req, res) => {
  var sql = 'insert into collection_info (shop_name, shop_id, shop_price, shop_pic, IsDelete) value (?, ?, ?, ?, 1)'
  var params = req.body;
  conn.query(sql, [params.shop_name, params.shop_id, params.shop_price, params.shop_pic], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 去结算
router.post('/toShopAccounts', (req, res) => {
  var sql = 'insert into accounts_info (shop_name, shop_id, shop_price, shop_pic, shop_num, brand_id, brand_name, shop_stock, IsDelete) value (?, ?, ?, ?, ?, ?, ?, ?, 1)'

  var params = req.body;
  conn.query(sql, [params.shop_name, params.shop_id, params.shop_price, params.shop_pic, params.shop_num, params.brand_id, params.brand_name, params.shop_stock], function(err, result) {
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
  var sql = 'delete from accounts_info'
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
// 显示结算
router.post('/theShopAccounts', (req, res) => {
  var sql = 'select brand_name, brand_id, CONCAT(GROUP_CONCAT (concat(concat(shop_id), concat(";",shop_name), concat(";",shop_price), concat(";",shop_pic), concat(";",shop_num), concat(";",shop_stock)))) AS shopList FROM accounts_info where IsDelete=1 GROUP BY brand_id'
  var params = req.body;
  conn.query(sql, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 得到sameOrder
router.post('/getsameOrder', (req, res) => {
  var sql = 'select max(sameOrder) as sameOrder from order_info'
  var params = req.body;
  conn.query(sql, function(err, result) {
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
  var sql = 'select * FROM receiving_info where consignee_id=?'
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
// 完成付款
router.post('/payShopAccounts', (req, res) => {
  var sql = 'insert into order_info (shop_name, shop_id, shop_price, shop_photo, brand_name, brand_id, totalPrice, totalNum, order_id, order_status, consignee, consignee_phone, consignee_id, province, city, address, user_name, user_id, remarks, orderTime, payTime, sameOrder, theOrderNum, IsDelete) value (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)'
  var params = req.body;
  conn.query(sql, [params.shop_name, params.shop_id, params.shop_price, params.shop_photo, params.brand_name, params.brand_id, params.totalPrice, params.totalNum, params.order_id, params.order_status, params.consignee, params.consignee_phone, params.consignee_id, params.province, params.city, params.address, params.user_name, params.user_id, params.remarks, params.orderTime, params.payTime, params.sameOrder], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 修改商品付款人数
router.post('/findShopBuyNum', (req, res) => {
  var sql = "select buyPersonNum from shop_info where shop_id=?"
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
router.post('/updateShopBuyNum', (req, res) => {
  var sql = "update shop_info set buyPersonNum=? where shop_id=?"
  var params = req.body;
  conn.query(sql, [params.buyPersonNum, params.shop_id], function(err, result) {
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
  var sql = 'select * FROM admin_info where IsDelete = 1'
  var params = req.body;
  conn.query(sql, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 消息内容
router.post('/newsCont', (req, res) => {
  var sql = 'select * FROM news_info'
  var params = req.body;
  conn.query(sql, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 消息框
router.post('/sendToAdmin', (req, res) => {
  var sql = 'select * FROM admin_info where admin_id=?'
  var params = req.body;
  conn.query(sql, [params.admin_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 发消息
router.post('/sendMsgTo', (req, res) => {
  var sql = 'insert into news_info (from_id, from_name, to_id, to_name, news_msg, news_time, is_read) value (?, ?, ?, ?, ?, ?, 1)'
  var params = req.body;
  conn.query(sql, [params.from_id, params.from_name, params.to_id, params.to_name, params.news_msg, params.news_time], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 已读
router.post('/readTheNewsUser', (req, res) => {
  var sql = 'update news_info set is_read=0 where from_id=? and is_read=1'
  var params = req.body;
  conn.query(sql, [params.from_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 一定要加
module.exports = router;
