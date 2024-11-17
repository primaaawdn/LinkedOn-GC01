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
			const userId = new ObjectId(id);
			const user = await db.collection("User").findOne({ _id: userId });
			if (!user) throw new Error("User not found");
			return user;
		} catch (error) {
			console.log("Error in findById:", error);
			throw new Error("User not found");
		}
	}

	static async findByUsername(username) {
		try {
			const db = await connectToDB();
			const user = await db.collection("User").findOne({ username });
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
				password,
			};
		} catch (error) {
			throw new Error("Failed to create user");
		}
	}

	static async updateUser(id, updateData) {
		try {
			const db = await connectToDB();
			const userId = new ObjectId(id);
			const existingUser = await db.collection("User").findOne({ _id: userId });

			if (!existingUser) throw new Error("User not found");

			if (updateData.password) {
				updateData.password = await hashPassword(updateData.password);
			}

			const updateFields = {};
			Object.keys(updateData).forEach((key) => {
				if (updateData[key] !== undefined) {
					updateFields[key] = updateData[key];
				}
			});

			const updatedUser = await db
				.collection("User")
				.updateOne({ _id: userId }, { $set: updateFields });

			if (updatedUser.modifiedCount === 0) {
				throw new Error("Failed to update user");
			}

			return { ...existingUser, ...updateFields };
		} catch (error) {
			console.log("Error in updateUser:", error);
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

	static async search(query) {
		try {
			const db = await connectToDB();
			const users = await db
				.collection("User")
				.find({
					$or: [
						{ name: { $regex: query, $options: "i" } },
						{ username: { $regex: query, $options: "i" } },
					],
				})
				.toArray();

			if (users.length === 0) {
				throw new Error("No users found matching the query");
			}

			return users;
		} catch (error) {
			console.log("Error during user search:", error);
			throw new Error("Failed to search users");
		}
	}

	static async validatePassword(storedPassword, inputPassword) {
		return await comparePassword(inputPassword, storedPassword);
	}

	static async generateToken(user) {
		return signToken({ _id: user._id, username: user.username });
	}

	static async followUser(userId, followId) {
		try {
			const db = await connectToDB();
			const user = await db
				.collection("User")
				.findOne({ _id: ObjectId(userId) });
			const followUser = await db
				.collection("User")
				.findOne({ _id: ObjectId(followId) });

			if (!user || !followUser) throw new Error("User not found");

			const isFollowing = user.following.includes(followId);
			const isFollower = followUser.followers.includes(userId);

			if (isFollowing && isFollower) {
				await db
					.collection("User")
					.updateOne(
						{ _id: ObjectId(userId) },
						{ $pull: { following: followId } }
					);
				await db
					.collection("User")
					.updateOne(
						{ _id: ObjectId(followId) },
						{ $pull: { followers: userId } }
					);
			} else {
				await db
					.collection("User")
					.updateOne(
						{ _id: ObjectId(userId) },
						{ $push: { following: followId } }
					);
				await db
					.collection("User")
					.updateOne(
						{ _id: ObjectId(followId) },
						{ $push: { followers: userId } }
					);
			}

			return await db.collection("User").findOne({ _id: ObjectId(userId) });
		} catch (error) {
			throw new Error("Failed to follow user");
		}
	}
}

//aa
module.exports = User;
