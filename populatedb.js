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
    .each(JSON.parse(brandsJSON).slice(0, 2), saveBrandDocument)
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
    .each(
      JSON.parse(categoriesJSON).filter(
        (el) => el.name === "Grocery" || el.name === "Luggage"
      ),
      saveCategoryDocument
    )
    .then(callback)
    .catch(console.error);
};

const saveProductDocument = (
  { image, title: name, description, brandName, categoryName, price },
  callback
) => {
  const brand = new Product({
    image,
    name,
    description,
    brand: brandsArr.find((element) => element.name === brandName),
    category: categoriesArr.find((element) => element.name === categoryName),
    price,
  });
  brand.save((err) => {
    brandsArr.push(brand);
    callback(err);
  });
};

const createProducts = (callback) => {
  async
    .each(
      JSON.parse(productsJSON)
        .filter((el) => el.brand === "Tyson" || el.brand === "Asutra")
        .slice(0, 3),
      saveProductDocument
    )
    .then(callback)
    .catch(console.error);
};

(function populateAll() {
  async
    .series([createBrands, createCategories, createProducts])
    .then(() => {
      console.log(brandsArr, categoriesArr, productsArr);
      mongoose.connection.close();
    })
    .catch(console.error);
})();
