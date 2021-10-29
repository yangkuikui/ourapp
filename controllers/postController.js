const { rawListeners } = require("../app")
const Post = require("../models/Post")

exports.apiCreate = function (req, res) {
  let post = new Post(req.body, req.apiUser._id)
  post
    .create()
    .then(id => {
      res.json("Congrats!")
    })
    .catch(errors => {
      res.json(errors)
    })
}

exports.apiDelete = function (req, res) {
  Post.delete(req.params.id, req.apiUser._id)
    .then(id => {
      res.json("success!")
    })
    .catch(errors => {
      res.json(errors)
    })
}

exports.viewCreateScreen = function (req, res) {
  res.render("create-post")
}

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id)
  post
    .create()
    .then(id => {
      req.flash("success", "Post successfully created")
      req.session.save(() => {
        res.redirect(`/post/${id}`)
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
    res.render("single-post-screen", { post: post, title: post.title })
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

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post })
    } else {
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(() => res.redirect("/"))
    }
  } catch {
    res.render("404")
  }
}

exports.delete = function (req, res) {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post successfully deleted")
      req.session.save(() => {
        res.redirect(`/profile/${req.session.user.username}`)
      })
    })
    .catch(() => {
      req.flash("errors", "You have no permission to perform that action")
      req.session.save(() => {
        res.redirect("/")
      })
    })
}

exports.search = function (req, res) {
  Post.search(req.body.searchTerm)
    .then(posts => {
      res.json(posts)
    })
    .catch(() => {
      res.json([])
    })
}
