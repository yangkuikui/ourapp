import DOMPurify from "dompurify"

export default class Chat {
  constructor() {
    this.openedYet = false // not yet opened
    this.chatWrapper = document.querySelector(".chat-wrapper")
    this.injectHTML()
    this.chatField = document.querySelector("#chatField")
    this.chatForm = document.querySelector("#chatForm")
    this.chatLog = document.querySelector("#chat")
    this.openChat = document.querySelector(".header-chat-icon")
    this.closeChat = document.querySelector(".chat-title-bar-close")
    this.events()
  }

  events() {
    this.openChat.addEventListener("click", () => this.showChat())
    this.closeChat.addEventListener("click", () => this.hideChat())
    this.chatForm.addEventListener("submit", e => {
      e.preventDefault()
      this.sendMsgToServer()
    })
  }

  sendMsgToServer() {
    // send user input to server
    this.socket.emit("chatMsgFromBrowser", {
      // we are free to create as many types of events as we want
      message: this.chatField.value
    })
    this.chatLog.insertAdjacentHTML(
      "beforeend",
      DOMPurify.sanitize(`
    <div class="chat-self">
    <div class="chat-message">
      <div class="chat-message-inner">
        ${this.chatField.value}
      </div>
    </div>
    <img class="chat-avatar avatar-tiny" src="${this.avatar}">
  </div>
    `)
    )
    // let chatlog to scroll down to the very bottom
    this.chatLog.scrollTop = this.chatLog.scrollHeight
    this.chatField.value = ""
    this.chatField.focus()
  }

  openConnection() {
    // open a connection between browser and server
    this.socket = io()

    this.socket.on("welcome", data => {
      this.username = data.username
      this.avatar = data.avatar
    })

    // to receive msg sended from server
    this.socket.on("chatMsgFromServer", data => {
      this.displayMsgFromServer(data)
    })
  }

  displayMsgFromServer(data) {
    this.chatLog.insertAdjacentHTML(
      "beforeend",
      DOMPurify.sanitize(`
      <div class="chat-other">
      <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
      <div class="chat-message"><div class="chat-message-inner">
        <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
        ${data.message}
      </div></div>
    </div>
    `)
    )
    this.chatLog.scrollTop = this.chatLog.scrollHeight
  }

  showChat() {
    if (!this.openedYet) {
      this.openConnection()
    }
    this.openedYet = true // only set a connection at the first time to open chat.

    this.chatWrapper.classList.add("chat--visible")
    this.chatField.focus()
  }

  hideChat() {
    this.chatWrapper.classList.remove("chat--visible")
  }

  injectHTML() {
    this.chatWrapper.innerHTML = `
    <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
    <div id="chat" class="chat-log"></div>
    <form id="chatForm" class="chat-form border-top">
      <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
    </form>
    `
  }
}
