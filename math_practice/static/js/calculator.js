/* Calculator functionality for all pages */

let calculatorDisplay = '';
let isNewCalculation = false;

function createCalculatorHTML() {
    const calculatorHTML = `
        <!-- Calculator Toggle Button -->
        <button class="calculator-toggle" onclick="toggleCalculator()" title="Calculator" id="calc-toggle-btn">
            🧮
        </button>

        <!-- Calculator Popup -->
        <div class="calculator-popup" id="calculatorPopup">
            <div class="global-calculator-container">
                <div class="global-calculator-header">
                    <h3 class="global-calculator-title">Calculator</h3>
                    <button class="global-calculator-close" onclick="toggleCalculator()">×</button>
                </div>
                
                <input type="text" class="global-calculator-display" id="calcDisplay" readonly value="0">
                
                <div class="global-calculator-buttons">
                    <button class="global-calc-btn clear" onclick="clearCalculator()">C</button>
                    <button class="global-calc-btn clear" onclick="clearEntry()">CE</button>
                    <button class="global-calc-btn operator" onclick="deleteLast()">⌫</button>
                    <button class="global-calc-btn operator" onclick="appendOperator('/')" title="Divide">÷</button>
                    
                    <button class="global-calc-btn number" onclick="appendNumber('7')">7</button>
                    <button class="global-calc-btn number" onclick="appendNumber('8')">8</button>
                    <button class="global-calc-btn number" onclick="appendNumber('9')">9</button>
                    <button class="global-calc-btn operator" onclick="appendOperator('*')" title="Multiply">×</button>
                    
                    <button class="global-calc-btn number" onclick="appendNumber('4')">4</button>
                    <button class="global-calc-btn number" onclick="appendNumber('5')">5</button>
                    <button class="global-calc-btn number" onclick="appendNumber('6')">6</button>
                    <button class="global-calc-btn operator" onclick="appendOperator('-')" title="Subtract">−</button>
                    
                    <button class="global-calc-btn number" onclick="appendNumber('1')">1</button>
                    <button class="global-calc-btn number" onclick="appendNumber('2')">2</button>
                    <button class="global-calc-btn number" onclick="appendNumber('3')">3</button>
                    <button class="global-calc-btn operator" onclick="appendOperator('+')" title="Add">+</button>
                    
                    <button class="global-calc-btn number" onclick="appendNumber('0')">0</button>
                    <button class="global-calc-btn operator" onclick="appendOperator('^')" title="Power">^</button>
                    <button class="global-calc-btn number" onclick="appendDecimal()">.</button>
                    <button class="global-calc-btn equals" onclick="calculate()">=</button>
                </div>
            </div>
        </div>
    `;
    
    // Add calculator HTML to body
    document.body.insertAdjacentHTML('afterbegin', calculatorHTML);
    
    // Setup drag functionality after HTML is added
    setTimeout(() => {
        setupCalculatorDrag();
    }, 0);
}

function toggleCalculator() {
    const popup = document.getElementById('calculatorPopup');
    popup.classList.toggle('show');
    
    // Focus on the display when opening
    if (popup.classList.contains('show')) {
        document.getElementById('calcDisplay').focus();
    }
}

function updateDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        display.value = calculatorDisplay || '0';
    }
}

function appendNumber(number) {
    if (isNewCalculation) {
        calculatorDisplay = '';
        isNewCalculation = false;
    }
    
    if (calculatorDisplay === '0') {
        calculatorDisplay = number;
    } else {
        calculatorDisplay += number;
    }
    updateDisplay();
}

function appendOperator(operator) {
    if (isNewCalculation) {
        isNewCalculation = false;
    }
    
    // Replace display symbols with calculation symbols
    let calcOperator = operator;
    if (operator === '×') calcOperator = '*';
    if (operator === '÷') calcOperator = '/';
    if (operator === '−') calcOperator = '-';
    
    // Don't add operator if display is empty or ends with an operator
    if (calculatorDisplay === '' || /[+\-*/^]$/.test(calculatorDisplay)) {
        return;
    }
    
    calculatorDisplay += calcOperator;
    updateDisplay();
}

function appendDecimal() {
    if (isNewCalculation) {
        calculatorDisplay = '0';
        isNewCalculation = false;
    }
    
    // Get the current number (after the last operator)
    const parts = calculatorDisplay.split(/[+\-*/^]/);
    const currentNumber = parts[parts.length - 1];
    
    // Only add decimal if current number doesn't already have one
    if (!currentNumber.includes('.')) {
        if (calculatorDisplay === '' || /[+\-*/^]$/.test(calculatorDisplay)) {
            calculatorDisplay += '0.';
        } else {
            calculatorDisplay += '.';
        }
        updateDisplay();
    }
}

