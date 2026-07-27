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

    setupChatbotDrag(container, toggleButton, header);

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

    function setupChatbotDrag(wrapper, toggle, dragHeader) {
        let isDragging = false;
        let dragMoved = false;
        let suppressToggleClick = false;
        let offsetX = 0;
        let offsetY = 0;

        function applyPosition(x, y) {
            const pad = 10;
            const width = wrapper.offsetWidth || 70;
            const height = isChatOpen ? Math.max(toggle.offsetHeight, chatWindow.offsetHeight) : toggle.offsetHeight;
            const clampedX = Math.max(pad, Math.min(x, window.innerWidth - width - pad));
            const clampedY = Math.max(pad, Math.min(y, window.innerHeight - height - pad));
            wrapper.classList.add('positioned');
            wrapper.style.left = `${clampedX}px`;
            wrapper.style.top = `${clampedY}px`;
            return { x: clampedX, y: clampedY };
        }

        function startDrag(clientX, clientY, target) {
            if (target.closest('#chatbot-close') || target.closest('#chatbot-input-area')) return;
            isDragging = true;
            dragMoved = false;
            const rect = wrapper.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
        }

        function moveDrag(clientX, clientY) {
            if (!isDragging) return;
            dragMoved = true;
            applyPosition(clientX - offsetX, clientY - offsetY);
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            if (dragMoved) {
                suppressToggleClick = true;
                setTimeout(() => { suppressToggleClick = false; }, 50);
            }
        }

        toggle.addEventListener('click', (e) => {
            if (suppressToggleClick) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }, true);

        [toggle, dragHeader].forEach((handle) => {
            handle.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY, e.target));
            handle.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                startDrag(e.touches[0].clientX, e.touches[0].clientY, e.target);
                e.preventDefault();
            }, { passive: false });
        });

        document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('touchend', endDrag);
    }
});