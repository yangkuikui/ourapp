const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const flash = require("connect-flash")
const markdown = require("marked")
const sanitizeHTML = require("sanitize-html")
const csrf = require("csurf")

const app = express()

app.use(express.urlencoded({ extended: false })) // let express to add user submitted data onto request object.
app.use(express.json()) // send json data
app.use("/api", require("./router-api.js"))

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

app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

// set to make every route request must use a matching csrf token.
app.use(csrf())

// make csrf token avaidable from within html template.
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  next()
})

// use router
app.use("/", router)

app.use((err, req, res, next) => {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash("errors", "Cross site request forgery detected.")
      req.session.save(() => {
        res.redirect("/")
      })
    } else {
      res.render("404")
    }
  }
})

// socket.io related
const server = require("http").createServer(app)
const io = require("socket.io")(server)

io.use((socket, next) => {
  sessionOptions(socket.request, socket.request.res, next)
})

io.on("connection", socket => {
  if (socket.request.session.user) {
    let user = socket.request.session.user

    socket.emit("welcome", { username: user.username, avatar: user.avatar })
    socket.on("chatMsgFromBrowser", data => {
      // use 'socket.broadcast.' instead of 'io.' to send msg to any connected browsers except the sender.
      socket.broadcast.emit("chatMsgFromServer", { message: sanitizeHTML(data.message, { allowedTags: [], allowedAttributes: {} }), username: user.username, avatar: user.avatar })
    })
  }
})

module.exports = server
