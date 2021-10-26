const postsCollection = require("../db").db().collection("posts")
const followsCollection = require("../db").db().collection("follows")

const ObjectID = require("mongodb").ObjectID
const User = require("./User")
const sanitizeHTML = require("sanitize-html")

let Post = function (data, userid, requestedPostId) {
  this.data = data
  this.errors = []
  this.userid = userid
  this.requestedPostId = requestedPostId
}

Post.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      try {
        let newPost = await postsCollection.insertOne(this.data)
        // console.log(newPost)
        resolve(newPost.ops[0]._id)
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
    title: sanitizeHTML(this.data.title.trim(), { allowedTags: [], allowedAttributes: {} }),
    body: sanitizeHTML(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
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

Post.reusablePostQuery = function (uniqueOperations, visitorid) {
  // adding a function(property) to a function.

  return new Promise(async (resolve, reject) => {
    let aggOperations = uniqueOperations.concat([
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
          authorId: "$author",
          author: { $arrayElemAt: ["$authorInfo", 0] }
        }
      }
    ])

    let posts = await postsCollection.aggregate(aggOperations).toArray()
    posts.map(post => {
      post.isVisitorOwner = post.authorId.equals(visitorid)

      post.authorId = undefined
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }
      return post
    })
    resolve(posts)
  })
}

Post.findSingleById = function (id, visitorid) {
  // adding a function(property) to a function.

  return new Promise(async (resolve, reject) => {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      // make sure user input data clean(simple string text)
      reject()
      return
    }

    let posts = await Post.reusablePostQuery([{ $match: { _id: new ObjectID(id) } }], visitorid)
    if (posts.length) {
      // console.log(posts[0])
      resolve(posts[0])
    } else {
      reject()
    }
  })
}

Post.findByAuthorId = function (id) {
  return Post.reusablePostQuery([{ $match: { author: new ObjectID(id) } }, { $sort: { createdDate: -1 } }])
}

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid)
      if (post.isVisitorOwner) {
        let status = await this.actuallyUpdate()
        resolve(status)
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.validate()
      this.cleanUp()
      if (!this.errors.length) {
        await postsCollection.findOneAndUpdate({ _id: new ObjectID(this.requestedPostId) }, { $set: { title: this.data.title, body: this.data.body } })
        resolve("success")
      } else {
        resolve("failure")
      }
    } catch {
      reject()
    }
  })
}

Post.delete = function (postId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(postId, userId)

      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({ _id: new ObjectID(postId) })
        resolve()
      } else {
      }
    } catch {
      reject()
    }
  })
}

Post.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    // postsCollection.createIndex({ title: "text", body: "text" })

    if (typeof searchTerm == "string") {
      let posts = await Post.reusablePostQuery([{ $match: { $text: { $search: searchTerm } } }])
      // console.log(posts)
      resolve(posts)
    } else {
      reject()
    }
  })
}

Post.countPostsByAuthor = function (userid) {
  return new Promise(async (resolve, reject) => {
    try {
      let postCount = await postsCollection.countDocuments({ author: userid })

      resolve(postCount)
    } catch {
      reject()
    }
  })
}

Post.getFeed = function (id) {
  return new Promise(async (resolve, reject) => {
    let followDocs = await followsCollection.find({ followingId: new ObjectID(id) }).toArray() // take session string for DB match

    if (followDocs.length) {
      followDocs.map(async function (doc) {
        let posts = await Post.findByAuthorId(doc.followedId)
        resolve(posts)
      })
    } else {
      resolve([])
    }
  })
}

module.exports = Post
