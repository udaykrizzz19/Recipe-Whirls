<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Foods_-_Idil_Keysan_-_Wikimedia_Giphy_stickers_2019.gif" alt="Chef Cooking" width="200"/>
  <h1><b>Recipe Whirls - Recipe Generation</b> 🍳</h1>
</div>

<div align="center">

[![React Badge](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript Badge](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS Badge](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase Badge](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
[![PostgreSQL Badge](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Framer Motion Badge](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Gemini Badge](https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://gemini.google.com/)

</div>

---

## 📖 Table of Contents

*   <a href="#-about-the-project">🧐 About The Project</a>
*   <a href="#-problem-statement">🎯 Problem Statement</a>
*   <a href="#-solution">💡 Solution</a>
*   <a href="#-features">✨ Features</a>
*   <a href="#️-tech-stack">🛠️ Tech Stack</a>
*   <a href="#-getting-started">🚀 Getting Started</a>
*   <a href="#️-roadmap">🗺️ Roadmap</a>
*   <a href="#-contributing">🤝 Contributing</a>
*   <a href="#-contact">📧 Contact</a>

---

## 🧐 About The Project

Recipe Whirls was born from a love for food and a desire to create a beautiful, user-friendly platform for discovering and sharing culinary creations. 🍲 Our application leverages **TheMealDB API** to bring you a vast and diverse collection of recipes from all over the world. [3] We've focused on creating a seamless and engaging user experience with a visually appealing design and fluid animations.
Whether you're a seasoned chef or just starting your cooking journey, this app is for you!

---

## 🎯 Problem Statement

Many home cooks face the daily challenge of deciding what to make with the ingredients they have, often leading to food waste and meal fatigue. Existing recipe platforms can be overwhelming, lacking intuitive tools to turn available items into a delicious meal. This transforms cooking from a creative, enjoyable process into a frustrating chore, leaving users uninspired and stuck in a culinary rut, searching for a more dynamic and helpful kitchen companion.

---

## 💡 Solution

Recipe Whirls tackles this by introducing a "Search by Items" feature, suggesting recipes based on ingredients you already have, thus minimizing food waste and sparking creativity. With the "Filter by Category" option, users can easily explore various cuisines and meal types. By allowing users to save favorites and contribute their own recipes, our app transforms the daily task of cooking into an inspiring and delightful culinary journey, making every meal an exciting new adventure.

---

## ✨ Features

*   **🥑 Search by Items:** Get recipe suggestions based on the ingredients you have on hand.
*   **📂 Filter by Category:** Easily browse recipes by cuisine, meal type, and more.
*   **🔍 Effortless Recipe Discovery:** Instantly search for recipes from the extensive TheMealDB API.
*   **🤖 AI Culinary Assistant:** Get instant answers to your food-related questions, from ingredient substitutions to cooking techniques, with our Gemini-powered chatbot.
*   **🔐 Secure User Authentication:** Easy and secure login and signup, including a "Sign in with Google" option via OAuth, all powered by Supabase.
*   **📚 Personalized Recipe Box:** Save your favorite recipes to your personal collection for quick and easy access.
*   **✍️ Share Your Culinary Creations:** A dedicated space for you to contribute your own recipes and share them with our growing community.
*   **🎨 Stunning & Intuitive UI/UX:** A visually rich and user-friendly interface with smooth, delightful animations.

---

## 🛠️ Project Tech Stack

This project is built with a modern and powerful tech stack:

### Frontend
*   **[React](https://reactjs.org/)**
*   **[TypeScript](https://www.typescriptlang.org/)**
*   **[Tailwind CSS](https://tailwindcss.com/)**
*   **[Framer Motion](https://www.framer.com/motion/)** for animations

### Backend & Database
*   **[Supabase](https://supabase.io/)**
*   **[PostgreSQL](https://www.postgresql.org/)**

### Authentication
*   **[Supabase Auth](https://supabase.com/docs/guides/auth)**
*   **[Google OAuth](https://developers.google.com/identity/protocols/oauth2)**

### APIs & AI
*   **[TheMealDB API](https://www.themealdb.com/api.php)**
*   **[Google Gemini API](https://ai.google.dev/)**

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm (or yarn) installed on your machine.

### Installation

1.  **Fork the repository**
2.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/recipe-whirls.git
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Set up your environment variables**

    Create a `.env.local` file in the root of your project and add your Supabase and Gemini API keys.

    ```
    REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
    REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    REACT_APP_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

5.  **Run the development server**
    ```sh
    npm start
    ```

The app will be available at `http://localhost:3000`.

---

## 🗺️ Roadmap

We have exciting plans for the future of Recipe Whirls!

*   [ ] **Advanced Search Filters:** Enhance filtering with dietary restrictions.
*   [ ] **Meal Planner:** Plan your meals for the week and generate a shopping list.
*   [ ] **Recipe Ratings and Reviews:** Let users rate and review recipes.
*   [ ] **Social Sharing:** Easily share your favorite recipes on social media.
*   [ ] **Enhanced AI Chat:** Deeper integration with recipes for dynamic suggestions.

See the [open issues](https://github.com/your_username/recipe-whirls/issues) for a full list of proposed features (and known issues).

---

## 🤝 Contributing

Contributions are the lifeblood of the open-source community and are **greatly appreciated**. Your contributions will help make this project even better!

If you have a suggestion for improvement, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

---

## 📧 Contact

Project Link:[([https://github.com/udaykrizzz19/Recipe-Whirls/])](https://github.com/udaykrizzz19/Recipe-Whirls/edit/main/README.md)
