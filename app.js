const express = require("express")
const app = express()

const router = require("./router") // require does 2 things. #1 execute that file immediately. #2 return whatever that file exports

app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

// use router
app.use("/", router)

app.listen(3000)
