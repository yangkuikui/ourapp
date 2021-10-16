const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const flash = require("connect-flash")
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

const router = require("./router") // require does 2 things. #1 execute that file immediately. #2 return whatever that file exports

app.use(express.urlencoded({ extended: false })) // let express to add user submitted data onto request object.
app.use(express.json()) // send json data

app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

// use router
app.use("/", router)

module.exports = app
