const Follow = require("../models/Follow")
const User = require("../models/User")

exports.addFollow = async function (req, res) {
  let follow = new Follow(req.visitorId, req.params.username)
  follow
    .create()
    .then(() => {
      req.flash("success", `successfully followed ${req.params.username}`)
      req.session.save(() => {
        res.redirect(`/profile/${req.params.username}`)
      })
    })
    .catch(errors => {
      errors.foreach(error => {
        req.flash("errors", error)
      })
      req.session.save(() => {
        res.redirect(`/profile/${req.params.username}`)
      })
    })
}

exports.removeFollow = async function (req, res) {
  let follow = new Follow(req.visitorId, req.params.username)
  follow
    .delete()
    .then(() => {
      req.flash("success", `successfully stopped following ${req.params.username}`)
      req.session.save(() => {
        res.redirect(`/profile/${req.params.username}`)
      })
    })
    .catch(errors => {
      errors.foreach(error => {
        req.flash("errors", error)
      })
      req.session.save(() => {
        res.redirect(`/profile/${req.params.username}`)
      })
    })
}
