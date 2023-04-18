const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide a value"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Please provide review title"],
    },
    comment: {
      type: String,
      required: [true, "Please provide review details"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// user can only give 1 review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  // group props according to data
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  console.log(result);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: result[0]?.averageRating || 0, // js optional chaining
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
  console.log("post save hook called");
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
  console.log("post remove hook called");
});

module.exports = mongoose.model("Review", ReviewSchema);
