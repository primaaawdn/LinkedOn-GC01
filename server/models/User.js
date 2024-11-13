const { connectToDB } = require("../config/mongodb");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { ObjectId } = require("mongodb");

class User {
	static async findAll() {
		try {
			const db = await connectToDB();
			const users = await db.collection("User").find().toArray();
			return users;
		} catch (error) {
			throw new Error("Failed to fetch users");
		}
	}

	static async findById(id) {
		try {
			const db = await connectToDB();
			const user = await db.collection("User").findOne({ _id: ObjectId(id) });
			if (!user) throw new Error("User not found");
			return user;
		} catch (error) {
			throw new Error("User not found");
		}
	}

	static async createUser({ name, username, email, password }) {
		try {
			const db = await connectToDB();
			const existingUser = await db
				.collection("User")
				.findOne({ $or: [{ username }, { email }] });

			if (existingUser) throw new Error("User already exists");

			const hashedPassword = await hashPassword(password);
			const newUser = await db.collection("User").insertOne({
				name,
				username,
				email,
				password: hashedPassword,
			});

			return {
				_id: newUser.insertedId,
				name,
				username,
				email,
			};
		} catch (error) {
			throw new Error("Failed to create user");
		}
	}

	static async updateUser(id, updateData) {
		try {
			const db = await connectToDB();
			const user = await db.collection("User").findOne({ _id: ObjectId(id) });
			if (!user) throw new Error("User not found");

			const updatedUser = await db
				.collection("User")
				.updateOne({ _id: ObjectId(id) }, { $set: updateData });

			return updatedUser.modifiedCount > 0 ? { ...user, ...updateData } : null;
		} catch (error) {
			throw new Error("Failed to update user");
		}
	}

	static async deleteUser(id) {
		try {
			const db = await connectToDB();
			const user = await db.collection("User").findOne({ _id: ObjectId(id) });
			if (!user) throw new Error("User not found");

			await db.collection("User").deleteOne({ _id: ObjectId(id) });
			return "User deleted successfully";
		} catch (error) {
			throw new Error("Failed to delete user");
		}
	}

	static async validatePassword(storedPassword, inputPassword) {
		return await comparePassword(inputPassword, storedPassword);
	}

	static async generateToken(user) {
		return signToken({ _id: user._id, username: user.username });
	}
}

module.exports = User;
