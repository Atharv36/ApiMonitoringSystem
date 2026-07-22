import mongoose from "mongoose";
import bcrypt from "bcrypt";
import SecurityUtils from "../utils/SecurityUtils.js";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            validate: {
                validator: function (userName) {
                    return /^[a-zA-Z0-9_-]+$/.test(userName);
                },
                message: "Please enter a valid username.",
            },
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (email) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                },
                message: "Please enter a valid email.",
            },
        },

        password: {
            type: String,
            required: true,
            minlength: 4,
            validate: {
                validator: function (password) {
                    // Skip validation if password is already hashed
                    if (
                        this.isModified("password") &&
                        password &&
                        !password.startsWith("$2")
                    ) {
                        const validation =
                            SecurityUtils.validatePassword(password);
                        return validation.success;
                    }

                    return true;
                },

                message: function (props) {
                    if (props.value && !props.value.startsWith("$2")) {
                        const validation =
                            SecurityUtils.validatePassword(props.value);

                        return validation.errors.join(". ");
                    }

                    return "Invalid password.";
                },
            },
        },

        role: {
            type: String,
            enum: ["super_admin", "client_admin", "client_viewer"],
            default: "client_viewer",
        },

        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: function () {
                return this.role !== "super_admin";
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        permissions: {
            canCreateApiKeys: {
                type: Boolean,
                default: false,
            },

            canManageUsers: {
                type: Boolean,
                default: false,
            },

            canViewAnalytics: {
                type: Boolean,
                default: true,
            },

            canExportData: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        next();
    } catch (error) {
        next(error);
    }
});

userSchema.index({
    clientId: 1,
    isActive: 1,
});

userSchema.index({
    role: 1,
});

const User = mongoose.model("User", userSchema);

export default User;