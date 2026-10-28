const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();

app.use(cors());
app.use(express.json());
mongoose.connect("mongodb://127.0.0.1:27017/dairy_finder")
  .then(async () => {
    console.log("MongoDB connected successfully!");

    const count = await Dairy.countDocuments();

    if (count === 0) {
      await Dairy.insertMany(dairies);
      console.log("All dairies saved to MongoDB!");
    } else {
      console.log("Dairy data already exists in MongoDB.");
    }
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
// =========================================================
// DAIRY DATA
// =========================================================

const dairies = [
  {
    id: 1,
    latitude: 22.6565,
    longitude: 75.8290,
    name: "Sharma Dairy",
    area: "Rajendra Nagar",
    distance: "1.2 km",
    address: "Near IPS Academy, Rajendra Nagar, Indore",
    phone: "9876543210",

    products: [
      { id: 101, name: "Milk", quantity: 20, unit: "L", price: 60 },
      { id: 102, name: "Curd", quantity: 10, unit: "Kg", price: 80 },
      { id: 103, name: "Butter", quantity: 8, unit: "Pack", price: 55 },
      { id: 104, name: "Ghee", quantity: 5, unit: "L", price: 550 },
      { id: 105, name: "Paneer", quantity: 5, unit: "Kg", price: 350 },
      { id: 106, name: "Chaas", quantity: 15, unit: "L", price: 40 },
      { id: 107, name: "Lassi", quantity: 12, unit: "L", price: 70 },
      { id: 108, name: "Khoya", quantity: 4, unit: "Kg", price: 300 }
    ]
  },

  {
    id: 2,
    latitude: 22.6480,
    longitude: 75.8320,
    name: "Gupta Dairy",
    area: "Bijalpur",
    distance: "1.1 km",
    address: "Bijalpur, Near IPS Academy, Indore",
    phone: "9876543211",

    products: [
      { id: 201, name: "Milk", quantity: 30, unit: "L", price: 58 },
      { id: 202, name: "Curd", quantity: 0, unit: "Kg", price: 75 },
      { id: 203, name: "Butter", quantity: 6, unit: "Pack", price: 60 },
      { id: 204, name: "Ghee", quantity: 8, unit: "L", price: 520 },
      { id: 205, name: "Paneer", quantity: 3, unit: "Kg", price: 340 },
      { id: 206, name: "Chaas", quantity: 20, unit: "L", price: 35 },
      { id: 207, name: "Lassi", quantity: 0, unit: "L", price: 65 },
      { id: 208, name: "Khoya", quantity: 6, unit: "Kg", price: 290 }
    ]
  },

  {
    id: 3,
    latitude: 22.6650,
    longitude: 75.8140,
    name: "Mohan Dairy",
    area: "Rajendra Nagar",
    distance: "1.4 km",
    address: "Rajendra Nagar, Near IPS Academy, Indore",
    phone: "9876543212",

    products: [
      { id: 301, name: "Milk", quantity: 25, unit: "L", price: 62 },
      { id: 302, name: "Curd", quantity: 15, unit: "Kg", price: 82 },
      { id: 303, name: "Butter", quantity: 0, unit: "Pack", price: 58 },
      { id: 304, name: "Ghee", quantity: 4, unit: "L", price: 560 },
      { id: 305, name: "Paneer", quantity: 8, unit: "Kg", price: 360 },
      { id: 306, name: "Chaas", quantity: 10, unit: "L", price: 45 },
      { id: 307, name: "Lassi", quantity: 10, unit: "L", price: 75 },
      { id: 308, name: "Khoya", quantity: 0, unit: "Kg", price: 310 }
    ]
  },

  {
    id: 4,
    latitude: 22.6470,
    longitude: 75.8140,
    name: "Krishna Dairy",
    area: "Bijalpur",
    distance: "1.6 km",
    address: "Bijalpur Road, Near IPS Academy, Indore",
    phone: "9876543213",

    products: [
      { id: 401, name: "Milk", quantity: 18, unit: "L", price: 59 },
      { id: 402, name: "Curd", quantity: 8, unit: "Kg", price: 78 },
      { id: 403, name: "Butter", quantity: 10, unit: "Pack", price: 52 },
      { id: 404, name: "Ghee", quantity: 0, unit: "L", price: 530 },
      { id: 405, name: "Paneer", quantity: 6, unit: "Kg", price: 345 },
      { id: 406, name: "Chaas", quantity: 12, unit: "L", price: 38 },
      { id: 407, name: "Lassi", quantity: 8, unit: "L", price: 68 },
      { id: 408, name: "Khoya", quantity: 3, unit: "Kg", price: 295 }
    ]
  },

  {
    id: 5,
    latitude: 22.6360,
    longitude: 75.8040,
    name: "Green Valley Dairy",
    area: "Rau",
    address: "Rau, Indore",
    phone: "9876543214",

    products: [
      { id: 501, name: "Milk", quantity: 22, unit: "L", price: 60 },
      { id: 502, name: "Curd", quantity: 12, unit: "Kg", price: 78 },
      { id: 503, name: "Butter", quantity: 7, unit: "Pack", price: 55 },
      { id: 504, name: "Ghee", quantity: 5, unit: "L", price: 540 },
      { id: 505, name: "Paneer", quantity: 4, unit: "Kg", price: 350 }
    ]
  },

  {
    id: 6,
    latitude: 22.6880,
    longitude: 75.8150,
    name: "Madhav Dairy",
    area: "Annapurna",
    address: "Annapurna Road, Indore",
    phone: "9876543215",

    products: [
      { id: 601, name: "Milk", quantity: 28, unit: "L", price: 59 },
      { id: 602, name: "Curd", quantity: 9, unit: "Kg", price: 80 },
      { id: 603, name: "Butter", quantity: 5, unit: "Pack", price: 56 },
      { id: 604, name: "Ghee", quantity: 6, unit: "L", price: 545 },
      { id: 605, name: "Paneer", quantity: 6, unit: "Kg", price: 355 }
    ]
  },

  {
    id: 7,
    latitude: 22.7420,
    longitude: 75.8890,
    name: "New Bharat Dairy",
    area: "Vijay Nagar",
    address: "Vijay Nagar, Indore",
    phone: "9876543216",

    products: [
      { id: 701, name: "Milk", quantity: 35, unit: "L", price: 61 },
      { id: 702, name: "Curd", quantity: 14, unit: "Kg", price: 82 },
      { id: 703, name: "Butter", quantity: 8, unit: "Pack", price: 58 },
      { id: 704, name: "Ghee", quantity: 7, unit: "L", price: 560 },
      { id: 705, name: "Paneer", quantity: 7, unit: "Kg", price: 365 }
    ]
  },

  {
    id: 8,
    latitude: 22.7180,
    longitude: 75.8570,
    name: "Shree Dairy",
    area: "Palasia",
    address: "Palasia, Indore",
    phone: "9876543217",

    products: [
      { id: 801, name: "Milk", quantity: 26, unit: "L", price: 60 },
      { id: 802, name: "Curd", quantity: 11, unit: "Kg", price: 79 },
      { id: 803, name: "Butter", quantity: 6, unit: "Pack", price: 57 },
      { id: 804, name: "Ghee", quantity: 4, unit: "L", price: 550 },
      { id: 805, name: "Paneer", quantity: 5, unit: "Kg", price: 360 }
    ]
  }
];

// =========================================================
// RESERVATION STORAGE
// =========================================================

const reservations = [];
// MONGODB MODELS

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  quantity: Number,
  unit: String,
  price: Number
}, { _id: false });

const dairySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  latitude: Number,
  longitude: Number,
  name: String,
  area: String,
  distance: String,
  address: String,
  phone: String,
  products: [productSchema]
});

const Dairy = mongoose.model("Dairy", dairySchema);

const reservationSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  dairyId: Number,
  dairy: String,
  productId: Number,
  product: String,
  quantity: Number,
  unit: String,
  price: Number,
  totalPrice: Number,
  status: String,
  createdAt: String,
  expiresAt: String
});

const Reservation = mongoose.model("Reservation", reservationSchema);
// =========================================================
// ADMIN LOGIN
// =========================================================
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Admin login required."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied."
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again."
    });
  }
}
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password."
    });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    success: true,
    message: "Login successful!",
    token
  });
});

// =========================================================
// HOME
// =========================================================

app.get("/", (req, res) => {
  res.send("Dairy Finder server is running!");
});

// =========================================================
// GET ALL DAIRIES
// =========================================================

app.get("/api/dairies", (req, res) => {
  res.json(dairies);
});

// =========================================================
// FIND NEARBY DAIRIES BY LOCATION
// =========================================================

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

app.get("/api/dairies/nearby", (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({
      message: "Valid latitude and longitude are required."
    });
  }

  const MAX_NEARBY_DISTANCE_KM = 2;

  const nearbyDairies = dairies
    .map((dairy) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        dairy.latitude,
        dairy.longitude
      );

      return {
        ...dairy,
        distanceValue: distance,
        distance: `${distance.toFixed(1)} km`
      };
    })
    .filter((dairy) => dairy.distanceValue <= MAX_NEARBY_DISTANCE_KM)
    .sort((a, b) => a.distanceValue - b.distanceValue);

  res.json(nearbyDairies);
});

