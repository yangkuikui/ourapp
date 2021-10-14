// module.exports = {
//   login: function(){},
//   logout: function(){}
// }

exports.login = function () {}

exports.logout = function () {}

exports.register = function (req, res) {
  res.send("Thank you for trying to submit!")
}

exports.home = function (req, res) {
  res.render("home-guest")
}
