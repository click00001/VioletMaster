const jwt = require("jsonwebtoken")

const checkUser = (req, res, next)=>{
    const token = req.cookies.violet

    const reveal = jwt.decode(token, process.env.JWT_SECRET_KEY)
    req.user = reveal

    next()
}

module.exports = {checkUser}

