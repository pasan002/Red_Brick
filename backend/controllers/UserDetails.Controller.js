import userModel from "../models/User.Model.js";
import bcrypt from "bcryptjs";

// Create new user
const createUser = async (req, res) => {
  try {
    const {
      proPic,
      fName,
      lName,
      address,
      dob,
      gender,
      email,
      pwd,
      role,
      status,
    } = req.body;

    if (
      !fName.trim() ||
      !lName.trim() ||
      !address.trim() ||
      !dob.trim() ||
      !gender.trim() ||
      !role.trim() ||
      !email.trim() ||
      !status.trim() ||
      !pwd.trim()
    ) {
      throw new Error("Please Provide All Information!");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPwd = bcrypt.hashSync(pwd, salt);

    const userDataObj = {
      ...req.body,
      role: req.body.role.toUpperCase(),
      pwd: hashPwd,
    };

    const userData = new userModel(userDataObj);
    const saveUser = await userData.save();

    res.status(201).json({
      data: saveUser,
      success: true,
      error: false,
      message: "User Created Successfully!",
    });
  } catch (err) {
    res.status(400).json({
      message:
        err.message || "An error occurred while processing your request.",
      error: true,
      success: false,
    });
  }
};

// Get user details
const getUserByID = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    res.status(200).json({ data: user, error: false, success: true });
  } catch (err) {
    res
      .status(400)
      .json({ message: err.message || err, error: true, success: false });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({ data: users, error: false, success: true });
  } catch (err) {
    res
      .status(400)
      .json({ message: err.message || err, error: true, success: false });
  }
};

// Update user details
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body, role: req.body.role.toUpperCase() };

    const updatedUser = await userModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });
    }

    res.status(200).json({
      data: updatedUser,
      message: "User updated successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: err.message || err, error: true, success: false });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });
    }

    res.status(200).json({
      message: "User deleted successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: err.message || err, error: true, success: false });
  }
};

export { getUserByID, getAllUsers, updateUser, deleteUser, createUser };
