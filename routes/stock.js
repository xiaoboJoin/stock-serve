const router = require('koa-router')()

router.prefix('/stock')



router.post('/funds', async function(ctx, next) {
    let data = ctx.request.body;
    console.log(data);
    let res = await ctx.db.collection('stock').findOne({
        "code": data.code,
    });
    ctx.body = res[data.date] || [];

})






module.exports = router