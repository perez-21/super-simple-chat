// DOM elements
const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const loginForm = document.getElementById("login-form");
const messageForm = document.getElementById("message-form");
const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const usernameInput = document.getElementById("username-input");
const usernameDisplay = document.getElementById("username-display");
const connectionStatus = document.getElementById("connection-status");

// WebSocket connection
let socket = null;

// Current user
let currentUser = "";

// Format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Update connection status UI
function updateConnectionStatus(status) {
  connectionStatus.textContent = status;
  connectionStatus.className = "connection-status";

  if (status === "Connected") {
    connectionStatus.classList.add("status-connected");
  } else if (status === "Disconnected") {
    connectionStatus.classList.add("status-disconnected");
  } else {
    connectionStatus.classList.add("status-connecting");
  }
}

// Connect to WebSocket server
function connectWebSocket() {
  updateConnectionStatus("Connecting...");

  // Create WebSocket connection
  socket = new WebSocket("ws://localhost:8080");

  // Connection opened
  socket.addEventListener("open", function (event) {
    updateConnectionStatus("Connected");

    // Send a system message that user has joined
    const joinMessage = {
      type: "system",
      username: currentUser,
      text: `${currentUser} has joined the chat`,
      timestamp: new Date().toISOString(),
    };

    socket.send(JSON.stringify(joinMessage));
  });

  // Listen for messages
  socket.addEventListener("message", function (event) {
    try {
      // First message from server might be "something" (from your backend)
      if (event.data === "something") {
        return;
      }

      const message = JSON.parse(event.data);
      displayMessage(message);
    } catch (error) {
      console.error("Error parsing message:", error);
      // If not JSON, display as system message
      const systemMessage = {
        type: "system",
        text: event.data,
        timestamp: new Date().toISOString(),
      };
      displayMessage(systemMessage);
    }
  });

  // Connection closed
  socket.addEventListener("close", function (event) {
    updateConnectionStatus("Disconnected");

    // Try to reconnect after a delay
    setTimeout(connectWebSocket, 5000);

    // Display system message
    const systemMessage = {
      type: "system",
      text: "Disconnected from server. Trying to reconnect...",
      timestamp: new Date().toISOString(),
    };
    displayMessage(systemMessage);
  });

  // Connection error
  socket.addEventListener("error", function (event) {
    console.error("WebSocket error:", event);
    updateConnectionStatus("Error");
  });
}

// Add message to the UI
function displayMessage(message) {
  const messageDiv = document.createElement("div");
  const timestamp = message.timestamp
    ? new Date(message.timestamp)
    : new Date();

  if (message.type === "system") {
    messageDiv.className = "message message-system";
    messageDiv.innerHTML = `
      <div>${message.text}</div>
      <div class="message-time">${formatTime(timestamp)}</div>
    `;
  } else {
    const isCurrentUser = message.username === currentUser;
    messageDiv.className = `message ${
      isCurrentUser ? "message-user" : "message-other"
    }`;
    messageDiv.innerHTML = `
      ${
        isCurrentUser
          ? ""
          : `<div class="message-sender">${message.username}</div>`
      }
      <div>${message.text}</div>
      <div class="message-time">${formatTime(timestamp)}</div>
    `;
  }

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Scroll to the bottom of the messages container
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Login handler
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username;
    usernameDisplay.textContent = username;

    // Switch from login to chat screen
    loginScreen.classList.add("d-none");
    chatScreen.classList.remove("d-none");

    // Display welcome message
    const welcomeMessage = {
      type: "system",
      text: "Welcome to the chat room!",
      timestamp: new Date().toISOString(),
    };
    displayMessage(welcomeMessage);

    // Connect to WebSocket server
    connectWebSocket();

    // Focus on message input
    messageInput.focus();
  }
});

// Send message handler
messageForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (text && socket && socket.readyState === WebSocket.OPEN) {
    const newMessage = {
      type: "chat",
      username: currentUser,
      text: text,
      timestamp: new Date().toISOString(),
    };

    // Send message to server
    socket.send(JSON.stringify(newMessage));

    // Clear input
    messageInput.value = "";
    messageInput.focus();
  }
});

// Handle page unload
window.addEventListener("beforeunload", function () {
  if (socket && socket.readyState === WebSocket.OPEN) {
    // Send a message that user has left
    const leaveMessage = {
      type: "system",
      username: currentUser,
      text: `${currentUser} has left the chat`,
      timestamp: new Date().toISOString(),
    };

    socket.send(JSON.stringify(leaveMessage));
  }
});
