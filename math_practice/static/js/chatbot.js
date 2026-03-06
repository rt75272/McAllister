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
    let suggestionTimer = null;
    
    // Add initial bot message
    appendMessage('bot', 'Hi there! I am the chatbot for commonly asked questions. Ask me questions such as "How do I play?", "What games do you have?", or "How do I reset my score?".');
    
    // Event listeners
    toggleButton.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        chatWindow.style.display = isChatOpen ? 'flex' : 'none';
        if (isChatOpen) {
            inputField.focus();
            resetSuggestionTimer();
        } else {
            clearTimeout(suggestionTimer);
        }
    });
    
    document.getElementById('chatbot-close').addEventListener('click', () => {
        isChatOpen = false;
        chatWindow.style.display = 'none';
        clearTimeout(suggestionTimer);
    });
    
    sendButton.addEventListener('click', () => {
        sendMessage();
        resetSuggestionTimer();
    });
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
            resetSuggestionTimer();
        }
    });
    
    inputField.addEventListener('input', resetSuggestionTimer);
    
    function resetSuggestionTimer() {
        clearTimeout(suggestionTimer);
        if (isChatOpen) {
            // Wait 2.5 seconds of inactivity before showing suggestions
            suggestionTimer = setTimeout(showSuggestions, 2500);
        }
    }
    
    function showSuggestions() {
        // Only show if the last message was from the bot and there are no suggestions currently
        const lastMessage = messages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('bot-message') && !document.querySelector('.chatbot-suggestions')) {
            const suggestions = [
                "Hi!",
                "Hello!",
                "Hey!",
                "Missing class",
                "Find class",
                "Where is my work",
                "Finding work",
                "Module",
                "Engageli",
                "Live class",
                "Meeting",
                "Link",
                "Join",
                "Online class",
                "Empty calendar",
                "Not load",
                "Broken",
                "Can't get into class",
                "Loading forever",
                "Technical difficulties",
                "Late",
                "Due date",
                "Turn in",
                "Submit",
                "Upload",
                "Hand in",
                "Grades",
                "How am I doing",
                "Score",
                "Report card",
                "Am I failing",
                "Star360",
                "Renaissance",
                "Testing",
                "Reading test",
                "Math test",
                "ID",
                "Student number",
                "Email",
                "Username",
                "Newsletter",
                "Contact",
                "Talk to my teacher",
                "I'm confused",
                "Tech support",
                "Help desk",
                "Phone number",
                "Break",
                "Holiday",
                "No school",
                "Spring break",
                "Easter",
                "When is school over",
                "Last day",
                "Days off",
                "Canvas down",
                "Pacing",
                "Done for the day",
                "Address",
                "Phone",
                "Street",
                "Password",
                "Calculate",
                "Plus",
                "Equals",
                "Math help",
                "Help"
            ];
            
            // Pick 2 random suggestions
            const shuffled = suggestions.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 2);
            
            const suggestionContainer = document.createElement('div');
            suggestionContainer.classList.add('chatbot-suggestions');
            
            selected.forEach(text => {
                const btn = document.createElement('button');
                btn.classList.add('chatbot-suggestion-btn');
                btn.innerText = text;
                btn.addEventListener('click', () => {
                    inputField.value = text;
                    sendMessage();
                    suggestionContainer.remove();
                    resetSuggestionTimer();
                });
                suggestionContainer.appendChild(btn);
            });
            
            messages.appendChild(suggestionContainer);
            messages.scrollTop = messages.scrollHeight;
        }
    }

    function appendMessage(sender, text) {
        // Remove existing suggestions if any
        const existingSuggestions = document.querySelector('.chatbot-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

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
        if (!text) return;
        
        appendMessage('user', text);
        inputField.value = '';
        
        try {
            const response = await fetch('/ask-chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            if (data.answer) {
                appendMessage('bot', data.answer);
            } else {
                appendMessage('bot', 'Sorry, I encounted an error processing your query.');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            appendMessage('bot', 'Sorry, I am offline right now.');
        }
    }
});