// module.exports = {
//   login: function(){},
//   logout: function(){}
// }

const User = require("../models/User")
const Post = require("../models/Post")
const Follow = require("../models/Follow")
const jwt = require("jsonwebtoken")

exports.apiLogin = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(result => {
      res.json(jwt.sign({ _id: user.data._id }, process.env.JWTSECRET, { expiresIn: "7d" }))
    })
    .catch(e => {
      res.json("sorry.")
    })
}

exports.apiMustBeLoggedIn = function (req, res, next) {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET)
    next()
  } catch {
    res.json("Sorry, invalid token.")
  }
}

exports.apiGetPostsByUsername = async function (req, res) {
  try {
    let authorDoc = await User.findUserByUsername(req.params.username)
    let posts = await Post.findByAuthorId(authorDoc.id)
    res.json(posts)
  } catch {
    res.json("sorry, invalid request.")
  }
}

exports.login = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(result => {
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id //  _id property added to user.data through insertOne() function.
      }
      req.session.save(() => {
        // for updating session object in database will take a while, so save() to make it surely completed before run res.render
        res.redirect("/")
      })
    })
    .catch(e => {
      req.flash("errors", e)
      // modify session object in database just like saying: req.session.flash.errors = [e]
      req.session.save(() => {
        res.redirect("/")
      })
    })
}

exports.logout = function (req, res) {
  if (req.session.user) {
    req.session.destroy(() => {
      res.redirect("/")
    })
  }
}

exports.register = function (req, res) {
  let user = new User(req.body)
  user
    .register()
    .then(() => {
      req.session.user = { username: user.data.username, avatar: user.avatar, _id: user.data._id }
    })
    .catch(regErrors => {
      // use forEach to loop each error
      regErrors.forEach(error => {
        req.flash("regErrors", error)
      })
    })
    .finally(() => {
      req.session.save(() => {
        res.redirect("/")
      })
    })
}

exports.home = async function (req, res) {
  try {
    if (req.session.user) {
      // fetch followed users posts.
      let posts = await Post.getFeed(req.session.user._id)

      res.render("home-dashboard", { posts: posts })
    } else {
      res.render("home-guest", { regErrors: req.flash("regErrors") }) // flash package let us display errors and soon delete it for us.
    }
  } catch {
    res.render("404")
  }
}

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(() => {
      res.redirect("/")
    })
  }
}

exports.ifUserExists = async function (req, res, next) {
  try {
    let user = await User.findUserByUsername(req.params.username)
    if (user) {
      req.profileUser = user
      next()
    } else {
      res.render("404")
    }
  } catch {
    res.render("404")
  }
}

exports.profilePostsScreen = function (req, res) {
  // pull posts of that profile user.

  Post.findByAuthorId(req.profileUser.id)
    .then(posts => {
      res.render("profile", { title: `Profile for ${req.profileUser.username}`, isVisitorsProfile: req.isVisitorsProfile, count: { posts: req.postCount, followers: req.followerCount, following: req.followingCount }, currentPage: "posts", profileUser: req.profileUser, posts: posts, isFollowing: req.isFollowing })
    })
    .catch(() => {
      res.render("404")
    })
}

exports.sharedProfileData = async function (req, res, next) {
  try {
    let isFollowing = false
    let isVisitorsProfile = false

    if (req.session.user) {
      isFollowing = await Follow.isVisitorFollowing(req.visitorId, req.profileUser.id)
      req.isFollowing = isFollowing

      if (req.session.user._id == req.profileUser.id) {
        isVisitorsProfile = true
      }

      req.isVisitorsProfile = isVisitorsProfile
    }

    // retrieve post, follower, and following counts.
    let postCountPromise = Post.countPostsByAuthor(req.profileUser.id)
    let followerCountPromise = Follow.countFollowersById(req.profileUser.id)
    let followingCountPromise = Follow.countFollowingById(req.profileUser.id)

    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])
    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount

    next()
  } catch {
    res.render("404")
  }
}

exports.profileFollowersScreen = async function (req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser.id)
    res.render("profile-followers", { isVisitorsProfile: req.isVisitorsProfile, count: { posts: req.postCount, followers: req.followerCount, following: req.followingCount }, currentPage: "followers", profileUser: req.profileUser, isFollowing: req.isFollowing, followers: followers })
  } catch {
    res.render("404")
  }
}

exports.profileFollowingScreen = async function (req, res) {
  try {
    let followers = await Follow.getFollowingById(req.profileUser.id)
    res.render("profile-following", { isVisitorsProfile: req.isVisitorsProfile, count: { posts: req.postCount, followers: req.followerCount, following: req.followingCount }, currentPage: "following", profileUser: req.profileUser, isFollowing: req.isFollowing, followers: followers })
  } catch {
    res.render("404")
  }
}

exports.doesUsernameExist = function (req, res) {
  User.findUserByUsername(req.body.username)
    .then(() => {
      res.json(true)
    })
    .catch(() => {
      res.json(false)
    })
}

exports.doesEmailExist = function (req, res) {
  User.checkEmail(req.body.email)
    .then(() => {
      res.json(true)
    })
    .catch(() => {
      res.json(false)
    })
}
