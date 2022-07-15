# TinyApp Project

TinyApp is a full stack web application built with Node and Express and styled with Bootstrap that allows users to shorten long URLs (à la bit.ly). Users are able to register and login, and logged in users can create their own TinyURL and view them, as well as viewing statistics about their created URLs such as total visits, unique visitors, and a detailed log list of all visits. Anyone can use created TinyURLs, but only logged in users that created the URL can edit or delete them.
**Note:** All user passwords are hashed before storing, and all user ID cookies are encrypted.

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override
- morgan

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
