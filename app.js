const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const flash = require("connect-flash")
const markdown = require("marked")
const sanitizeHTML = require("sanitize-html")

const app = express()

let sessionOptions = session({
  secret: "JavaScript is so cool!",
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})

app.use(sessionOptions)
app.use(flash())

app.use(function (req, res, next) {
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown(content), { allowedTags: ["p", "div", "br", "li", "ol", "ul", "strong", "small", "em", "i", "h1", "h2", "h3", "h4", "h5", "h6"], allowedAttributes: {} })
  }

  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")

  // make current user id available on the req object.
  if (req.session.user) {
    req.visitorId = req.session.user._id
  } else {
    req.visitorId = 0
  }

  // make user session data available from within view template.
  res.locals.user = req.session.user
  next()
}) // this middleware function should be above router to let every router to use it.

const router = require("./router") // require does 2 things. #1 execute that file immediately. #2 return whatever that file exports

app.use(express.urlencoded({ extended: false })) // let express to add user submitted data onto request object.
app.use(express.json()) // send json data

app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

// use router
app.use("/", router)

// socket.io
const server = require("http").createServer(app)
const io = require("socket.io")(server)
io.on("connection", socket => {
  // socket represents the connection between server and browser
  // console.log("a new user connected!")
  socket.on("chatMsgFromBrowser", data => {
    // set 'data' to receive that incoming data.
    console.log(data.message) // 'message' was made within front-end chat.js/sendMsgToServer()
    io.emit("chatMsgFromServer", { message: data.message }) // server sends msg to all connected browsers
  })
})

module.exports = server
