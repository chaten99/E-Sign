import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";
dotenv.config();
const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({email: `${process.env.ADMIN_EMAIL}`});
        if(existingAdmin) {
            console.log("Admin user already exists");
            return;
        }
        const adminUser = new User({
            name: "Chaten",
            email: `${process.env.ADMIN_EMAIL}`,
            password: `${process.env.ADMIN_PASSWORD}`,
            role: "admin",
        });
        await adminUser.save();
        console.log("Admin user created successfully");
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
}

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to MongoDB");
    createAdmin().then(() => {
        console.log("Admin user setup complete");
        mongoose.disconnect();
    });
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});