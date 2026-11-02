# superagent_learn

A learning project whose goal is to develop a **calculator** feature.

## Goal

Build a calculator that can:

- Perform the four basic arithmetic operations: addition, subtraction, multiplication and division
- Parse expressions such as `1 + 2 * 3` with standard operator precedence and parentheses
- Handle decimal numbers, negative numbers and clear error reporting (for example, division by zero)

## Roadmap

1. [ ] Core expression parser and evaluator
2. [ ] Basic operations (`+`, `-`, `*`, `/`, parentheses)
3. [ ] Decimal and negative number support
4. [ ] Error handling and input validation
5. [ ] Tests for parsing and evaluation

## Development

Clone the repository and start hacking:

```bash
git clone https://github.com/zhengylyeah/superagent_learn.git
cd superagent_learn
```

Contributions are welcome: open an Issue or a Pull Request.

## 2048 Game

A web version of the classic 2048 game lives in [`2048/index.html`](2048/index.html).
Open that file in any browser to play — no build step or server needed.

- Move tiles with the arrow keys (WASD also works, plus touch swipes on mobile)
- Tiles with the same number merge into one when they collide
- Reach **2048** to win, then keep playing for a higher score
- Score and best score (saved locally) are shown at the top; start over any time with “新游戏”
