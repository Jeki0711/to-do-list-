A simple, client-side to-do list application with a bold neo-brutalist design. No frameworks, no build tools — just plain HTML, CSS, and JavaScript.

[Читати українською](README_UA.md)

![alt text](image.png)


## Features

- Add new tasks via button or Enter key
- Mark tasks as completed with a custom checkbox
- Edit tasks inline without losing focus
- Delete individual tasks
- Filter tasks: all / active / completed
- Persistent storage using `localStorage`
- Active filter state is remembered across sessions
- Fully responsive layout
- Unique task IDs for reliable identification
- Clean, accessible UI with ARIA attributes and keyboard support

## Technologies

- HTML5
- CSS3 (neo-brutalist styling, custom checkbox, media queries)
- Vanilla JavaScript (ES6+)
- No external dependencies

## How to Run

1. Clone the repository or download the source files.
2. Open `index.html` in any modern web browser.
3. Start managing your tasks — all data is saved automatically in your browser.

That’s it. No server, no installation required.

## Project Structure
todo-app/
├── index.html # Main HTML file
├── styles.css # All styles (neo-brutalist theme)
├── script.js # Application logic
├── README.md # English documentation (you are here)
└── README_UA.md # Ukrainian documentation

text

## Design

The interface follows the principles of **neo-brutalism**:
- Heavy black borders and offset shadows
- Monospace typography
- Bright accent colors (yellow, red)
- Custom checkboxes and buttons with distinct active states
- Responsive behavior that preserves the raw aesthetic on smaller screens

## License

This project is open source and available under the [MIT License](LICENSE). Feel free to use, modify, and share it.