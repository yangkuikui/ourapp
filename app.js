const express = require("express")
const app = express()

const router = require("./router") // require does 2 things. #1 execute that file immediately. #2 return whatever that file exports

app.use(express.urlencoded({ extended: false })) // let express to add user submitted data onto request object.
app.use(express.json()) // send json data

app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

// use router
app.use("/", router)

module.exports = app