function deleteLast() {
    if (calculatorDisplay.length > 0) {
        calculatorDisplay = calculatorDisplay.slice(0, -1);
        updateDisplay();
    }
}

function clearEntry() {
    calculatorDisplay = '';
    updateDisplay();
}

function clearCalculator() {
    calculatorDisplay = '';
    isNewCalculation = false;
    updateDisplay();
}

function calculate() {
    if (calculatorDisplay === '') return;
    
    try {
        // Replace display symbols with JavaScript operators
        let expression = calculatorDisplay
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/\^/g, '**');
        
        // Evaluate the expression
        let result = eval(expression);
        
        // Handle division by zero and other edge cases
        if (!isFinite(result)) {
            calculatorDisplay = 'Error';
        } else {
            // Round to avoid floating point precision issues
            result = Math.round(result * 1000000000) / 1000000000;
            calculatorDisplay = result.toString();
        }
        
        isNewCalculation = true;
        updateDisplay();
    } catch (error) {
        calculatorDisplay = 'Error';
        isNewCalculation = true;
        updateDisplay();
    }
}

function setupCalculatorEvents() {
    // Keyboard support
    document.addEventListener('keydown', function(event) {
        const popup = document.getElementById('calculatorPopup');
        if (!popup || !popup.classList.contains('show')) return;
        
        const key = event.key;
        
        if (key >= '0' && key <= '9') {
            appendNumber(key);
            event.preventDefault();
        } else if (key === '+' || key === '-') {
            appendOperator(key);
            event.preventDefault();
        } else if (key === '*') {
            appendOperator('*');
            event.preventDefault();
        } else if (key === '/' || key === '^') {
            appendOperator(key);
            event.preventDefault();
        } else if (key === '.') {
            appendDecimal();
            event.preventDefault();
        } else if (key === 'Enter' || key === '=') {
            calculate();
            event.preventDefault();
        } else if (key === 'Backspace') {
            deleteLast();
            event.preventDefault();
        } else if (key === 'Delete' || key === 'c' || key === 'C') {
            clearCalculator();
            event.preventDefault();
        } else if (key === 'Escape') {
            toggleCalculator();
            event.preventDefault();
        }
    });

    // Close calculator when clicking outside
    const popup = document.getElementById('calculatorPopup');
    if (popup) {
        popup.addEventListener('click', function(event) {
            if (event.target === this) {
                toggleCalculator();
            }
        });
    }
    
    // Setup drag functionality
    setupCalculatorDrag();
}

