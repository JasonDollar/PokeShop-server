const getUserId = ctx => {
  if (ctx.request.request.userId) {
    return ctx.request.request.userId
  } 
  return null
}

module.exports = getUserId