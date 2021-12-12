const path = require('path')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port: '3306',
  password: '123456',
  database: 'web3'
})

connection.connect()

const express = require('express')
const app = express()
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded( { extended: false } ))
app.use(bodyParser.json())


/* ------- routes ------- */

// get

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/pages/index.html')
})

app.get('/login_page', function (req, res) {
  res.sendFile(__dirname + '/public/pages/login.html')
})

app.get('/signup_page', function (req, res) {
  res.sendFile(__dirname + '/public/pages/signup.html')
})

app.get('/gallery', function (req, res) {
  res.sendFile(__dirname + '/public/pages/gallery.html')
})

app.get('/main_page', function (req, res) {
  res.sendFile(__dirname + '/public/pages/main.html')
})

app.get('/change_passwd_page', function (req, res) {
  res.sendFile(__dirname + '/public/pages/change-profile.html')
})

app.get('/watermark', function (req, res) {
  res.sendFile(__dirname + '/public/pages/watermark.html')
})

// post

app.post('/get_salt', function (req, res) {
  // req中只有email参数，查询users表获得该用户的uid
  // 获得uid后，再在user_auth表中查找该用户对应的salt

  let getUidSQL = `SELECT uid FROM users WHERE email = ${"'" + req.body.email + "'"}`

  connection.query(getUidSQL, function (err0, res0) {
    if (err0) {
      console.log(err0)
      return
    }
    if (res0.length === 0) {
      console.log('用户名或密码错误')
      res.json({
        code: -1,
        msg: '用户名或密码错误'
      })
    } else {
      let _uid = res0[0].uid
      let getSaltSQL = `SELECT uid, salt FROM user_auth WHERE uid = ${_uid}`
      connection.query(getSaltSQL, function (err1, res1) {
        res.json({
          code: 1,
          uid: res1[0].uid,
          salt: res1[0].salt
        })
      })
    }
  })
})

app.post('/login', function (req, res) {
  // 获取到盐后请求/login
  // 此时req中有两个参数：uid，以及原密码加盐后转化的哈希值passwd
  // 通过uid、passwd在user_auth表中检索即可

  let userPasswd = req.body.passwd
  let uid = req.body.uid
  let verifySQL = `SELECT * FROM user_auth WHERE passwd = ${"'" + userPasswd + "'"} AND uid = ${uid}`

  connection.query(verifySQL, function (err0, res0) {
    // 先查user_auth
    if (err0) {
      console.log(err0)
      return
    }
    if (res0.length === 0) {
      console.log('用户名或密码错误')
      res.json({
        code: -1,
        msg: '用户名或密码错误'
      })
    } else {
      // 邮箱、密码均正确后，从users表中获取用户基本信息返回给前端
      let loginSQL = `SELECT uid, email, display_name FROM users WHERE uid = ${uid}`
      connection.query(loginSQL, function (err1, res1) {
        if (err1) {
          console.log(err1)
          return
        }

        res.json({
          code: 1,
          msg: '登录成功',
          uid: res1[0].uid,
          email: res1[0].email,
          display_name: res1[0].display_name
        })
      })
    }
  })
})

app.post('/signup', function (req, res) {
  let signup = {
    'email': req.body.email,
    'passwd': req.body.passwd,
    'display_name': req.body.display_name,
    'salt': req.body.salt
  }

  let insUsersSQL = `INSERT INTO users(email, display_name)
                VALUES (${"'"+signup.email+"'"}, ${"'"+signup.display_name+"'"})`
  let findEmailSQL = `SELECT uid, email
                      FROM users
                      WHERE email = ${"'"+signup.email+"'"}`
  let findNameSQL = `SELECT display_name
                     FROM users
                     WHERE display_name = ${"'"+signup.display_name+"'"}`

  // 先查询用户邮箱、用户昵称是否存在
  connection.query(findEmailSQL, function (err0, res0) {
    // 查询邮箱
    if (err0) {
      return
    }
    if (res0.length !== 0) {
      console.log(signup.email + ' 此邮箱已注册')
      res.json({
        code: 0,
        msg: '邮箱已注册'
      })
    } else {
      // 查询昵称
      connection.query(findNameSQL, function (err1, res1) {
        if (err1) {
          console.log(err1)
          return
        }
        if (res1.length !== 0) {
          console.log(signup.display_name + ' 此昵称已注册')
          res.json({
            code: -1,
            msg: '用户昵称已注册'
          })
        } else {
          // 用户名，邮箱均不存在，插入数据库
          connection.query(insUsersSQL, function (err2, res2) {
            // 基本信息插入users表
            if (err2) {
              console.log(err2)
              return
            } else {
              // 安全信息插入user_auth表
              // 先获取uid
              let uidSQL = `SELECT uid FROM users WHERE email = ${"'"+signup.email+"'"}`
              connection.query(uidSQL, function (err3, res3) {
                if (err3) {
                  console.log(err3)
                  return
                } else {
                  signup.uid = res3[0].uid
                  let insAuthSQL = `INSERT INTO user_auth(uid, passwd, salt)
                    VALUES (${signup.uid}, ${"'"+signup.passwd+"'"}, ${"'"+signup.salt+"'"})`

                  // 获取到uid后，再以uid为索引插入auth表
                  connection.query(insAuthSQL, function (err4, res4) {
                    if (err4) {
                      console.log(err4)
                      return
                    } else {
                      console.log('注册成功')
                      res.json({
                        code: 1,
                        msg: '注册成功'
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
  })

})

app.post('/change_passwd', function (req, res) {
  let uid = req.body.uid
  let originalPasswd = req.body.originalPasswd
  let newPasswd = req.body.newPasswd
  let salt = req.body.salt

  let passwdCheckSQL = `SELECT * FROM user_auth WHERE uid = ${uid} AND passwd = ${"'"+originalPasswd+"'"}`
  connection.query(passwdCheckSQL, function (err0, res0) {
    if (err0) {
      console.log(err0)
      return
    } else {
      if (res0.length === 0) {
        console.log('原密码错误')
        res.json({
          code: -1,
          msg: '原密码错误'
        })
      } else {
        // 原密码正确，修改密码
        let changeSQL = `UPDATE user_auth SET passwd = ${"'"+newPasswd+"'"}, salt = ${"'"+salt+"'"} WHERE uid=${uid}`
        connection.query(changeSQL, function (err1, res1) {
          if (err1) {
            console.log(err1)
            return
          } else {
            res.json({
              code: 1,
              msg: '密码修改成功'
            })
          }
        })
      }
    }
  })
})

app.listen(3000, function () {
  console.log('http://localhost:3000')
})
