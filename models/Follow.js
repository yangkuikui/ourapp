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
      await this.validate()
      await followsCollection.deleteOne({ followingId: new ObjectID(this.followingId), followedId: this.followedId })
      resolve()
    } catch {
      reject()
    }
  })
}

Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    await this.validate()
    if (!this.errors.length) {
      await followsCollection.insertOne({ followingId: new ObjectID(this.followingId), followedId: this.followedId })
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

Follow.prototype.cleanUp = function () {
  if (typeof this.followedUsername != "string") {
    this.followedUsername = ""
  }
}

Follow.prototype.validate = async function () {
  let existUser = await User.findUserByUsername(this.followedUsername)
  if (existUser) {
    this.followedId = existUser.id
  } else {
    this.errors.push("You cannot follow a user that do not exist.")
  }
}

Follow.isVisitorFollowing = async function (followingId, followedId) {
  let followDoc = await followsCollection.findOne({ followingId: new ObjectID(followingId), followedId: followedId })
  console.log(followDoc) // can not find.
  if (followDoc) {
    return true
  } else {
    return false
  }
}

module.exports = Follow
