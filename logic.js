document.getElementById('logicForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const proposition = document.getElementById('proposition').value;
    generateTruthTable(proposition);
});

function generateTruthTable(proposition) {
    const variables = Array.from(new Set(proposition.match(/[a-zA-Z]/g))).sort();
    const numberOfRows = Math.pow(2, variables.length);
    const truthTable = [];

    for (let i = 0; i < numberOfRows; i++) {
        const row = {};
        variables.forEach((variable, index) => {
            row[variable] = Boolean(i & (1 << (variables.length - index - 1)));
        });
        truthTable.push(row);
    }

    const tableContainer = document.getElementById('truthTable');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    variables.forEach(variable => {
        const headerCell = document.createElement('th');
        headerCell.textContent = variable;
        headerRow.appendChild(headerCell);
    });

    const resultHeaderCell = document.createElement('th');
    resultHeaderCell.textContent = proposition;
    headerRow.appendChild(resultHeaderCell);

    table.appendChild(headerRow);

    truthTable.forEach(row => {
        const tableRow = document.createElement('tr');
        variables.forEach(variable => {
            const cell = document.createElement('td');
            cell.textContent = row[variable] ? 'V' : 'F';
            tableRow.appendChild(cell);
        });

        const resultCell = document.createElement('td');
        const result = evaluateProposition(proposition, row);
        resultCell.textContent = result ? 'V' : 'F';
        tableRow.appendChild(resultCell);

        table.appendChild(tableRow);
    });

    tableContainer.appendChild(table);
}

function evaluateProposition(proposition, row) {
    const rpn = infixToRPN(proposition);
    return evaluateRPN(rpn, row);
}

function infixToRPN(proposition) {
    const precedence = { '~': 4, '&': 3, '|': 2, '=>': 1, '<=>': 0 };
    const associativity = { '~': 'right', '&': 'left', '|': 'left', '=>': 'right', '<=>': 'left' };
    const outputQueue = [];
    const operatorStack = [];

    const tokens = proposition.match(/([a-zA-Z]+|~|&|\||=>|<=>|\(|\))/g);
    
    tokens.forEach(token => {
        if (/[a-zA-Z]/.test(token)) {
            outputQueue.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop();
        } else {
            while (operatorStack.length &&
                   operatorStack[operatorStack.length - 1] !== '(' &&
                   (associativity[token] === 'left' && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]] ||
                   associativity[token] === 'right' && precedence[token] < precedence[operatorStack[operatorStack.length - 1]])) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        }
    });

    while (operatorStack.length) {
        outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
}

function evaluateRPN(rpn, row) {
    const stack = [];

    rpn.forEach(token => {
        if (/[a-zA-Z]/.test(token)) {
            stack.push(row[token]);
        } else {
            if (token === '~') {
                const a = stack.pop();
                stack.push(!a);
            } else {
                const b = stack.pop();
                const a = stack.pop();
                if (token === '&') {
                    stack.push(a && b);
                } else if (token === '|') {
                    stack.push(a || b);
                } else if (token === '=>') {
                    stack.push(!a || b);
                } else if (token === '<=>') {
                    stack.push(a === b);
                }
            }
        }
    });

    return stack.pop();
}