const contactModel = require("../models/contact");
const cartModel = require("../models/cart");
const userModel = require("../models/userModel");
const productModel = require("../models/product");
const { uniqueName } = require("../middlewares/imageName");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getHome = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    res.render("index", { currentUser });
  } else {
    res.render("index");
  }
};

const getCategories = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    res.render("categories", { currentUser });
  } else {
    res.render("categories");
  }
};

const getContact = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    res.render("contact", { currentUser });
  } else {
    res.render("contact");
  }
};

const getCheckout = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    res.render("check-out", { currentUser });
  } else {
    res.redirect("/login");
  }
};

const getCart = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    const allCarts = await cartModel.find().populate("productId");
    let totalAmount = 0;
    const carts = await allCarts.map((item) => {
      totalAmount += item.productId.price;
      return {
        ...item.toObject(),
        display: item.productId.images[0],
        total: item.productId.price * item.productId.quantity,
      };
    });

    res.render("shopping-cart", { carts, totalAmount, currentUser });
  } else {
    res.redirect("/login");
  }
};

const getProducts = async (req, res) => {
  const products = await productModel.find();
  const allProducts = await products.map((item) => {
    return {
      ...item.toObject(),
      display: item.images[0] || "/img/products/img-1.jpg",
    };
  });
  const allCategories = products.map((item) => {
    return item.category;
  });
  const uniqueCategories = new Set(allCategories);
  const categories = Array.from(uniqueCategories);
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    res.render("products", { allProducts, categories, currentUser });
  } else {
    res.render("products", { allProducts, categories });
  }
};

const productDetails = async (req, res) => {
  const productId = req.params.id;
  const product = await productModel.findOne({ _id: productId });
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    res.render("product-page", { product, currentUser });
  } else {
    res.render("product-page", { product });
  }
};

const postContact = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    const { firstName, lastName, email, subject, message } = req.body;

    await contactModel.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      subject: subject,
      message: message,
    });

    res.redirect("/contact");
  } else {
    res.redirect("/login");
  }
};

const getPost = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    res.render("post-product", { product, currentUser });
  } else {
    res.redirect("/login");
  }
};

const postProduct = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    const { productName, category, price, description, tags } = req.body;
    const images = req.files.images;

    const imageArr = [];
    const fields = [];
    const incomingFields = [
      "productName",
      "category",
      "price",
      "description",
      "tags",
    ];
    for (const child of incomingFields) {
      if (!req.body[child] || req.body[child] === "") {
        fields.push(child);
      }
    }

    if (fields.length > 0) {
      return res.render("post-product", {
        error: `This field(s) ${fields.join(", ")} cannot be empty`,
      });
    }

    const tagArr = tags.split(",") || tags.split(" ");

    if (Array.isArray(images)) {
      await Promise.all(
        images.map(async (item) => {
          const newname = uniqueName(item.name);
          const filePath = `/products/${newname}`;
          imageArr.push(filePath);
          const fileDir = `public/products/${newname}`;
          await item.mv(fileDir);
        })
      );
    } else {
      const newname = await uniqueName(images.name);
      const filePath = `/products/${newname}`;
      imageArr.push(filePath);
      const fileDir = `public/products/${newname}`;
      await images.mv(fileDir);
    }

    await productModel.create({
      productName: productName,
      category: category,
      price: price,
      description: description,
      tags: tagArr,
      images: imageArr,
    });

    res.render("post-product", { success: "Post successful", currentUser });
  } else {
    res.redirect("/login");
  }
};

const addCart = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    const cartId = req.params.id;
  await cartModel.create({
    productId: cartId,
  });
  // "shopping-cart", {success: "Added to cart successfully"}
    res.render("product-page", { product, currentUser });
  } else {
    res.redirect(`/login`);
  }
};

const getLogin = (req, res) => {
  res.render("cardlogin");
};

const createUser = async (req, res) => {
  const { email, password, confirm_password } = req.body;
  const checkField = ["email", "password", "confirm_password"];
  const emptyField = [];
  for (const field of checkField) {
    if (!req.body[field] || req.body[field] === "") {
      emptyField.push(field);
    }
  }

  if (emptyField.length > 0) {
    return res.render("cardlogin", {
      error: `This field(s) ${emptyField.join(", ")} cannot be empty`,
    });
  }

  if (password !== confirm_password) {
    return res.render("cardlogin", { error: `Passwords does not match` });
  }

  const checkEmail = await userModel.findOne({ email: email });
  if (checkEmail) {
    return res.render("cardlogin", { error: `Email already exist !` });
  }

  await userModel.create({
    email: email,
    password: password,
  });

  return res.render("cardlogin", {
    success: `Account created successfully, kindly login !`,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const checkField = ["email", "password"];
  const emptyField = [];
  for (const field of checkField) {
    if (!req.body[field] || req.body[field] === "") {
      emptyField.push(field);
    }
  }

  if (emptyField.length > 0) {
    return res.render("cardlogin", {
      error: `This field(s) ${emptyField.join(", ")} cannot be empty`,
    });
  }

  const checkUser = await userModel.findOne({ email: email });

  if (!checkUser) {
    return res.render("cardlogin", { error: "Email does not exist" });
  }

  const comparePassword = await bcrypt.compare(password, checkUser.password);

  if (comparePassword) {
    const token = await jwt.sign(
      { id: checkUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("violet", token);

    return res.redirect("/");
  } else {
    return res.render("cardlogin", { error: "Email or Password mismatch" });
  }
};

const logout = (req, res) =>{
  if(req.user){
    res.clearCookie("violet")
    res.redirect("/login")
  }else{
    res.redirect("/login")
  }
}

module.exports = {
  logout,
  loginUser,
  createUser,
  getHome,
  addCart,
  getCart,
  getProducts,
  getContact,
  getCategories,
  getCheckout,
  postContact,
  productDetails,
  getPost,
  postProduct,
  getLogin,
};
