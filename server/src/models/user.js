const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error("Invalid Email!!")
        }
    },
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 31,
        unique: true,
        lowercase: true,
    },
    displayName: {
        type: String,
        required: true,
        maxlength: 31,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        maxlength: 23,
    },
    bio: {
        type: String,
        maxlength: 255,
        required: false,
        default: "",
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    }],
    tweetsCount : {
        type: Number,
        default: 0,
    },
    retweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    }],
    avatar: {
        type: Buffer,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
})

// pre remove delete all tweets

userSchema.virtual("tweets", {
    ref: "Tweet",
    localField: "_id",
    foreignField: "user"
})

userSchema.virtual('homeTweetIDs').get(function () {
    const homeTweetIDs = this.followings
    homeTweetIDs.push(this._id)
    return homeTweetIDs
})

userSchema.methods = {
    generateAuthToken: async function () {
        const user = this
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
        user.tokens = user.tokens.concat({ token })
        await user.save()
        return token
    },
    toggleBookmarkTweet: async function (tweetID) {
        const user = this
        const isBookmarked = await user.bookmarks.includes(tweetID)
        let message;
        if (isBookmarked) {
            user.bookmarks = user.bookmarks.filter(item => item !== tweetID)
            await user.save()
            message = "removed from bookmarks"
        } else {
            user.bookmarks.push(tweetID)
            await user.save()
            message = "added to bookmarks"
        }
        return message
    }
}

userSchema.statics = {
    findByCredentials: async (email, password) => {
        const user = await User.findOne({ email })
        if (!user) throw new Error("incorrect email")
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) throw new Error("incorrect password")
        return user
    },
    toggleFollow: async (followerUser, targetUserID) => {
        const targetUser = await User.findOne({ _id: targetUserID })
        const isFollowed = followerUser.followings.includes(targetUserID)
        let message;
        if (isFollowed) {
            followerUser.followings.splice(followerUser.followings.indexOf(targetUserID), 1)
            await followerUser.save()
            targetUser.followers.splice(targetUser.followers.indexOf(followerUser._id), 1)
            await targetUser.save()
            message = "user unfollowed!"
        } else {
            followerUser.followings.push(targetUserID)
            await followerUser.save()
            targetUser.followers.push(followerUser._id)
            await targetUser.save()
            message = "user followed!"
        }
        return message
    },
}

userSchema.pre("save", async function (next) {
    const user = this
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User