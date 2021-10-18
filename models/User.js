const usersCollection = require("../db").db().collection("users") //../
const validator = require("validator")
const bcrypt = require("bcryptjs")
const md5 = require("md5")

let User = function (data, getAvatar) {
  this.data = data // add a property to store incoming data via arg
  this.errors = []
  if (getAvatar == undefined) getAvatar = false
  if (getAvatar == true) this.getAvatar()
}

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = ""
  }
  if (typeof this.data.email != "string") {
    this.data.email = ""
  }
  if (typeof this.data.password != "string") {
    this.data.password = ""
  }
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  }
}

User.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == "") {
      this.errors.push("You must provide a username.")
    }

    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
      this.errors.push("Username can only contain letters and numbers.")
    }

    if (!validator.isEmail(this.data.email)) {
      // check is blank and is email or not
      this.errors.push("You must provide a valid email address.")
    }
    if (this.data.password == "") {
      this.errors.push("You must provide a password.")
    }

    if (this.data.password.length > 0 && this.data.password.length < 12) {
      this.errors.push("Password must be at least 12 characters.")
    }

    if (this.data.password.length > 50) {
      this.errors.push("Password can not exceed 50 characters.")
    }

    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Username must be at least 3 characters.")
    }

    if (this.data.password.length > 30) {
      this.errors.push("Username can not exceed 30 characters.")
    }

    // Only if username is valid then check to see if its already taken.

    if (this.data.username.length > 2 && validator.isAlphanumeric(this.data.username) && this.data.username.length < 31) {
      let usernameExists = await usersCollection.findOne({ username: this.data.username })

      if (usernameExists) {
        this.errors.push("That username is already taken.")
      }
    }
    // Only if email is valid then check to see if its already taken.
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({ email: this.data.email })

      if (emailExists) {
        this.errors.push("That Email address is already being used.")
      }
    }
    resolve()
  })
}

User.prototype.login = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    if (this.data.username) {
      try {
        const trueUser = await usersCollection.findOne({ username: this.data.username })
        if (trueUser && bcrypt.compareSync(this.data.password, trueUser.password)) {
          this.data = trueUser // for incoming data has no email info.
          this.getAvatar()
          resolve("Success")
        } else {
          reject("Invalid username / password.")
        }
      } catch {
        reject("Database connecting error.")
      }
    }
  })
}

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // Step #1 validate user data.
    this.cleanUp()
    await this.validate()

    // save to DB

    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data) // this.data object modified. _id property added.
      this.getAvatar() // store it into user object in memory instead of into database.
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.prototype.getAvatar = function () {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

module.exports = User
