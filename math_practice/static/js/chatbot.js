/**
 * Learning Center Chatbot Widget.
 *
 * Implements an interactive AI support chatbot for students with FAQ fallback
 * matching, Gemini language model completions, dragging capabilities, and responsive UI.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create Chatbot Container.
    const container = document.createElement('div');
    container.id = 'chatbot-container';
    
    // Toggle Button.
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chatbot-toggle';
    toggleButton.innerHTML = '&#128172;'; // Chat bubble icon.
    toggleButton.title = 'Ask a question';
    toggleButton.setAttribute('aria-label', 'Open learning helper');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'chatbot-window');
    
    // Chat Window.
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.style.display = 'none';
    chatWindow.setAttribute('role', 'region');
    chatWindow.setAttribute('aria-label', 'Learning helper chat');
    
    // Header.
    const header = document.createElement('div');
    header.id = 'chatbot-header';
    header.innerHTML = '<span>Learning Helper</span><button type="button" id="chatbot-close" aria-label="Close learning helper">&times;</button>';
    
    // Messages.
    const messages = document.createElement('div');
    messages.id = 'chatbot-messages';
    messages.setAttribute('role', 'log');
    messages.setAttribute('aria-live', 'polite');
    messages.setAttribute('aria-label', 'Chat messages');
    messages.tabIndex = 0;
    
    // Input Area.
    const inputArea = document.createElement('div');
    inputArea.id = 'chatbot-input-area';
    
    const inputField = document.createElement('input');
    inputField.id = 'chatbot-input';
    inputField.type = 'text';
    inputField.placeholder = 'Ask a question...';
    inputField.setAttribute('aria-label', 'Your question');
    
    const sendButton = document.createElement('button');
    sendButton.id = 'chatbot-send';
    sendButton.innerText = 'Send';
    
    // Assemble DOM elements.
    inputArea.appendChild(inputField);
    inputArea.appendChild(sendButton);
    
    chatWindow.appendChild(header);
    chatWindow.appendChild(messages);
    chatWindow.appendChild(inputArea);
    
    container.appendChild(chatWindow);
    container.appendChild(toggleButton);
    
    document.body.appendChild(container);
    container.addEventListener('click', (event) => event.stopPropagation());
    container.addEventListener('keydown', (event) => event.stopPropagation());
    
    // State management.
    let isChatOpen = false;
    let isSending = false;
    
    // Add initial bot message.
    appendMessage('bot', 'Hi! I can help you find games, navigate schoolwork, or get a learning hint. What would you like to try?\n\nPlease keep personal information private, and double-check my answers.');
    
    // Event listeners.
    const ensurePosition = setupChatbotDrag(container, toggleButton, header);

    toggleButton.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        chatWindow.style.display = isChatOpen ? 'flex' : 'none';
        toggleButton.setAttribute('aria-expanded', String(isChatOpen));
        toggleButton.setAttribute('aria-label', isChatOpen ? 'Close learning helper' : 'Open learning helper');
        ensurePosition();
        if (isChatOpen) {
            inputField.focus();
        }
    });
    
    document.getElementById('chatbot-close').addEventListener('click', () => {
        isChatOpen = false;
        chatWindow.style.display = 'none';
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-label', 'Open learning helper');
        ensurePosition();
        toggleButton.focus();
    });
    
    sendButton.addEventListener('click', () => {
        sendMessage();
    });
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
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
        msgElement.textContent = text;
        messages.appendChild(msgElement);
        if (sender === 'bot') {
            messages.scrollTop += msgElement.getBoundingClientRect().top - messages.getBoundingClientRect().top - 10;
        } else {
            messages.scrollTop = messages.scrollHeight;
        }
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
                appendMessage('bot', (data.source === 'faq-fallback' ? 'Offline help:\n' : '') + data.answer);
            } else {
                appendMessage('bot', data.error || 'Sorry, I ran into a problem answering that. Please try again.');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            pendingMessage.remove();
            appendMessage('bot', "I couldn't connect right now. Please check your connection and try again.");
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
        let drag = null;
        let dragMoved = false;
        let suppressToggleClick = false;

        function applyPosition(x, y) {
            const pad = 10;
            const width = wrapper.offsetWidth;
            const height = wrapper.offsetHeight;
            const clampedX = Math.max(pad, Math.min(x, window.innerWidth - width - pad));
            const clampedY = Math.max(pad, Math.min(y, window.innerHeight - height - pad));
            wrapper.classList.add('positioned');
            wrapper.style.left = `${clampedX}px`;
            wrapper.style.top = `${clampedY}px`;
            return { x: clampedX, y: clampedY };
        }

        function startDrag(event) {
            if (event.target.closest('#chatbot-close') || event.button !== 0) return;
            dragMoved = false;
            const rect = wrapper.getBoundingClientRect();
            drag = {
                id: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };
        }

        function moveDrag(event) {
            if (!drag || drag.id !== event.pointerId) return;
            if (!dragMoved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
            dragMoved = true;
            applyPosition(event.clientX - drag.offsetX, event.clientY - drag.offsetY);
        }

        function endDrag(event) {
            if (!drag || drag.id !== event.pointerId) return;
            drag = null;
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
            handle.addEventListener('pointerdown', startDrag);
        });

        document.addEventListener('pointermove', moveDrag);
        document.addEventListener('pointerup', endDrag);
        document.addEventListener('pointercancel', endDrag);

        function ensurePosition() {
            if (!wrapper.classList.contains('positioned')) return;
            const rect = wrapper.getBoundingClientRect();
            applyPosition(rect.left, rect.top);
        }
        window.addEventListener('resize', ensurePosition);
        return ensurePosition;
    }
});