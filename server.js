

// require("dotenv").config();
// console.log(process.env.SECRET_KEY) 
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")('sk_test_51JnPmrD0jpr76IcT2edPwVr8UjWlKD0qZIAIisMskpekmiKiKvHlVKlZxpFwXhQ1zBo45ewyDcbRVpDOo0r6T9zD007v047PtM');

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("Welcome to onLineStore website.");
});

const array = [];
const calculateOrderAmount = (items) => {
  items.map((item) => {
    const { price, cartQuantity } = item;
    const cartItemAmount = price * cartQuantity;
    return array.push(cartItemAmount);
  });
  const totalAmount = array.reduce((a, b) => {
    return a + b;
  }, 0);

  return totalAmount * 100;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items, shipping, description } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    description,
    shipping: {
      address: {
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        country: shipping.country,
        postal_code: shipping.postal_code,
      },
      name: shipping.name,
      phone: shipping.phone,
    },
    // receipt_email: customerEmail
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

const PORT = process.env.PORT||5002
console.log(PORT)
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}`));