function setupCalculatorDrag() {
    // Wait a bit more to ensure DOM is ready
    setTimeout(() => {
        const calculatorContainer = document.querySelector('.global-calculator-container');
        const calculatorHeader = document.querySelector('.global-calculator-header');
        
        console.log('Setting up calculator drag...', { calculatorContainer, calculatorHeader });
        
        if (!calculatorContainer || !calculatorHeader) {
            console.log('Calculator elements not found, retrying...');
            // Retry after another delay
            setTimeout(setupCalculatorDrag, 500);
            return;
        }
        
        // Remove any existing event listeners to prevent duplicates
        calculatorHeader.removeEventListener('mousedown', startDrag);
        calculatorHeader.removeEventListener('touchstart', startDragTouch);
        
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        // Mouse events
        calculatorHeader.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        // Touch events for mobile
        calculatorHeader.addEventListener('touchstart', startDragTouch, { passive: false });
        document.addEventListener('touchmove', dragTouch, { passive: false });
        document.addEventListener('touchend', stopDrag);
        
        function startDrag(e) {
            console.log('Starting drag...');
            isDragging = true;
            calculatorContainer.classList.add('dragging');
            
            const rect = calculatorContainer.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            e.preventDefault();
            e.stopPropagation();
        }
        
        function startDragTouch(e) {
            if (e.touches.length === 1) {
                console.log('Starting touch drag...');
                const touch = e.touches[0];
                isDragging = true;
                calculatorContainer.classList.add('dragging');
                
                const rect = calculatorContainer.getBoundingClientRect();
                dragOffset.x = touch.clientX - rect.left;
                dragOffset.y = touch.clientY - rect.top;
                
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            
            moveCalculator(x, y);
            e.preventDefault();
        }
        
        function dragTouch(e) {
            if (!isDragging || e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            const x = touch.clientX - dragOffset.x;
            const y = touch.clientY - dragOffset.y;
            
            moveCalculator(x, y);
            e.preventDefault();
        }
        
        function moveCalculator(x, y) {
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const calcWidth = calculatorContainer.offsetWidth;
            const calcHeight = calculatorContainer.offsetHeight;
            
            // Constrain to viewport boundaries with some padding
            const padding = 10;
            const constrainedX = Math.max(padding, Math.min(x, viewportWidth - calcWidth - padding));
            const constrainedY = Math.max(padding, Math.min(y, viewportHeight - calcHeight - padding));
            
            // Add positioned class to override CSS positioning
            calculatorContainer.classList.add('positioned');
            
            // Apply the position
            calculatorContainer.style.left = constrainedX + 'px';
            calculatorContainer.style.top = constrainedY + 'px';
            calculatorContainer.style.right = 'auto';
            calculatorContainer.style.bottom = 'auto';
            
            console.log('Moving calculator to:', { x: constrainedX, y: constrainedY });
            
            // Save position to localStorage
            localStorage.setItem('calculatorPosition', JSON.stringify({
                x: constrainedX,
                y: constrainedY
            }));
        }
        
        function stopDrag() {
            if (isDragging) {
                console.log('Stopping drag...');
                isDragging = false;
                calculatorContainer.classList.remove('dragging');
            }
        }
        
        // Restore saved position
        restoreCalculatorPosition();
        
        console.log('Calculator drag setup complete!');
    }, 50);
}

function restoreCalculatorPosition() {
    const calculatorContainer = document.querySelector('.calculator-container');
    if (!calculatorContainer) {
        console.log('Calculator container not found for position restoration');
        return;
    }
    
    const savedPosition = localStorage.getItem('calculatorPosition');
    if (savedPosition) {
        try {
            const position = JSON.parse(savedPosition);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const calcWidth = calculatorContainer.offsetWidth;
            const calcHeight = calculatorContainer.offsetHeight;
            
            // Ensure position is still within viewport (in case screen size changed)
            const padding = 10;
            const constrainedX = Math.max(padding, Math.min(position.x, viewportWidth - calcWidth - padding));
            const constrainedY = Math.max(padding, Math.min(position.y, viewportHeight - calcHeight - padding));
            
            // Add positioned class to override CSS positioning
            calculatorContainer.classList.add('positioned');
            
            calculatorContainer.style.left = constrainedX + 'px';
            calculatorContainer.style.top = constrainedY + 'px';
            calculatorContainer.style.right = 'auto';
            calculatorContainer.style.bottom = 'auto';
            
            console.log('Calculator position restored to:', { x: constrainedX, y: constrainedY });
        } catch (e) {
            // If parsing fails, use default position
            console.log('Failed to restore calculator position:', e);
        }
    } else {
        console.log('No saved calculator position found');
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only create calculator if it doesn't already exist
    if (!document.getElementById('calculatorPopup')) {
        createCalculatorHTML();
        setupCalculatorEvents();
        updateDisplay();
    } else {
        // If calculator already exists (from base template), just set up events
        setupCalculatorEvents();
        updateDisplay();
    }
    
    // Initialize operator key
    initializeOperatorKey();
    
    // Always setup drag functionality regardless of how calculator was created
    setTimeout(() => {
        setupCalculatorDrag();
    }, 100);
});

// Debug function to test calculator drag
window.testCalculatorDrag = function() {
    const calculatorContainer = document.querySelector('.global-calculator-container');
    if (calculatorContainer) {
        console.log('Calculator found, testing movement...');
        calculatorContainer.classList.add('positioned');
        calculatorContainer.style.left = '100px';
        calculatorContainer.style.top = '100px';
        calculatorContainer.style.right = 'auto';
        calculatorContainer.style.bottom = 'auto';
        console.log('Calculator should have moved to 100,100');
    } else {
        console.log('Calculator not found!');
    }
};

// Debug function to reset calculator position  
window.resetCalculatorPosition = function() {
    localStorage.removeItem('calculatorPosition');
    const calculatorContainer = document.querySelector('.global-calculator-container');
    if (calculatorContainer) {
        calculatorContainer.classList.remove('positioned');
        calculatorContainer.style.left = '';
        calculatorContainer.style.top = '';
        calculatorContainer.style.right = '';
        calculatorContainer.style.bottom = '';
        console.log('Calculator position reset');
    }
};

// Operator Key Functions
function toggleOperatorKey() {
    const operatorKey = document.getElementById('operatorKey');
    if (operatorKey) {
        operatorKey.classList.toggle('hidden');
        
        // Save preference to localStorage
        const isHidden = operatorKey.classList.contains('hidden');
        localStorage.setItem('operatorKeyHidden', isHidden);
    }
}

function initializeOperatorKey() {
    // Restore operator key visibility from localStorage
    const operatorKey = document.getElementById('operatorKey');
    if (operatorKey) {
        const isHidden = localStorage.getItem('operatorKeyHidden') === 'true';
        if (isHidden) {
            operatorKey.classList.add('hidden');
        }
    }
}