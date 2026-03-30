import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'reader', 'officer'],
        default: 'reader',
    },
    courtId: {
        type: Schema.Types.ObjectId,
        ref: "Court",
    }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

const User = model("User", userSchema);

export default User;