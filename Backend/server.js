const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Successfully Connected");
    })
    .catch(err => {
        console.error("❌ Connection Error:", err.message);
    });

app.get('/', (req, res) => {
    res.send('Myntra Clone Backend is Working');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is Live at PORT ${PORT}`);
});