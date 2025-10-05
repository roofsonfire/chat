# Contributing to the Project

First off, thank you for considering contributing to this project! Your help is greatly appreciated.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [INSERT CONTACT METHOD].

## How Can I Contribute?

### Reporting Bugs

This is a great way to contribute! Before creating a bug report, please check the existing issues to see if someone has already reported it. If not, create a new issue and provide as much detail as possible, including:

- A clear and descriptive title.
- Steps to reproduce the bug.
- What you expected to happen.
- What actually happened.
- Your environment details (OS, browser, etc.).

### Suggesting Enhancements

If you have an idea for an enhancement, please create an issue to outline your proposal. This allows for discussion before any code is written.

### Pull Requests

1.  Fork the repository and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes.
4.  Make sure your code lints.
5.  Issue that pull request!

## Local Development

To get started with local development, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/roofsonfire/chat.git
    cd chat
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file by copying `.env.example` and fill in the required values.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### Code Style

This project uses Prettier and ESLint to enforce code style. Please run `npm run lint` and `npm run format` before committing your changes.
