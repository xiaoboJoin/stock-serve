const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const mongo = require('koa-mongo')
const session = require('koa-session-minimal')
const MysqlSession = require('koa-mysql-session')


const index = require('./routes/index')
const user = require('./routes/users')

const stock = require('./routes/stock')

// const leetcode = require('./routes/leetcode')
// const pay = require('./routes/pay')


// user: 'root',
// password: 'public',
// host: "47.96.19.217",
// database: 'lijinbu',
// 配置存储session信息的mysql
let store = new MysqlSession({
    user: "root",
    password: "public",
    database: 'task',
    host: "47.96.19.217",

})

// 存放sessionId的cookie配置
let cookie = {
    key: "sid",
    maxAge: 86400000, // cookie有效时长
    expires: 86400000, // cookie失效时间
    // path: '', // 写cookie所在的路径
    // domain: '', // 写cookie所在的域名
    httpOnly: true, // 是否只用于http请求中获取
    overwrite: false, // 是否允许重写
    // secure: true,
    // sameSite: true,
    // signed: true,
}


app.use(mongo({
    uri: 'mongodb://root:admin@39.107.76.247:27017/stock',
    max: 100,
    min: 1
}));


// error handler
onerror(app)
// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))

// 使用session中间件
app.use(session({
    key: 'JSESSIONID',
    store: store,
    cookie: cookie,
}))


// logger
app.use(async (ctx, next) => {
    console.log(ctx.session);


    // if (!ctx.session.user_id && ctx.session.user && ctx.session.user.mobile) {
    //     let user = await ctx.db.collection('users').findOne({
    //         'user.mobile': ctx.session.user.mobile,
    //     });

    //     if (user) {
    //         //老用户
    //         ctx.session.user_id = user._id;
    //     }
    // }

    const start = new Date()
    // ctx.throw(401);
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// app.use(async (ctx, next) => {
//     console.log(ctx.path);
//     if (ctx.path == '/lijinbu/user/login' || ctx.path == '/lijinbu/user/weixin/login'||ctx.path == '/lijinbu/user/anonymous/login') {
//         await next();
//     } else {
//         console.log(ctx.session.user);
//         if (!ctx.session.user || !ctx.session.user.user_id) {
//             ctx.throw(403)
//             ctx.body = '非法访问'
//         } else {
//             try {
//                 await next();
//             } catch (e) {
//                 ctx.throw(503)
//             }
//         }
//     }
// })

// routes
app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(stock.routes(), stock.allowedMethods())
// app.use(users.routes(), users.allowedMethods())
// app.use(leetcode.routes(), leetcode.allowedMethods())
// app.use(pay.routes(), pay.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app