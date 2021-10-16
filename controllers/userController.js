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
      req.session.user = {
        username: user.data.username
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
      req.session.user = { username: user.data.username }
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
    res.render("home-dashboard", { username: req.session.user.username })
  } else {
    res.render("home-guest", { errors: req.flash("errors"), regErrors: req.flash("regErrors") }) // flash package let us display errors and soon delete it for us.
  }
}
