import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        telegramId: {
            type: String,
            required: true,
            unique: true,
        },
        username: String,
        firstName: String,
        connectToken: String,
        connectedAt: Date,
    },
    {
        timestamps: true,
    }
);


const User = mongoose.model("User", userSchema);

export default User;