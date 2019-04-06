const express=require('express');
const router=express.Router();
const Product=require('./models/product.js');
const User=require('./models/user.js');
const items_per_page=3;

router.get('/shop',(req,res,next)=>{  //react me bhi handle pass hua
  console.log(req.query);
  const page= +req.query.page||1;  //?page=1,,if req.query.handle--> gets
  const k= +req.query.sort||0;

  Product.find()
    .countDocuments()
    .then(numProducts=>{
      totalItems=numProducts;
      return Product.find()
        .sort({price:k})
        .skip((page-1)*items_per_page)  //skip previous items
        .limit(items_per_page);         //go till another page only
    })
    .then(products=>{

      res.send({
        prods:products,
        currentPage:page,
        hasPreviousPage:page>1,
        nextPage:page+1,
        previousPage:page-1,
        lastPage: Math.ceil(totalItems/items_per_page),
        hasNextPage: items_per_page * page < totalItems,
        sort:k
      });
    })
    .catch(err=>{console.log(err); console.log('couldnt fetch products');});
});

//name in html file of input was title
router.post('/add-product',(req,res,next)=>{        //../ means go up one level
  const product=new Product({title:req.body.title,price:req.body.price,description:req.body.description,img:req.body.img});
  product.save()
    .then(result=>{
      console.log('Product added to DB');
    })
    .catch(err=>{
      console.log(err);
    });
    res.redirect('/add-product');
});

router.get('/cart',(req,res,next)=>{
  req.user
    .populate('cart.items.prodid')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.send({cart: products});
    })
    .catch(err => console.log(err));
});

router.post('/addToCart',(req,res,next)=>{
  let id=req.body.productId;
  console.log(req.user);
  console.log(id);
  Product.findById(id)  //static methods are acessed using classname
  .then( addP =>{
    return req.user.addToCart(addP);
  })
  .then(result=>{console.log(result); res.redirect('/shop');})
  .catch(err=>{console.log(err); console.log('not added');});

});

router.post('/remove',(req,res,next)=>{
  let id=req.body.productId;
  console.log(id);
  req.user.removeFromCart(id)
  .then(result=>{res.redirect('/cart');})
  .catch(err=>{
    console.log('yahan error');console.log(err);
  });
});

module.exports=router;

//let [foo, bar] = await Promise.all([getFoo(), getBar()]);
// foo=await getfoo();;
// bar=await getBar();
