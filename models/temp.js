const agg = [
  {
    $match: {
      product: new ObjectId("643dd41e5806c8642fd997ca"),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: "$rating",
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
];
