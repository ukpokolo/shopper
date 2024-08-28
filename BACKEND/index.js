const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const app = express();
const port = 4000;

// CORS Handling Function
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://shopper-front-theta.vercel.app'); // Replace with your frontend link
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

};

// Database Connection with MongoDB
mongoose.connect("mongodb+srv://irenosedev:ukpokolo@cluster0.pse06dz.mongodb.net/e-commerce");

// Cloudinary Configuration
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shopper_images', // Folder name in Cloudinary
    format: async (req, file) => 'png', // Format of the uploaded image (can be changed)
    public_id: (req, file) => `product_${Date.now()}${path.extname(file.originalname)}`,
  },
});

const upload = multer({ storage: storage });

app.use(express.json());

// Middleware to Fetch User
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
  }
};

// Routes with CORS handling
app.get("/", allowCors(async (req, res) => {
  res.send("Express App is Running");
}));

app.post('/upload', allowCors(upload.single('product'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('File upload failed');
    }
    res.json({
      message: 'File uploaded successfully',
      image_url: req.file.path, // Cloudinary URL for the uploaded image
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
}));

app.post('/addproduct', allowCors(async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product = products[products.length - 1];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image, // Ensure this contains the Cloudinary image URL
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  res.json({ success: true, name: req.body.name });
}));

app.post('/removeproduct', allowCors(async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
}));

app.get('/allproducts', allowCors(async (req, res) => {
  let products = await Product.find({});
  res.send(products);
}));

app.post('/signup', allowCors(async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "Existing user found with same email address" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, 'secret_ecom');
  res.json({ success: true, token });
}));

app.post('/login', allowCors(async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong email address or password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong email address or password" });
  }
}));

app.post('/addtocart', fetchUser, allowCors(async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Added");
}));

app.post('/removefromcart', fetchUser, allowCors(async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Removed");
}));

app.post('/getcart', fetchUser, allowCors(async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
}));

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error: " + error);
  }
});
