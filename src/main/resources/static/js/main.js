var PocSpringWebSockets = PocSpringWebSockets || {};

PocSpringWebSockets.Managing = (function () {
    function Managing() {
        this.stompClient = null;
        this.username = null;
    }

    Managing.prototype.start = function () {
        registerChatEvents.call(this);
    }

    function registerChatEvents() {
        this.usernamePage = document.querySelector('#username-page');
        this.chatPage = document.querySelector('#chat-page');
        this.usernameForm = document.querySelector('#usernameForm');
        this.usernameInput = $(this.usernameForm).find('button');
        this.messageForm = document.querySelector('#messageForm');
        this.messageSendButton = $(this.messageForm).find('button');
        this.messageInput = document.querySelector('#message');
        this.messageArea = document.querySelector('#messageArea');
        this.connectingElement = document.querySelector('.connecting');
        this.usernameInput.on('click', connect.bind(this))
        this.messageSendButton.on('click', send.bind(this))
        this.colors = [
            '#2196F3', '#32c787', '#00BCD4', '#ff5652',
            '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
        ];
    }

    function connect(e) {
        e.preventDefault();
        this.username = document.querySelector('#name').value.trim();

        if (this.username) {
            let socket = new SockJS('/pocspringwebsocket');
            this.usernamePage.classList.add('hidden');
            this.chatPage.classList.remove('hidden');
            this.stompClient = Stomp.over(socket);
            this.stompClient.connect({}, onConnected.bind(this), onError.bind(this));
        }
    }

    function onConnected() {
        // Subscrever para escutar
        this.stompClient.subscribe('/topic/public', onMessageReceived.bind(this));

        // Enviar o usuário para o servidor
        this.stompClient.send("/app/chat.register",
            {},
            JSON.stringify({
                sender: this.username, type: 'JOIN'
            })
        )

        this.connectingElement.classList.add('hidden');
    }

    function onError(error) {
        this.connectingElement.textContent = 'Não possível conectar com o WebSocket do servidor. Tente novamente mais tarde.';
        this.connectingElement.style.color = 'red';
    }

    function send(event) {
        event.preventDefault();
        let messageContent = this.messageInput.value.trim();

        if (messageContent && this.stompClient) {
            let chatMessage = {
                sender: this.username,
                content: messageContent,
                type: 'CHAT'
            };

            this.stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
            this.messageInput.value = "";
        }
    }

    function onMessageReceived(payload) {
        var message = JSON.parse(payload.body);

        let messageElement = document.createElement('li');

        if (message.type === 'JOIN') {
            messageElement.classList.add('event-message');
            message.content = message.sender + ' joined!';
        } else if (message.type === 'LEAVE') {
            messageElement.classList.add('event-message');
            message.content = message.sender + ' left!';
        } else {
            messageElement.classList.add('chat-message');

            let avatarElement = document.createElement('i');
            let avatarText = document.createTextNode(message.sender[0]);
            avatarElement.appendChild(avatarText);
            avatarElement.style['background-color'] = getAvatarColor.call(this, message.sender);

            messageElement.appendChild(avatarElement);

            let usernameElement = document.createElement('span');
            let usernameText = document.createTextNode(message.sender);
            usernameElement.appendChild(usernameText);
            messageElement.appendChild(usernameElement);
        }

        let textElement = document.createElement('p');
        let messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        this.messageArea.appendChild(messageElement);
        this.messageArea.scrollTop = messageArea.scrollHeight;
    }

    function getAvatarColor(messageSender) {
        let hash = 0;
        for (let i = 0; i < messageSender.length; i++) {
            hash = 31 * hash + messageSender.charCodeAt(i);
        }

        let index = Math.abs(hash % this.colors.length);
        return this.colors[index];
    }

    return Managing;
}());

$(function () {
    const managing = new PocSpringWebSockets.Managing();
    managing.start();
})