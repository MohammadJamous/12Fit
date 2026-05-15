const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/User");

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = process.env.SUPER_ADMIN_EMAIL.toLowerCase();

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Super admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD,
      10
    );

    await User.create({
      name: "Admin system",
      email,
      password: hashedPassword,
      role: "super_admin",
    });

    console.log("Super Admin created successfully ✅");

    process.exit();
  } catch (error) {
    console.error("Error creating super admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();