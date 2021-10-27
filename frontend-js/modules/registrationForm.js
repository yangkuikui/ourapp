import axios from "axios"
export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll("#registration-form .form-control")
    this.insertValidationElements()
    this.username = document.querySelector("#username-register")
    this.username.previousValue = ""
    this.email = document.querySelector("#email-register")
    this.email.previousValue = ""
    this.password = document.querySelector("#password-register")
    this.password.previousValue = ""
    this.form = document.querySelector("#registration-form")
    this.username.isUnique = false
    this.email.isUnique = false

    this.events()
  }

  events() {
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler)
    })
    this.email.addEventListener("keyup", () => {
      this.isDifferent(this.email, this.emailHandler)
    })
    this.password.addEventListener("keyup", () => {
      this.isDifferent(this.password, this.passwordHandler)
    })
    // prevent a quick tab key switch.
    this.username.addEventListener("blur", () => {
      this.isDifferent(this.username, this.usernameHandler)
    })
    this.email.addEventListener("blur", () => {
      this.isDifferent(this.email, this.emailHandler)
    })
    this.password.addEventListener("blur", () => {
      this.isDifferent(this.password, this.passwordHandler)
    })
    // submit event
    this.form.addEventListener("submit", e => {
      e.preventDefault()
      this.formSubmitHandler()
    })
  }

  formSubmitHandler() {
    // avoid user to submit directly without input
    this.usernameImmediately()
    this.usernameAfterDelay()
    this.emailAfterDelay()
    this.passwordAfterDelay()
    this.passwordImmediately()

    if (this.username.isUnique && this.email.isUnique && !this.username.errors && !this.email.errors && !this.password.errors) {
      this.form.submit()
    }
  }

  isDifferent(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this) // not to change what this points towards.
    }

    el.previousValue = el.value
  }
  emailHandler() {
    this.email.errors = false
    clearTimeout(this.email.timer)
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 800)
  }

  emailAfterDelay() {
    if (this.email.value != "" && !/^\S+@\S+$/.test(this.email.value)) {
      this.showValidationError(this.email, "You must provide a valid Email address.")
    }

    if (!this.email.errors) {
      axios
        .post("/doesemailExist", { email: this.email.value })
        .then(response => {
          console.log(response)
          if (response.data) {
            this.showValidationError(this.email, "That email is already used.")
            this.email.isUnique = false
          } else {
            this.email.isUnique = true
            this.hideValidationError(this.email)
          }
        })
        .catch(() => {
          console.log("try again")
        })
    }
  }

  passwordHandler() {
    this.password.errors = false
    this.passwordImmediately()
    clearTimeout(this.password.timer)
    this.password.timer = setTimeout(() => this.passwordAfterDelay(), 800)
  }

  passwordImmediately() {
    if (this.password.value.length > 50) {
      this.showValidationError(this.password, "Password can not exceed 50 characters.")
    }
    if (!this.password.errors) {
      this.hideValidationError(this.password)
    }
  }

  passwordAfterDelay() {
    if (this.password.value.length < 12) {
      this.showValidationError(this.password, "Password must be at least 12 charactoers.")
    }
  }

  usernameHandler() {
    this.username.errors = false
    this.usernameImmediately()
    clearTimeout(this.username.timer)
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 800)
  }

  usernameImmediately() {
    if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
      this.showValidationError(this.username, "Username can only contain letters and numbers.")
    }

    if (this.username.value.length > 30) {
      this.showValidationError(this.username, "Username can not exceed 30 characters.")
    }

    if (!this.username.errors) {
      this.hideValidationError(this.username)
    }
  }

  showValidationError(el, msg) {
    el.nextElementSibling.innerText = msg
    el.nextElementSibling.classList.add("liveValidateMessage--visible")
    el.errors = true
  }

  hideValidationError(el) {
    el.nextElementSibling.classList.remove("liveValidateMessage--visible")
  }

  usernameAfterDelay() {
    if (this.username.value.length < 3) {
      this.showValidationError(this.username, "Username must be at least 3 charactoers.")
    }

    if (!this.username.errors) {
      axios
        .post("/doesUsernameExist", { username: this.username.value })
        .then(response => {
          console.log(response)
          if (response.data) {
            this.showValidationError(this.username, "That username is already taken.")
            this.username.isUnique = false
          } else {
            this.username.isUnique = true
          }
        })
        .catch(() => {
          console.log("try again")
        })
    }
  }

  insertValidationElements() {
    this.allFields.forEach(el => {
      el.insertAdjacentHTML(
        "afterend",
        `
      <div class="alert alert-danger small liveValidateMessage"></div>
      `
      )
    })
  }
}
