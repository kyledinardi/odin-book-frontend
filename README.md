# Odin-Book

A social networking site built with React and Vite.

## Live

https://odin-book-frontend.pages.dev/

## Backend

https://github.com/kyledinardi/odin-book-backend

## Features

- Create, edit, delete, and repost posts, comments, and polls
- Use separate threads for replying to comments
- Follow and be followed by other users
- Change profile pictures, personal info, and passwords
- View posts, comments, posted images, and likes on users' profile pages
- Send, edit, and delete direct messages in real time with the built in messenger
- Receive real-time notifications
- Use images and emojis in all posts, comments, and messages
- Search GIFs through Tenor
- Search for posts and users
- Adapt design responsively for desktops, tablets, and phones

## Installation

1. Open the terminal and clone the repository to your computer: `git clone git@github.com:kyledinardi/odin-book-frontend.git`
2. Change to the project directory: `cd odin-book-frontend`
3. Install packages: `npm install`
4. Create a .env file in the current directory and add these lines. 
```
VITE_BACKEND_URL=http://localhost:3000
VITE_TENOR_API_KEY=<Tenor-API-key>
```
5. Follow the directions to set up the [backend](https://github.com/kyledinardi/odin-book-backend)
6. Start the dev server: `npm run dev`
7. Open your browser to http://localhost:5173/