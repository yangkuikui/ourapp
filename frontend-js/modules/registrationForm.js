export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll("#registration-form .form-control")
    this.insertValidationElements()
    this.username = document.querySelector("#username-register")
    this.username.previousValue = ""
    this.events()
  }

  events() {
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler)
    })
  }

  isDifferent(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this) // not to change what this points towards.
    }

    el.previousValue = el.value
  }

  usernameHandler() {
    this.username.errors = false
    this.usernameImmediately()
    clearTimeout(this.username.timer)
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 3000)
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
