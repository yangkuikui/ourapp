// module.exports = {
//   login: function(){},
//   logout: function(){}
// }

const User = require("../models/User")
const Post = require("../models/Post")

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

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard")
  } else {
    res.render("home-guest", { regErrors: req.flash("regErrors") }) // flash package let us display errors and soon delete it for us.
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
  let user = await User.findUserByUsername(req.params.username)
  if (user) {
    req.profileUser = user
    next()
  } else {
    res.render("404")
  }
}

exports.profilePostsScreen = function (req, res) {
  // pull posts of that profile user.

  Post.findByAuthorId(req.profileUser.id)
    .then(posts => {
      res.render("profile", { user: req.profileUser, posts: posts })
    })
    .catch(() => {
      res.render("404")
    })
}
