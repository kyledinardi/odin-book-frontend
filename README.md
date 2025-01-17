# Odin-Book

A social networking site built with React and Vite

Backend at https://github.com/kyledinardi/odin-book-backend  
Live at https://odin-book-frontend.pages.dev/

## Features

- Create, edit, delete, and repost posts, comments, and polls
- Separate threads for replying to comments
- Follow and be followed by other users
- Users can change their pictures, personal info, and password
- Profile page lets all users see a users posts, comments, posted images, and likes
- Chat Messenger with real-time sending, editing, and deleting of direct messages
- Real-time notifications
- Image and emoji support for all posts, comments, and messages
- Gif search through tenor
- Search page for posts and users
- Responsive design for desktops, tablets, and phones

## Installation

1. Open the termainal and clone the repository to your computer: `git clone git@github.com:kyledinardi/odin-book-frontend.git`
2. Change to the project directory: `cd odin-book-frontend`
3. Install packages: `npm install`
4. Create a .env file in the current directory and add these lines. 
```
VITE_BACKEND_URL=http://localhost:3000
VITE_TENOR_API_KEY=<tenor-API-key>
```
5. Follow the directions to set up the [backend](https://github.com/kyledinardi/odin-book-backend)
6. Start the dev server: `npm run dev`
7. Open your browser to http://localhost:5173/