const express = require("express")
const router = express.Router()
const {getHome, getCart, getProducts, getContact, getCategories, getCheckout, postContact, productDetails, getPost, postProduct, addCart, getLogin, createUser,loginUser, logout} = require("../controllers/userController")
const {checkUser} = require("../middlewares/checkUser")

router.get("/", checkUser, getHome)
router.get("/category", checkUser, getCategories)
router.get("/login", getLogin)
router.get("/logout", checkUser, logout)
router.get("/register", getLogin)
router.get("/contact", checkUser, getContact)
router.get("/checkout", checkUser, getCheckout)
router.get("/add-cart/:id", checkUser, addCart)
router.get("/cart", checkUser, getCart)
router.get("/products", checkUser, getProducts)
router.get("/details/:id", checkUser, productDetails)
router.post("/contact", checkUser, postContact)
router.get("/post-product", checkUser, getPost)
router.post("/post-product", checkUser, postProduct)
router.post("/register", createUser)
router.post("/login", loginUser)


module.exports = router