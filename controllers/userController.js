// module.exports = {
//   login: function(){},
//   logout: function(){}
// }

const User = require("../models/User")

exports.login = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(result => {
      if (result == "true") {
        req.session.user = {
          username: user.data.username
        }
        res.render("home-dashboard", { username: req.session.user.username })
      } else {
        res.redirect("/")
      }
    })
    .catch(() => {})
}

exports.logout = async function (req, res) {
  if (req.session.user) {
    await req.session.destroy()
    res.redirect("/")
  } else {
  }
}

exports.register = function (req, res) {
  let user = new User(req.body)
  user.register()
  if (user.errors.length) {
    res.send(user.errors)
  } else {
    res.send("No errors.")
  }
}

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username })
  } else {
    res.render("home-guest")
  }
}
