const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    date: {
        type: Date,
        default: Date.now()
    }
})


module.exports = mongoose.model("Cart", cartSchema)