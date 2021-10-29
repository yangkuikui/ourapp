const apiRouter = require("express").Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const followController = require("./controllers/followController")
const cors = require("cors")

apiRouter.use(cors())
// set to make all of routes that are listed below allowed from any domain

apiRouter.post("/login", userController.apiLogin)
apiRouter.post("/create-post", userController.apiMustBeLoggedIn, postController.apiCreate)
apiRouter.delete("/post/:id", userController.apiMustBeLoggedIn, postController.apiDelete)
apiRouter.get("/postsByAuthor/:username", userController.apiGetPostsByUsername)

module.exports = apiRouter
