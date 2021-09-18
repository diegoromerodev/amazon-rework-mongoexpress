const brandsJSON = JSON.stringify(require("./db_pop/brands.json"));
const categoriesJSON = JSON.stringify(require("./db_pop/categories.json"));
const productsJSON = JSON.stringify(require("./db_pop/short_prod_brands.json"));

const async = require("async");
const mongoose = require("mongoose");

const Product = require("./models/product");
const Brand = require("./models/brand");
const Category = require("./models/category");
const Review = require("./models/review");

const productsArr = [];
const brandsArr = [];
const categoriesArr = [];
const reviewsArr = [];

mongoose.connect(process.env.DB);
const db = mongoose.connection;
db.on("error", console.error);

const saveBrandDocument = ({ image: logo, name }, callback) => {
  const brand = new Brand({
    logo,
    name,
  });
  brand.save((err) => {
    brandsArr.push(brand);
    callback(err);
  });
};

const createBrands = (callback) => {
  async
    .each(JSON.parse(brandsJSON), saveBrandDocument)
    .then(callback)
    .catch(console.error);
};

const saveCategoryDocument = ({ name }, callback) => {
  const category = new Category({
    name,
  });
  category.save((err) => {
    categoriesArr.push(category);
    callback(err);
  });
};

const createCategories = (callback) => {
  async
    .each(JSON.parse(categoriesJSON), saveCategoryDocument)
    .then(callback)
    .catch(console.error);
};

const saveProductDocument = (
  {
    image,
    title: name,
    description,
    brand: brandName,
    category: categoryName,
    price,
  },
  callback
) => {
  const product = new Product({
    image,
    name,
    description,
    brand: brandsArr.find((element) => element.name === brandName),
    category: categoriesArr.find((element) => element.name === categoryName),
    price,
    publish_date: Date.now(),
  });
  product.save((err) => {
    productsArr.push(product);
    callback(err);
  });
};

const createProducts = (callback) => {
  async
    .each(JSON.parse(productsJSON), saveProductDocument)
    .then(callback)
    .catch(console.error);
};

const saveReviewDocument = (product, callback) => {
  const images = [
    "ywd8qe28eh8enuiasdmdijadnaiusdbduinj.jpg",
    "796eg937gfbefbewifne.jpg",
    "27h238328rg387rb83rnu3.jpg",
    "398ej398rj9fenfimoe.jpg",
    "732gr972bf7dbf9sydfbdsuij.jpg",
    "36g7eyfbuyofbdyfbewfiwem.jpg",
    "8huywdnwqh28e7huwwnidjnsaj.jpg",
  ];
  const texts = [
    "Legit review, nice product",
    "This is not a review",
    "If you see this, please contact support",
    "Totally awesome and useful",
    "Useless, it burned my car",
    "Hello, smile",
    "10pm atm, see you there",
    "Accurate review",
    "These other people haven't bought this, I have, it sucks",
    "I found a better deal a this other wbsite, total scam",
    "Nice product",
    "I like eggs",
    "Get it now and call me",
    "Cool product",
    "Decent, I guess",
    "PogU",
    "It shines at night, be careful",
  ];
  const authors = [
    "Diego R.",
    "Maria",
    "Arturo",
    "José",
    "Magaly",
    "Carlos",
    "Danielle",
    "Austin",
    "Jason",
    "Jade",
    "Louis",
    "Luis",
    "Papi23",
    "Motorbikes Corp",
    "Supermarket",
    "Amazon_Official_123456",
    "user_____________1",
    "pogchamp777",
    "epic_stores=2",
  ];
  const review = new Review({
    image: images[Math.floor(Math.random() * images.length)],
    author: authors[Math.floor(Math.random() * authors.length)],
    text: texts[Math.floor(Math.random() * texts.length)],
    rating: Math.floor(Math.random() * 6),
    product,
    review_date: Date.now(),
  });
  review.save((err) => {
    reviewsArr.push(review);
    callback(err);
  });
};

const createReviews = (callback) => {
  async
    .each(productsArr, saveReviewDocument)
    .then(callback)
    .catch(console.error);
};

(function populateAll() {
  async
    .series([createBrands, createCategories, createProducts, createReviews])
    .then(() => {
      console.log(brandsArr, categoriesArr, productsArr, reviewsArr);
      mongoose.connection.close();
    })
    .catch(console.error);
})();
