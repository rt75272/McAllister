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
                "How do I play?",
                "How does scoring work?",
                "What games do you have?",
                "How do I reset my score?",
                "Hello!",
                "Hi!",
                "Hey!",
                "Who made this?",
                "Why was this made?",
                "I found a bug",
                "Something is not working",
                "I am stuck",
                "Can you help me?",
                "Bye!",
                "Thank you!",
                "What is the difficulty?",
                "What levels are there?",
                "Tell me about easy mode.",
                "Tell me about medium mode.",
                "Tell me about hard mode.",
                "What is Context Clues?",
                "What is Sentence Fixer?",
                "What is Word Match?",
                "What is Verb Detective?",
                "What is Math Blast?",
                "What is Math Race?",
                "What is Math Memory?",
                "What is Fraction Master?",
                "What is Decimal Master?",
                "What is Plot Points?",
                "What is Exponent Power?",
                "What is Exponent World?",
                "What is Exponent Rules?",
                "What is addition?",
                "What is subtraction?",
                "What is multiplication?",
                "What is division?",
                "What is a fraction?",
                "What is a decimal?",
                "What is an exponent?",
                "What is a graph?",
                "What is geometry?",
                "What is algebra?",
                "What is a prime number?",
                "What is a composite number?",
                "What is a factor?",
                "What is a multiple?",
                "What is a numerator?",
                "What is a denominator?",
                "What is a percentage?",
                "What is a ratio?",
                "What is a proportion?",
                "What is an integer?",
                "What is an even number?",
                "What is an odd number?",
                "What is absolute value?",
                "What is the x-axis?",
                "What is the y-axis?",
                "What is the origin?",
                "What is area?",
                "What is perimeter?",
                "What is volume?",
                "What is pi?",
                "What is a circle?",
                "What is a triangle?",
                "What is a square?",
                "What is a rectangle?",
                "What is a polygon?",
                "What is a noun?",
                "What is a verb?",
                "What is an adjective?",
                "What is an adverb?",
                "What is a synonym?",
                "What is an antonym?",
                "What is punctuation?",
                "Explain capitalization",
                "What is a pronoun?",
                "What is a preposition?",
                "What is a conjunction?",
                "What is an interjection?",
                "What is a metaphor?",
                "What is a simile?",
                "What is personification?",
                "What is hyperbole?",
                "What is an idiom?",
                "What is alliteration?",
                "What is onomatopoeia?",
                "What is a theme in a story?",
                "What is a story plot?",
                "What is a setting?",
                "What is a character?",
                "What is a prefix?",
                "What is a suffix?",
                "What is a root word?",
                "What is a homophone?",
                "What is a vowel?",
                "What is a consonant?",
                "Tell me a joke",
                "Tell me something funny",
                "Do you like Coke?",
                "What is your favorite color?",
                "What is your favorite food?",
                "What is your favorite movie?",
                "What is your favorite book?",
                "What is your favorite game?",
                "What is your favorite animal?",
                "Do you like music?",
                "Are you a robot?",
                "What is AI?",
                "How is the weather?",
                "What is your name?",
                "How old are you?",
                "Good morning!",
                "Good afternoon!",
                "Good evening!",
                "Good night!",
                "How are you doing?",
                "Do you sleep?",
                "Do you dream?",
                "Do you have friends?",
                "I am feeling sad.",
                "I am feeling happy!",
                "I am angry!",
                "I am bored.",
                "Tell me a riddle",
                "Tell me a secret",
                "Do you have a pet?",
                "Can you dance?",
                "Can you sing?",
                "Tell me a random fact",
                "Did you know?",
                "Tell me a space fact",
                "Tell me an ocean fact",
                "Tell me an animal fact",
                "Tell me a math fact",
                "Tell me a science fact",
                "Tell me a history fact",
                "Tell me a dinosaur fact",
                "Tell me a human body fact",
                "Tell me a fact about Earth",
                "Tell me a language fact",
                "What is the longest word?",
                "How do I get to home?",
                "What is ELA?",
                "What is math?",
                "Tell me about this site.",
                "How do I contact you?",
                "Where is the menu?",
                "I am bad at this",
                "I am stupid",
                "I won!",
                "I lost",
                "This is too easy",
                "This is too hard",
                "I give up",
                "You are awesome!",
                "This is cool!"
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