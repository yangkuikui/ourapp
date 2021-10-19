const { rawListeners } = require("../app")
const Post = require("../models/Post")

exports.viewCreateScreen = function (req, res) {
  res.render("create-post")
}

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id)
  post
    .create()
    .then(result => {
      req.flash("success", result)
      req.session.save(() => {
        res.redirect(`/profile/${req.session.user.username}`)
      })
    })
    .catch(() => {
      post.errors.forEach(e => {
        req.flash("errors", e)
      })
      req.session.save(() => {
        res.redirect("/create-post")
      })
    })
}

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    res.render("single-post-screen", { post: post })
  } catch {
    res.render("404")
  }
}

exports.edit = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id)
  post
    .update()
    .then(status => {
      if (status == "success") {
        req.flash("success", "Post successfully updated")
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}/edit`)
        })
      } else {
        post.errors.forEach(e => {
          req.flash("errors", e)
        })
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}/edit`)
        })
      }
    })
    .catch(() => {
      req.flash("errors", "You have no permission to perform that action")
      req.session.save(() => {
        res.redirect("/")
      })
    })
}

exports.viewEdit = async function (req, res) {
  let post = await Post.findSingleById(req.params.id)
  res.render("edit-post", { post: post })
}
