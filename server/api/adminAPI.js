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

// -----------------------------管理员---------------------------
// 登录
router.post('/adminLogin', (req, res) => {
  var sql = 'select * from admin_info where admin_name = ? and admin_password = ? and IsDelete = 1'
  var params = req.body;
  conn.query(sql, [params.admin_name, params.admin_password], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 卡片内容
router.post('/CartAllNum', (req, res) => {
  var sql = 'select t1.userNum, t2.orderNum, t3.moneyNum from (select count(user_id) as userNum from user_info) t1, (select count(id) as orderNum from order_info) t2, (select sum(totalPrice) as moneyNum from order_info where order_info.drawbackTime is null) t3, admin_info where admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      let a = {}
      a.name="会员人数"
      a.num = result[0].userNum
      let b = {}
      b.name="订单总数"
      b.num = result[0].orderNum
      let c = {}
      c.name="金额总数"
      c.num = result[0].moneyNum
      result[0]=a
      result.push(b)
      result.push(c)
      jsonWrite(res, result);
    }
  })
});

// 不同状态的订单数
router.post('/CartAllStatusNum', (req, res) => {
  var sql = 'select count(case when order_status = 2 then 1 end) as wait_pay, count(case when order_status = 3 then 1 end) as wait_send, count(case when order_status = 4 then 1 end) as wait_get, count(case when order_status = 6 then 1 end) as ok, count(case when order_status = 0 then 1 end) as wait_back, count(case when order_status = 7 then 1 end) as okDrak from (select order_info.* from order_info GROUP BY order_id HAVING count(order_id)>=1) tb_1, admin_info where admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 订单总数
router.post('/AllOrderNum', (req, res) => {
  var sql = 'select order_info.* from order_info, admin_info where DATE_SUB(CURDATE(), INTERVAL'+'day=?'+' DAY) <= date(payTime) and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var sql2 = "select date_format(payTime,'%Y-%m-%d') as payTime, count(id) as order_num from order_info, admin_info where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(payTime) GROUP BY date_format(payTime,'%Y-%m-%d') and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var sql3 = "select date_format(payTime,'%Y-%m-%d') as payTime, count(id) as order_num from order_info, admin_info where DATE_SUB(CURDATE(), INTERVAL 15 DAY) <= date(payTime) GROUP BY date_format(payTime,'%Y-%m-%d') and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var sql4 = "select date_format(payTime,'%Y-%m-%d') as payTime, count(id) as order_num from order_info, admin_info where DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= date(payTime) GROUP BY date_format(payTime,'%Y-%m-%d') and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var params = req.body;
  if(params.day==7){
    conn.query(sql2, [params.admin_uuid], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else if(params.day==15){
    conn.query(sql3, [params.admin_uuid], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else if(params.day==30){
    conn.query(sql4, [params.admin_uuid], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }
});

// 所有用户
router.post('/findAllUser', (req, res) => {
  var sql = 'select user_info.* from user_info, admin_info where user_info.IsDelete = 1 and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 条件搜索用户
router.post('/findOneUser', (req, res) => {
  var sql = 'select user_info.* from user_info, admin_info where user_info.IsDelete = 1 and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) and (user_info.user_name=? or user_info.nick_name=? or user_info.user_phone=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid, params.user_name, params.nick_name, params.user_phone], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑用户
router.post('/updateOneUser', (req, res) => {
  var sql = 'update user_info, admin_info set user_info.user_name=?, user_info.nick_name=?, user_info.sex=?, user_info.user_phone=? where user_info.user_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.user_name, params.nick_name, params.sex, params.user_phone, params.user_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});



// 所有管理员
router.post('/findAllAdmin', (req, res) => {
  var sql = 'select * from admin_info where IsDelete = 1'
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

// 添加管理员
router.post('/addOneAdmin', (req, res) => {
  var sql = 'insert into admin_info (admin_name, admin_password, admin_phone, sex, IsDelete) value (?, ?, ?, ?, 1)';
  var params = req.body;
  conn.query(sql, [params.admin_name, params.admin_password, params.admin_phone, params.sex], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑管理员
router.post('/updateOneAdmin', (req, res) => {
  var sql = 'update admin_info set admin_name=?, admin_phone=?, sex=? where admin_uuid=?'
  var params = req.body;
  conn.query(sql, [params.admin_name, params.admin_phone, params.sex, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 条件搜索管理员
router.post('/findOneAdmin', (req, res) => {
  var sql = 'select * from admin_info where IsDelete = 1 and (admin_name=? or admin_phone=?)'
  var params = req.body;
  conn.query(sql, [params.admin_name, params.admin_phone], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 重置管理员密码
router.post('/updatePassword', (req, res) => {
  var sql = 'update admin_info set admin_password=? where admin_uuid=?'
  var params = req.body;
  conn.query(sql, [params.admin_password, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 软删除管理员
router.post('/delOneAdmin', (req, res) => {
  var sql = 'update admin_info set IsDelete=0 where admin_uuid=?'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 所有订单
router.post('/findAllOrder', (req, res) => {
  var sql = 'select order_info.*, shop_name, user_name, brand_name, receiving_info.* from order_info, admin_info, shop_info, user_info, brand_info, receiving_info where order_info.shop_id=shop_info.shop_id and order_info.user_id=user_info.user_id and shop_info.brand_id=brand_info.brand_id and order_info.consignee_id=receiving_info.consignee_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by order_info.id desc'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 不同状态下的订单
router.post('/findStatusOrder', (req, res) => {
  var sql = 'select order_info.*, shop_name, user_name, brand_name, receiving_info.* from order_info, admin_info, shop_info, user_info, brand_info, receiving_info where order_info.shop_id=shop_info.shop_id and order_info.user_id=user_info.user_id and shop_info.brand_id=brand_info.brand_id and order_info.consignee_id=receiving_info.consignee_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by order_info.id desc'
  var sql2 = 'select order_info.*, user_name, shop_name, brand_name, receiving_info.* from order_info, admin_info, user_info, shop_info, brand_info, receiving_info where order_status=? and order_info.user_id=user_info.user_id and order_info.shop_id=shop_info.shop_id and shop_info.brand_id=brand_info.brand_id and order_info.consignee_id=receiving_info.consignee_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by id desc'
  var params = req.body;
  if(params.order_status==1){
    conn.query(sql, [params.admin_uuid], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }else{
    conn.query(sql2, [params.order_status, params.admin_uuid], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    })
  }
});

// 条件搜索订单
router.post('/findOneOrder', (req, res) => {
  var sql = 'select order_info.*, shop_name, user_name, brand_name, receiving_info.* from order_info, admin_info, shop_info, user_info, brand_info, receiving_info, logistics_info where order_info.shop_id=shop_info.shop_id and order_info.user_id=user_info.user_id and shop_info.brand_id=brand_info.brand_id and order_info.consignee_id=receiving_info.consignee_id and order_info.order_id=logistics_info.order_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) and (order_info.order_id=? or user_info.user_name=? or receiving_info.consignee=? or receiving_info.address=? or logistics_info.logistics_number=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid, params.order_id, params.user_name, params.consignee, params.address, params.logistics_number], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 确认发货
router.post('/updateOneDeliver', (req, res) => {
  var sql = "update order_info, admin_info set order_status=4, deliveryTime=? where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var sql1 = "insert into logistics_info (order_id, logistics_company, logistics_number, logistics_information) value (?, ?, ?, ?)"
  var params = req.body;
  conn.query(sql, [params.deliveryTime, params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      conn.query(sql1, [params.order_id, params.logistics_company, params.logistics_number, params.logistics_information], function(err, result) {
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
// 确认收货
router.post('/updateOneReceiving', (req, res) => {
  var sql = "update order_info, admin_info set order_status=5, consigneeTime=? where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var params = req.body;
  conn.query(sql, [params.consigneeTime, params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 获取退款申请
router.post('/findDrawback', (req, res) => {
  var sql = 'select drackback_info.* from drackback_info, admin_info where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 确认退款
router.post('/updateOneDrawback', (req, res) => {
  var sql = "update order_info, admin_info set order_status=7, drawbackTime=? where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var params = req.body;
  conn.query(sql, [params.drawbackTime, params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 查询订单总数,订单总价,账户余额,商品库存
router.post('/findOrderMsg', (req, res) => {
  var sql = 'select order_info.totalPrice, order_info.totalNum, user_info.account, user_info.user_id, shop_info.shop_stock, shop_info.shop_id from order_info, user_info, shop_info, admin_info where user_info.user_id=order_info.user_id and shop_info.shop_id=order_info.shop_id and order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 修改账户余额
router.post('/updateAccOunt', (req, res) => {
  var sql = "update user_info, admin_info set account=? where user_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var params = req.body;
  conn.query(sql, [params.account, params.user_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 修改商品库存
router.post('/updateShopStock', (req, res) => {
  var sql = "update shop_info, admin_info set shop_stock=? where shop_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var params = req.body;
  conn.query(sql, [params.shop_stock, params.shop_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 拒绝退款
router.post('/updateNoDrawback', (req, res) => {
  var sql = "update order_info, admin_info set order_status=5 where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var sql1 = "delete from drackback_info where order_id=?"
  var params = req.body;
  conn.query(sql, [params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      conn.query(sql1, [params.order_id], function(err, result) {
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

// 编辑收货人信息
router.post('/updateOneConsignee', (req, res) => {
  var sql = "update order_info, admin_info set consignee=?, consignee_phone=?, province=?, city=?, address=? where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var params = req.body;
  conn.query(sql, [params.consignee, params.consignee_phone, params.province, params.city, params.address, params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 查询物流信息
router.post('/findLogistics', (req, res) => {
  var sql = 'select logistics_info.* from logistics_info, admin_info where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑物流信息
router.post('/updateOneLogistics', (req, res) => {
  var sql = "update logistics_info, admin_info set logistics_information=? where order_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)"
  var params = req.body;
  conn.query(sql, [params.logistics_information, params.order_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 所有品牌
router.post('/findAllBrand', (req, res) => {
  var sql = 'select brand_info.* from brand_info, admin_info where brand_info.IsDelete=1 and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by brand_info.id desc'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 条件搜索品牌
router.post('/findOneBrand', (req, res) => {
  var sql = 'select brand_info.* from brand_info, admin_info where brand_info.IsDelete=1 and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) and (brand_id=? or brand_name=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid, params.brand_id, params.brand_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑品牌
router.post('/updateOneBrand', (req, res) => {
  var sql = 'update brand_info, admin_info set brand_id=?, brand_name=? where id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.brand_id, params.brand_name, params.id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 添加品牌
router.post('/addOneBrand', (req, res) => {
  var sql = 'insert into brand_info (brand_id, brand_name, IsDelete) value (?, ?, 1)'
  var params = req.body;
  conn.query(sql, [params.brand_id, params.brand_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 查询品牌下的商品数量
router.post('/delOneBrand', (req, res) => {
  var sql = 'select count(shop_info.shop_id) as shopNum from brand_info, shop_info, admin_info where brand_info.id=? and brand_info.brand_id=shop_info.brand_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var sql1 = 'update brand_info, admin_info set brand_info.IsDelete=0 where id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      if(result[0].shopNum==0){
        conn.query(sql1, [params.id, params.admin_uuid], function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            jsonWrite(res, result);
          }
        })
      }else if(result[0].shopNum!=0){
        let message="该品牌下还有商品"
        result[0] = message
        jsonWrite(res, result);
      }
    }
  })
});

// 一级分类
router.post('/findFirstClassify', (req, res) => {
  var sql = 'select first_classify_info.* from first_classify_info, admin_info where admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by first_classify_info.id desc'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑一级分类
router.post('/updateFirstClassify', (req, res) => {
  var sql = 'update first_classify_info, admin_info set first_classify_id=?, first_classify_name=? where first_classify_info.id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.first_classify_id, params.first_classify_name, params.id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 删除一级分类
router.post('/delFirstClassify', (req, res) => {
  var sql = 'select count(second_classify_info.second_classify_id) as ClassifyNum from second_classify_info, first_classify_info, admin_info where first_classify_info.first_classify_id=? and second_classify_info.first_classify_id=first_classify_info.first_classify_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var sql1 = 'delete from first_classify_info where first_classify_id=?'
  var params = req.body;
  conn.query(sql, [params.first_classify_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      if(result[0].ClassifyNum==0){
        conn.query(sql1, [params.first_classify_id], function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            jsonWrite(res, result);
          }
        })
      }else if(result[0].ClassifyNum!=0){
        let message="该分类下还有二级分类"
        result[0] = message
        jsonWrite(res, result);
      }
    }
  })
});

// 添加一级
router.post('/addFirstClassify', (req, res) => {
  var sql = 'insert into first_classify_info (first_classify_id, first_classify_name) value (?, ?)'
  var params = req.body;
  conn.query(sql, [params.first_classify_id, params.first_classify_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 二级分类
router.post('/findsecondClassify', (req, res) => {
  var sql = 'select second_classify_info.*, first_classify_info.first_classify_name from second_classify_info, first_classify_info, admin_info where second_classify_info.first_classify_id =first_classify_info.first_classify_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by second_classify_info.id desc'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
router.post('/findsecondClassifyPic', (req, res) => {
  var sql = 'select second_classify_pic_info.* from second_classify_pic_info, admin_info where second_classify_pic_info.second_classify_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.second_classify_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 分类查询 二级分类
router.post('/findfirstSecondClassify', (req, res) => {
  var sql = 'select second_classify_info.*, first_classify_info.first_classify_name from second_classify_info, first_classify_info, admin_info where second_classify_info.first_classify_id=? and second_classify_info.first_classify_id =first_classify_info.first_classify_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by second_classify_info.id desc'
  var params = req.body;
  conn.query(sql, [params.first_classify_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑二级分类
router.post('/updatesecondClassify', (req, res) => {
  var sql = 'update second_classify_info, admin_info set second_classify_id=?, first_classify_id=?, second_classify_name=? where second_classify_info.id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.second_classify_id, params.first_classify_id, params.second_classify_name, params.id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
router.post('/delOneSecondpPic', (req, res) => {
  var sql = 'delete from second_classify_pic_info where second_classify_id=?'
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
// 添加分类图
router.post('/addOneSecondpPic', (req, res) => {
  var sql = 'insert into second_classify_pic_info (pic_root, second_classify_id) value (?, ?)'
  var params = req.body;
  conn.query(sql, [params.pic_root, params.second_classify_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 删除二级分类
router.post('/delsecondClassify', (req, res) => {
  var sql = 'select count(shop_info.shop_id) as ShopNum from second_classify_info, shop_info, admin_info where second_classify_info.second_classify_id=? and shop_info.second_classify_id=second_classify_info.second_classify_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var sql1 = 'delete from second_classify_info where second_classify_id=?'
  var params = req.body;
  conn.query(sql, [params.second_classify_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      if(result[0].ShopNum==0){
        conn.query(sql1, [params.second_classify_id], function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            jsonWrite(res, result);
          }
        })
      }else if(result[0].ShopNum!=0){
        let message="该分类下还有商品"
        result[0] = message
        jsonWrite(res, result);
      }
    }
  })
});

// 添加二级分类
router.post('/addSecondClassify', (req, res) => {
  var sql = 'insert into second_classify_info (second_classify_id, first_classify_id, second_classify_name) value (?, ?, ?)'
  var params = req.body;
  conn.query(sql, [params.second_classify_id, params.first_classify_id, params.second_classify_name], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
router.post('/addSecondClassifyPic', (req, res) => {
  var sql = 'insert into second_classify_pic_info (second_classify_id, pic_root) value (?, ?)'
  var params = req.body;
  conn.query(sql, [params.second_classify_id, params.pic_root], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 所有商品
router.post('/findAllShop', (req, res) => {
  var sql = 'select shop_info.*, second_classify_info.second_classify_name, brand_info.brand_name from shop_info, admin_info, second_classify_info, brand_info where shop_info.second_classify_id=second_classify_info.second_classify_id and shop_info.brand_id=brand_info.brand_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by shop_info.id desc'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 条件搜索商品
router.post('/findOneShop', (req, res) => {
  var sql = 'select shop_info.*, brand_info.brand_name from shop_info, admin_info, brand_info where shop_info.brand_id=brand_info.brand_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) and (shop_id=? or brand_info.brand_name=? or show_index=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid, params.shop_id, params.brand_name, params.show_index], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 编辑商品
router.post('/updateOneShop', (req, res) => {
  var sql = 'update shop_info, admin_info set shop_name=?, shop_id=?, shop_photo=?, shop_model=?, shop_pattern=?, shop_price=?, old_price=?, brand_id=?, shop_stock=?, shop_info.sex=?, material=?, mosaic_material=?, quality=?, nowGoods=?, market_time=?, first_classify_id=?, second_classify_id=?, show_index=? where id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.shop_name, params.shop_id, params.shop_photo, params.shop_model, params.shop_pattern, params.shop_price, params.old_price, params.brand_id, params.shop_stock, params.sex, params.material, params.mosaic_material, params.quality, params.nowGoods, params.market_time, params.first_classify_id, params.second_classify_id, params.show_index, params.id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 查询详情图
router.post('/findOneShopDetail', (req, res) => {
  var sql = 'select detail_root from detail_info, admin_info where shop_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
router.post('/delOneShopDetail', (req, res) => {
  var sql = 'delete from detail_info where shop_id=?'
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
// 添加详情图
router.post('/addOneShopDetail', (req, res) => {
  var sql = 'insert into detail_info (detail_root, shop_id) value (?, ?)'
  var params = req.body;
  conn.query(sql, [params.detail_root, params.shop_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 查询实拍图
router.post('/findOneShopPhoto', (req, res) => {
  var sql = 'select photo_root from photo_info, admin_info where shop_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
router.post('/delOneShopPhoto', (req, res) => {
  var sql = 'delete from photo_info where shop_id=?'
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
// 添加详情图
router.post('/addOneShopPhoto', (req, res) => {
  var sql = 'insert into photo_info (photo_root, shop_id) value (?, ?)'
  var params = req.body;
  conn.query(sql, [params.photo_root, params.shop_id], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 下架商品
router.post('/delOneShop', (req, res) => {
  var sql = 'update shop_info, admin_info set shop_info.IsDelete=0 where shop_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 上架商品
router.post('/backOneShop', (req, res) => {
  var sql = 'update shop_info, admin_info set shop_info.IsDelete=1 where shop_id=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.shop_id, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 发布商品
router.post('/addOneShopCont', (req, res) => {
  var sql = 'insert into shop_info (shop_photo, shop_id, shop_name, shop_price, brand_id, show_index, shop_stock, first_classify_id, second_classify_id, material, sex, quality, nowGoods, shop_model, shop_pattern, mosaic_material, market_time, buyPersonNum, IsDelete) value (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)'
  var params = req.body;
  conn.query(sql, [params.shop_photo, params.shop_id, params.shop_name, params.shop_price, params.brand_id, params.show_index, params.shop_stock, params.first_classify_id, params.second_classify_id, params.material, params.sex, params.quality, params.nowGoods, params.shop_model, params.shop_pattern, params.mosaic_material, params.market_time], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 更新轮播图
router.post('/findOneCar', (req, res) => {
  var sql = 'select pic_List from carousel_info, admin_info where admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?)'
  var params = req.body;
  conn.query(sql, [params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
router.post('/delOneCar', (req, res) => {
  var sql = 'delete from carousel_info'
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
router.post('/addOneCar', (req, res) => {
  var sql = 'insert into carousel_info (pic_List) value (?)'
  var params = req.body;
  conn.query(sql, [params.pic_List], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});


// 消息管理列表
router.post('/findPersonList', (req, res) => {
  var sql = 'select tb_2.* from (select admin_info.sex as adminSex, user_info.sex as userSex, admin_info.admin_name, user_info.user_name, chat_info.user, chat_info.admin, chat_record_info.* from chat_info, chat_record_info, admin_info, user_info where chat_record_info.id=chat_info.id and chat_info.admin=? and chat_info.admin=admin_info.admin_uuid and chat_info.user=user_info.user_id and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by chat_record_info.id) tb_2  where id in (select max(tb_1.id) from (select chat_info.user, chat_info.admin, chat_record_info.* from chat_info, chat_record_info, admin_info where chat_record_info.id=chat_info.id and chat_info.admin=? and admin_info.admin_uuid=(select admin_uuid from admin_info where admin_uuid=?) order by chat_record_info.id) tb_1 GROUP BY tb_1.user HAVING COUNT(tb_1.user)>=1);'
  var params = req.body;
  conn.query(sql, [params.admin, params.admin_uuid, params.admin, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});
// 聊天记录
router.post('/findChatList', (req, res) => {
  var sql = 'select chat_record_info.*, admin_info.sex as adminSex from chat_record_info, admin_info where chat_record_info.id in (select id from chat_info where user=? and admin=?) and admin_info.admin_uuid=?';
  var params = req.body;
  conn.query(sql, [params.user, params.admin_uuid, params.admin_uuid], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      jsonWrite(res, result);
    }
  })
});

// 发送消息
// 添加chat_info
router.post('/addChatList', (req, res) => {
  var sql = 'insert into chat_info (user, admin) value (?, ?)'
  var sql1 = 'insert into chat_record_info (chat_msg, chat_time, chat_tips, is_read) value (?, ?, ?, 1)'
  var params = req.body;
  conn.query(sql, [params.user, params.admin], function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      conn.query(sql1, [params.chat_msg, params.chat_time, params.chat_tips], function(err, result) {
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

// 已读
router.post('/readTheNews', (req, res) => {
  var sql = 'update chat_record_info set is_read=0 where chat_tips=0 and id in (select id from chat_info where user=? and admin=?)';
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


// 联系人订单表格
router.post('/finduserOrder', (req, res) => {
  var sql = 'select order_info.order_id, order_info.totalPrice, order_info.totalNum, order_info.remarks, order_info.order_status, shop_info.shop_photo, shop_info.shop_name, user_name, receiving_info.province, receiving_info.city, receiving_info.address from order_info, shop_info, user_info, receiving_info where order_info.shop_id=shop_info.shop_id and order_info.consignee_id=receiving_info.consignee_id and order_info.user_id=user_info.user_id and order_info.user_id=?';
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


// 一定要加
module.exports = router;
