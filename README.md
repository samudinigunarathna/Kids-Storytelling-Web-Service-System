# ✨ DreamTales | Kids Storytelling Platform

DreamTales is a magical, full-stack web application designed to bring the joy of storytelling to children. Built with a modern Node.js backend and a vibrant, premium frontend, it allows kids and parents to discover, read, and save wonderful tales.

## 🌟 Key Features

### 📖 Magical Library
- **Standalone Library Page**: A dedicated space to browse our entire collection of stories.
- **Smart Filtering**: Filter stories by category (e.g., Fairy Tales, Adventure, Educational) to find exactly what you're looking for.
- **Live Search**: Quickly find stories by title or author name.
- **Story Categories**: Each story is tagged with a colorful pill indicating its type.

### 🏠 Personalized Dashboard
- **Welcome Message**: Personalized greeting for every registered user.
- **Quick Stats**: Track how many magical stories you've discovered and saved.
- **Favourites List**: A dedicated grid showing all your saved stories with one-click access to read them.
- **Whimsical Animations**: Experience the magic with animated assets that glide across your dashboard.

### 🎭 Immersive Reading Experience
- **Story Reader Modal**: Read stories in a beautiful, distraction-free popup window.
- **Preserved Formatting**: Stories maintain their natural flow and line breaks for the best reading experience.

### 🔐 Secure Access
- **Auth Guards**: Restricted access to the library and favorites ensures a safe environment.
- **Smart Redirection**: The system remembers your intent. If you try to read a story while logged out, it will bring you back to exactly where you were after signing in.

## 🚀 Technologies Used

- **Frontend**: Vanilla HTML5, Modern CSS3 (Custom Design System), JavaScript (ES6+).
- **Backend**: Node.js & Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Icons**: Lucide-JS for crisp, magical iconography.

## 🛠️ Prerequisites

- Node.js installed on your machine.
- MongoDB instance running (locally or on Atlas).
- A `.env` file in the root directory with the following variables:
  ```env
  PORT=5000
  MONGO_URL=your_mongodb_connection_string
  ```

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/samudinigunarathna/Kids-Storytelling-Web-Service-System.git
   ```
2. **Navigate to the project directory**:
   ```bash
   cd Kids-Storytelling-Web-Service-System
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the Magic**:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:5000`.

## 🛣️ API Endpoints

### User Routes (`/api/user`)
- `POST /create`: Register a new adventurer.
- `POST /login`: Authenticate and start the journey.
- `GET /getAllUsers`: Retrieve all registered users.
- `PUT /update/:id`: Update profile details.

### Story Routes (`/api/story`)
- `POST /create`: Add a new tale to the library.
- `GET /getAllStories`: Fetch all available stories.
- `PUT /update/:id`: Update story details.
- `DELETE /delete/:id`: Remove a story.

### Favourite Routes (`/api/favourite`)
- `POST /create`: Save a story to your personal collection.
- `GET /getFavourites/:userID`: Retrieve all favourites for a user (populated with story details).
- `DELETE /delete/:id`: Remove a story from favourites.

## 📁 Project Structure

- `public/`: Premium frontend assets (HTML, CSS, JS, Images).
- `controllers/`: Backend logic for handling API requests.
- `models/`: Mongoose schemas for Users, Stories, and Favourites.
- `routes/`: Express route definitions.
- `index.js`: Main entry point and server configuration.

## 📜 License

ISC License - Feel free to use and build upon this magical platform!
