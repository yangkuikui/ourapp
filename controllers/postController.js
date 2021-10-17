const Post = require("../models/Post")

exports.viewCreateScreen = function (req, res) {
  res.render("create-post")
}

exports.create = function (req, res) {
  let post = new Post(req.body)
  post
    .create()
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      res.send(e)
    })
}
