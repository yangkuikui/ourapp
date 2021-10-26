const followsCollection = require("../db").db().collection("follows")
const ObjectID = require("mongodb").ObjectID
const User = require("../models/User")

let Follow = function (followingId, followedUsername) {
  this.followingId = followingId
  this.followedUsername = followedUsername
  this.errors = []
}

Follow.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    try {
      await this.validate("delete")
      await followsCollection.deleteOne({ followingId: new ObjectID(this.followingId), followedId: this.followedId })
      resolve()
    } catch {
      reject()
    }
  })
}

Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanUp()
      await this.validate("create")
      if (!this.errors.length) {
        await followsCollection.insertOne({ followingId: new ObjectID(this.followingId), followedId: this.followedId })
        resolve()
      } else {
        reject(this.errors)
      }
    } catch {
      reject()
    }
  })
}

Follow.prototype.cleanUp = function () {
  if (typeof this.followedUsername != "string") {
    this.followedUsername = ""
  }
}

Follow.prototype.validate = function (action) {
  return new Promise(async (resolve, reject) => {
    try {
      let existUser = await User.findUserByUsername(this.followedUsername)
      if (existUser) {
        this.followedId = existUser.id
      } else {
        this.errors.push("You cannot follow a user that do not exist")
      }

      let existFollow = await followsCollection.findOne({ followedId: this.followedId, followingId: new ObjectID(this.followingId) })
      if (action == "create") {
        if (existFollow) this.errors.push("You are already following this user")
      }

      if (action == "delete") {
        if (!existFollow) this.errors.push("You cannot stop following someone you have not already followed")
      }

      // set can not follow oneself.
      // let isSame = this.followingId == this.followedId
      // console.log(isSame)
      // if (isSame) {
      //   this.errors.push("You can not follow yourself")
      // }

      resolve()
    } catch {
      reject()
    }
  })
}

Follow.isVisitorFollowing = async function (followingId, followedId) {
  try {
    let followDoc = await followsCollection.findOne({ followingId: new ObjectID(followingId), followedId: followedId })
    // console.log(followDoc) // can not find.
    if (followDoc) {
      return true
    } else {
      return false
    }
  } catch {}
}

Follow.getFollowersById = function (userid) {
  return new Promise(async (resolve, reject) => {
    try {
      let followers = await followsCollection
        .aggregate([
          { $match: { followedId: userid } },
          { $lookup: { from: "users", localField: "followingId", foreignField: "_id", as: "userDoc" } },
          {
            $project: {
              username: { $arrayElemAt: ["$userDoc.username", 0] },
              email: { $arrayElemAt: ["$userDoc.email", 0] }
            }
          }
        ])
        .toArray() // find userDoc from within followsCollection
      followers = followers.map(follower => {
        let user = new User(follower, true)

        return {
          username: follower.username,
          avatar: user.avatar
        }
      })

      resolve(followers)
    } catch {
      reject()
    }
  })
}

Follow.getFollowingById = function (userid) {
  return new Promise(async (resolve, reject) => {
    try {
      let followers = await followsCollection
        .aggregate([
          { $match: { followingId: userid } },
          { $lookup: { from: "users", localField: "followedId", foreignField: "_id", as: "userDoc" } },
          {
            $project: {
              username: { $arrayElemAt: ["$userDoc.username", 0] },
              email: { $arrayElemAt: ["$userDoc.email", 0] }
            }
          }
        ])
        .toArray() // find userDoc from within followsCollection
      followers = followers.map(follower => {
        let user = new User(follower, true)

        return {
          username: follower.username,
          avatar: user.avatar
        }
      })

      resolve(followers)
    } catch {
      reject()
    }
  })
}

Follow.countFollowersById = function (userid) {
  return new Promise(async (resolve, reject) => {
    try {
      let followerCount = await followsCollection.countDocuments({ followedId: userid })

      resolve(followerCount)
    } catch {
      reject()
    }
  })
}

Follow.countFollowingById = function (userid) {
  return new Promise(async (resolve, reject) => {
    try {
      let followingCount = await followsCollection.countDocuments({ followingId: userid })

      resolve(followingCount)
    } catch {
      reject()
    }
  })
}

module.exports = Follow
