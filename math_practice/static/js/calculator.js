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
    
    // Setup drag functionality
    setupCalculatorDrag();
}

/* ── Smooth drag-to-move for the calculator panel ── */
function setupCalculatorDrag() {
    const container = document.querySelector('.global-calculator-container');
    const header = document.querySelector('.global-calculator-header');
    if (!container || !header) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    /* — pointer start — */
    function onPointerDown(e) {
        // Only drag from the header (not the close button)
        if (e.target.closest('.global-calculator-close')) return;

        isDragging = true;
        const rect = container.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        container.classList.add('dragging');
        e.preventDefault();
    }

    /* — pointer move — */
    function onPointerMove(e) {
        if (!isDragging) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        // Constrain to viewport
        const pad = 10;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        const cx = Math.max(pad, Math.min(x, vw - cw - pad));
        const cy = Math.max(pad, Math.min(y, vh - ch - pad));

        container.classList.add('positioned');
        container.style.left = cx + 'px';
        container.style.top = cy + 'px';

        e.preventDefault();
    }

    /* — pointer end — */
    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('dragging');

        // Persist position
        localStorage.setItem('calculatorPosition', JSON.stringify({
            x: parseInt(container.style.left, 10),
            y: parseInt(container.style.top, 10)
        }));
    }

    /* Mouse events */
    header.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);

    /* Touch events */
    header.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        onPointerDown({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
            target: e.target,
            preventDefault: function() { e.preventDefault(); }
        });
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        if (e.touches.length !== 1) return;
        onPointerMove({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
            preventDefault: function() { e.preventDefault(); }
        });
    }, { passive: false });

    document.addEventListener('touchend', onPointerUp);

    // Restore saved position
    restoreCalculatorPosition(container);
}

function restoreCalculatorPosition(container) {
    if (!container) container = document.querySelector('.global-calculator-container');
    if (!container) return;

    const saved = localStorage.getItem('calculatorPosition');
    if (!saved) return;

    try {
        const pos = JSON.parse(saved);
        const pad = 10;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        const cx = Math.max(pad, Math.min(pos.x, vw - cw - pad));
        const cy = Math.max(pad, Math.min(pos.y, vh - ch - pad));

        container.classList.add('positioned');
        container.style.left = cx + 'px';
        container.style.top = cy + 'px';
    } catch (_) {
        // ignore bad data
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
});

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