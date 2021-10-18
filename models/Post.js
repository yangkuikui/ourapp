const postsCollection = require("../db").db().collection("posts")
const ObjectID = require("mongodb").ObjectID
const User = require("./User")

let Post = function (data, userid) {
  this.data = data
  this.errors = []
  this.userid = userid
}

Post.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      try {
        await postsCollection.insertOne(this.data)
        resolve("success")
      } catch {
        this.errors.push("Please try again later.")
        reject(this.errors)
      }
    } else {
      reject(this.errors)
    }
  })
}

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") this.data.title = ""
  if (typeof this.data.body != "string") this.data.body = ""

  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userid)
  }
}

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a title.")
  }
  if (this.data.body == "") {
    this.errors.push("You must provide post content.")
  }
}

Post.findSingleById = function (id) {
  // adding a function(property) to a function.

  return new Promise(async (resolve, reject) => {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      // make sure user input data clean(simple string text)
      reject()
      return
    }

    let posts = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectID(id) } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo"
          }
        },
        {
          $project: {
            title: 1,
            body: 1,
            createdDate: 1,
            author: { $arrayElemAt: ["$authorInfo", 0] }
          }
        }
      ])
      .toArray()
    // clean up author property in each post object.
    posts.map(post => {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar // can not say User.getAvatar()
      }
      return post
    })
    if (posts.length) {
      // console.log(posts[0])
      resolve(posts[0])
    } else {
      reject()
    }
  })
}

Post.findByAuthorId = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let posts = await postsCollection.find({ author: new ObjectID(id) }).toArray()
      console.log(posts)
      resolve(posts)
    } catch {
      reject()
    }
  })
}
module.exports = Post
