const express = require("express");
const router = express.Router();
const Product = require("./models/product.js");
const User = require("./models/user.js");
const items_per_page = 4;

function ensureAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  } else {
    console.log("You must be logged in to do this!");
    res.redirect('/add-product');
  }
} //Similarly can add admin validation. All such validation should be done from the server side or the user can easily change such local variables

function ensureAdmin(req, res, next) {
  if (req.session.admin) {
    return next();
  } else {
    console.log("You must be an Administrator in to do this!");
  }
}

router.get("/shop", (req, res, next) => {
  //react me bhi handle pass hua
  const page = +req.query.page || 1; //?page=1,,if req.query.handle--> gets
  const k = +req.query.sort || 0;
  let category;
  if(req.query.category)
    category=req.query.category;
  else {
    category="";
  }
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      if(category==="")
      {
        console.log('all prods');
        return Product.find()
          .sort({ price: k })
          .skip((page - 1) * items_per_page) //skip previous items
          .limit(items_per_page); //go till another page only
      }
      else{
        console.log('the');
        return Product.find({category:category})
          .sort({ price: k })
          .skip((page - 1) * items_per_page) //skip previous items
          .limit(items_per_page); //go till another page only
      }

    })
    .then(products => {
      res.send({
        prods: products,
        currentPage: page,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / items_per_page),
        hasNextPage: items_per_page * page < totalItems,
        sort: k
      });
    })
    .catch(err => {
      console.log(err);
      console.log("couldnt fetch products");
    });
});


//name in html file of input was title
router.post("/add-product", ensureAuth, (req, res, next) => {
  //../ means go up one level
  const product = new Product({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    img: req.body.img,
    category:req.body.category
  });
  product
    .save()
    .then(result => {
      console.log("Product added to DB");
    })
    .catch(err => {
      console.log(err);
    });
  return next();
});

router.get("/cart", ensureAuth, (req, res, next) => {
  if (typeof req.user === "undefined") {
    res.send({ loggedIn: false });
    console.log("not logged in");
    return next();
  }

  req.user  //this is making reference !! Super Important
    .populate("cart.items.prodid")
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.send({ cart: products, loggedIn: true });
    })
    .catch(err => console.log(err));
});

router.post("/addToCart", ensureAuth, (req, res, next) => {
  let id = req.body.productId;

  Product.findById(id) //static methods are acessed using classname
    .then(addP => {
      return req.user.addToCart(addP);
    })
    .catch(err => {
      console.log(err);
      console.log("not added");
    });
  res.redirect("/shop");
});

router.post("/remove", ensureAuth, (req, res, next) => {
  let id = req.body.productId;
  let id2=id.toString();
  console.log("id2 is ",id2);
  req.user
    .removeFromCart(id2)
    .then(result => {
            res.redirect("/cart");
    })
    .catch(err => {
      console.log("yahan error");
      console.log(err);
    });
});

module.exports = router;

//let [foo, bar] = await Promise.all([getFoo(), getBar()]);
// foo=await getfoo();;
// bar=await getBar();
