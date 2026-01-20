const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        zipCode: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true,
            default: 'United States'
        }
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please enter a valid phone number']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password; // Never send password in responses
            delete ret.__v; // Remove version key
            return ret;
        }
    },
    toObject: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Method to get user profile (public info)
UserSchema.methods.getProfile = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        address: this.address,
        phone: this.phone,
        createdAt: this.createdAt,
        isActive: this.isActive
    };
};

// Virtual for full address
UserSchema.virtual('fullAddress').get(function() {
    const parts = [];
    if (this.address?.street) parts.push(this.address.street);
    if (this.address?.city) parts.push(this.address.city);
    if (this.address?.state) parts.push(this.address.state);
    if (this.address?.zipCode) parts.push(this.address.zipCode);
    if (this.address?.country) parts.push(this.address.country);
    return parts.join(', ');
});

// Pre-save middleware to update timestamps
UserSchema.pre('save', function(next) {
    if (this.isModified('password') && !this.isNew) {
        this.updatedAt = Date.now();
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;