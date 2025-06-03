// utils/regex.ts
export const isOperand = (c: string): boolean =>
  /^[a-zA-Z0-9]$/.test(c) || c === "ε";

export const isUnaryOperator = (c: string): boolean =>
  ["*", "+", "?"].includes(c);

export const insertConcatenation = (regex: string): string => {
  let processedRegex = "";
  let prevChar = "";

  for (let i = 0; i < regex.length; i++) {
    const currentChar = regex[i];

    if (currentChar === "\\") {
      processedRegex += currentChar;
      i++;
      if (i < regex.length) {
        const escapedChar = regex[i];
        processedRegex += escapedChar;
        prevChar = escapedChar; // Treat the escaped char as the prevChar for concat logic
      } else {
        throw new Error("Unterminated escape sequence at end of regex.");
      }
      continue;
    }

    if (
      prevChar &&
      prevChar !== "|" &&
      currentChar !== "|" &&
      currentChar !== "*" &&
      currentChar !== "+" &&
      currentChar !== "?" &&
      currentChar !== ")" &&
      prevChar !== "("
    ) {
      const prevCharWasEscapedLiteral =
        processedRegex.length > 1 &&
        processedRegex[processedRegex.length - 2] === "\\" &&
        prevChar === processedRegex[processedRegex.length - 1];

      const needsConcat =
        ((isOperand(prevChar) &&
          !prevCharWasEscapedLiteral &&
          !isUnaryOperator(prevChar) &&
          prevChar !== "(" &&
          prevChar !== "|") || // Normal operand
          prevChar === ")" || // Closing parenthesis
          (isUnaryOperator(prevChar) && !prevCharWasEscapedLiteral) || // Unary operator
          prevCharWasEscapedLiteral) && // Any escaped character can be followed by concatenation
        (isOperand(currentChar) || // Normal operand
          currentChar === "(" || // Opening parenthesis
          currentChar === "\\"); // Start of an escape sequence

      if (needsConcat) {
        processedRegex += "·";
      }
    }

    processedRegex += currentChar;
    prevChar = currentChar;
  }
  return processedRegex;
};

export const parseRegexToPostfix = (regex: string): string => {
  if (regex.trim().length === 0) {
    // Handle empty or whitespace-only regex
    return ""; // Return empty postfix for empty regex (NFA will handle this as epsilon)
  }

  let processedRegex;
  try {
    processedRegex = insertConcatenation(regex);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Preprocessing error: ${error.message}`);
    }
    throw new Error("Preprocessing failed.");
  }


  if (processedRegex.length === 0 && regex.length > 0 && regex !== "\\e") {
    throw new Error(
      "Invalid regex structure leading to empty processed string."
    );
  }
  if (processedRegex.length === 0 && regex === "\\e") {
    // Special case for \e
    return "ε";
  }
  if (processedRegex.length === 0 && regex.length === 0) {
    return "";
  }

  const precedence: { [key: string]: number } = {
    "|": 1,
    "·": 2,
    "?": 3,
    "*": 3,
    "+": 3,
  };

  const outputQueue: string[] = [];
  const operatorStack: string[] = [];
  let parenCount = 0;

  if (processedRegex.length > 0) {
    const firstChar = processedRegex[0];
    if (["|", "*", "+", "?", "·"].includes(firstChar) && firstChar !== "(") {
      // Allow ( at start
      throw new Error(
        `Invalid start of expression after preprocessing: '${firstChar}'.`
      );
    }
    const lastChar = processedRegex[processedRegex.length - 1];
    if (["|", "·", "("].includes(lastChar) && lastChar !== ")") {
      // Allow ) at end
      throw new Error(
        `Invalid end of expression after preprocessing: '${lastChar}'.`
      );
    }
  }

  let i = 0;
  while (i < processedRegex.length) {
    const char = processedRegex[i];

    if (char === "\\") {
      i++;
      if (i < processedRegex.length) {
        const escapedChar = processedRegex[i];
        if (escapedChar === "e") {
          outputQueue.push("ε");
        } else {
          outputQueue.push(escapedChar);
        }
      } else {
        throw new Error("Unterminated escape sequence at end of regex.");
      }
      i++;
      continue;
    }

    if (isOperand(char)) {
      outputQueue.push(char);
    } else {
      switch (char) {
        case "(":
          parenCount++;
          operatorStack.push("(");
          break;
        case ")":
          if (parenCount === 0)
            throw new Error(`Unmatched closing parenthesis at position ${i}.`);
          parenCount--;
          while (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1] !== "("
          ) {
            outputQueue.push(operatorStack.pop()!);
          }
          if (operatorStack.length === 0)
            // Should find '('
            throw new Error(
              `Mismatched parentheses; stack empty when expecting '('. Position ${i}`
            );
          operatorStack.pop(); // Pop '('
          break;
        case "|":
        case "·":
        case "*":
        case "+":
        case "?":
          while (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1] !== "(" &&
            precedence[char] <=
              precedence[operatorStack[operatorStack.length - 1]]
          ) {
            outputQueue.push(operatorStack.pop()!);
          }
          operatorStack.push(char);
          break;
        default:
          throw new Error(
            `Invalid or unhandled character '${char}' at position ${i} in processed regex.`
          );
      }
    }
    i++;
  }

  if (parenCount > 0)
    throw new Error("Unmatched opening parenthesis in the expression.");

  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op === "(")
      throw new Error(
        "Mismatched parentheses (remaining '(' on stack at end of parsing)."
      );
    outputQueue.push(op);
  }

  // If output is empty but original regex was not (and not \e), it's an error.
  if (outputQueue.length === 0 && regex.length > 0 && regex !== "\\e") {
    throw new Error(
      "Failed to parse regex into postfix. Output queue is empty, possibly due to invalid structure like '()'."
    );
  }

  return outputQueue.join("");
};