// =========================================================
// GET ONE DAIRY
// =========================================================

app.get("/api/dairies/:id", (req, res) => {
  const dairyId = Number(req.params.id);

  const dairy = dairies.find(
    (dairy) => dairy.id === dairyId
  );

  if (!dairy) {
    return res.status(404).json({
      message: "Dairy not found"
    });
  }

  res.json(dairy);
});

// =========================================================
// GET DAIRY PRODUCTS
// =========================================================

app.get("/api/dairies/:id/products", (req, res) => {
  const dairyId = Number(req.params.id);

  const dairy = dairies.find(
    (dairy) => dairy.id === dairyId
  );

  if (!dairy) {
    return res.status(404).json({
      message: "Dairy not found"
    });
  }

  res.json(dairy.products);
});

// =========================================================
// UPDATE PRODUCT STOCK
// =========================================================

app.post("/api/stock/update",verifyAdmin, async (req, res) => {
  try {
    const { dairyId, productId, quantity } = req.body;
    const addedQuantity = Number(quantity);

    if (!Number.isInteger(addedQuantity) || addedQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1."
      });
    }

    const dairy = await Dairy.findOne({
      id: Number(dairyId)
    });

    if (!dairy) {
      return res.status(404).json({
        message: "Dairy not found"
      });
    }

    const product = dairy.products.find(
      (product) => product.id === Number(productId)
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    product.quantity += addedQuantity;

    await dairy.save();

    res.json({
      success: true,
      message: "Stock updated successfully.",
      dairy: dairy.name,
      product: product.name,
      quantity: product.quantity,
      unit: product.unit
    });

  } catch (error) {
    console.error("Stock update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update stock."
    });
  }
});

// =========================================================
// RESERVE PRODUCT
// =========================================================

app.post("/api/reserve", async (req, res) => {
  try {
    const { dairyId, productId, quantity } = req.body;
    const selectedQuantity = Number(quantity);

    if (!Number.isInteger(selectedQuantity) || selectedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1."
      });
    }

    const dairy = await Dairy.findOne({
      id: Number(dairyId)
    });

    if (!dairy) {
      return res.status(404).json({
        success: false,
        message: "Dairy not found."
      });
    }

    const product = dairy.products.find(
      (item) => item.id === Number(productId)
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    if (product.quantity < selectedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available."
      });
    }

    product.quantity -= selectedQuantity;
    await dairy.save();

    const totalPrice = selectedQuantity * product.price;
    const reservationId = "RES-" + Date.now();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

    const reservation = await Reservation.create({
      id: reservationId,
      dairyId: dairy.id,
      dairy: dairy.name,
      productId: product.id,
      product: product.name,
      quantity: selectedQuantity,
      unit: product.unit,
      price: product.price,
      totalPrice,
      status: "Reserved",
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    res.json({
      success: true,
      id: reservation.id,
      dairy: dairy.name,
      product: product.name,
      quantity: selectedQuantity,
      unit: product.unit,
      price: product.price,
      totalPrice,
      expiresAt: expiresAt.toISOString(),
      message: "Reservation confirmed! Valid for 10 minutes."
    });

  } catch (error) {
    console.error("Reservation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create reservation."
    });
  }
});

// =========================================================
// GET ALL RESERVATIONS
// =========================================================

app.get("/api/reservations", verifyAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    console.error("Fetch reservations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reservations."
    });
  }
});

// =========================================================
// START SERVER
// =========================================================

const PORT = 5001;

app.listen(PORT, () => {
  console.log(
    `Dairy Finder server running on port ${PORT}`
  );
});