document.addEventListener('DOMContentLoaded', function() {
    // Create Chatbot Container
    const container = document.createElement('div');
    container.id = 'chatbot-container';
    
    // Toggle Button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chatbot-toggle';
    toggleButton.innerHTML = '&#128172;'; // Chat bubble icon
    toggleButton.title = 'Ask a question';
    
    // Chat Window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.style.display = 'none';
    
    // Header
    const header = document.createElement('div');
    header.id = 'chatbot-header';
    header.innerHTML = '<span>Ask Common Questions</span><span id="chatbot-close">&times;</span>';
    
    // Messages
    const messages = document.createElement('div');
    messages.id = 'chatbot-messages';
    
    // Input Area
    const inputArea = document.createElement('div');
    inputArea.id = 'chatbot-input-area';
    
    const inputField = document.createElement('input');
    inputField.id = 'chatbot-input';
    inputField.type = 'text';
    inputField.placeholder = 'Ask a question...';
    
    const sendButton = document.createElement('button');
    sendButton.id = 'chatbot-send';
    sendButton.innerText = 'Send';
    
    // Assemble
    inputArea.appendChild(inputField);
    inputArea.appendChild(sendButton);
    
    chatWindow.appendChild(header);
    chatWindow.appendChild(messages);
    chatWindow.appendChild(inputArea);
    
    container.appendChild(chatWindow);
    container.appendChild(toggleButton);
    
    document.body.appendChild(container);
    
    // State
    let isChatOpen = false;
    let isSending = false;
    
    // Add initial bot message
    appendMessage('bot', 'Hi there. I can help with this website, school navigation questions, and short math or ELA hints. Try asking things like "How do I play this game?", "Where do I find my work?", or "Can you give me a hint?".');
    
    // Event listeners
    toggleButton.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        chatWindow.style.display = isChatOpen ? 'flex' : 'none';
        if (isChatOpen) {
            inputField.focus();
        }
    });
    
    document.getElementById('chatbot-close').addEventListener('click', () => {
        isChatOpen = false;
        chatWindow.style.display = 'none';
    });
    
    sendButton.addEventListener('click', () => {
        sendMessage();
    });
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function appendMessage(sender, text) {
        const msgElement = document.createElement('div');
        msgElement.classList.add('chatbot-message');
        if (sender === 'user') {
            msgElement.classList.add('user-message');
        } else {
            msgElement.classList.add('bot-message');
        }
        msgElement.innerText = text;
        messages.appendChild(msgElement);
        messages.scrollTop = messages.scrollHeight;
    }
    
    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text || isSending) return;
        
        appendMessage('user', text);
        inputField.value = '';
        setSendingState(true);
        appendMessage('bot', 'Thinking...');
        const pendingMessage = messages.lastElementChild;
        
        try {
            const response = await fetch('/ask-chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    pagePath: window.location.pathname
                })
            });
            const data = await response.json();
            pendingMessage.remove();
            if (response.ok && data.answer) {
                appendMessage('bot', data.answer);
            } else {
                appendMessage('bot', 'Sorry, I ran into a problem answering that. Please try again.');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            pendingMessage.remove();
            appendMessage('bot', 'Sorry, I am offline right now.');
        } finally {
            setSendingState(false);
        }
    }

    function setSendingState(sending) {
        isSending = sending;
        sendButton.disabled = sending;
        inputField.disabled = sending;
        sendButton.innerText = sending ? '...' : 'Send';
    }
});