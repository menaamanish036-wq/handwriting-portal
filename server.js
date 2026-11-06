const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Static files (frontend ke liye)
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://handwriting_admin:admin1234@handwritingdb.gutf1eee.mongodb.net/handwriting_publication?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.log("Connection Error:", err));

const CustomerSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: String,
    address: String,
    registrationApproved: { type: Boolean, default: false },
    customCharge: {
        name: { type: String, default: "None Assigned Yet" },
        amount: { type: Number, default: 0 },
        status: { type: String, default: "Pending" }
    }
}, { timestamps: true });

const Customer = mongoose.model('Customer', CustomerSchema);

// API Routes
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, password, fullname, address } = req.body;
        const existing = await Customer.findOne({ mobile });
        if (existing) return res.status(400).json({ message: "Mobile number registered already!" });
        const newCustomer = new Customer({ mobile, password, fullname, address });
        await newCustomer.save();
        res.json({ message: "Registration successful!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const customer = await Customer.findOne({ mobile, password });
        if (!customer) return res.status(400).json({ message: "Invalid credentials!" });
        res.json({ message: "Login Successful", customer });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Main Website Route (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Panel Route (admin.html)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
