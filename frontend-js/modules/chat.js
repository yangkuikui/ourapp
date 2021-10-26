export default class Chat {
  constructor() {
    this.openedYet = false // not yet opened
    this.chatWrapper = document.querySelector(".chat-wrapper")
    this.injectHTML()

    this.openChat = document.querySelector(".header-chat-icon")
    this.closeChat = document.querySelector(".chat-title-bar-close")
    this.events()
  }

  events() {
    this.openChat.addEventListener("click", () => this.showChat())
    this.closeChat.addEventListener("click", () => this.hideChat())
  }

  openConnection() {
    alert("open a connection.")
  }

  showChat() {
    if (!this.openedYet) {
      this.openConnection()
    }
    this.openedYet = true // only set a connection at the first time to open chat.

    this.chatWrapper.classList.add("chat--visible")
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

  // methods
}
