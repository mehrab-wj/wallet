# Wallet - Personal Expense Tracker

A cloud-based expense tracking application built as a weekend project for personal use. Built with Laravel, Inertia.js, and React to help track and manage personal finances.

## 🛠 Tech Stack

- **Backend**: Laravel (PHP)
- **Frontend**: React with Inertia.js
- **Database**: SQLite (for development)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **PWA Support**: Service Worker with Auto-updates

## 🚀 Features

- 📊 Dashboard with expense overview
- 💰 Transaction management (income & expenses)
- 🏷️ Category-based organization
- 💳 Account management
- 📱 Progressive Web App (PWA) support
- 🎨 Dark/Light mode toggle
- 🔐 Authentication system

## 🏃‍♂️ Quick Start

### Prerequisites
- PHP 8.1+
- Node.js 18+
- Composer
- SQLite or your preferred database

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:mehrab-wj/wallet.git
   cd wallet
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate --seed
   ```

6. **Start the development server**
   ```bash
   composer run dev
   ```

Visit `http://localhost:8000` to access the application.

## 📱 PWA Installation

This app supports Progressive Web App features:
- Installable on mobile devices
- Auto-updates when new versions are deployed

## 🔮 Future Plans

- 🤖 Email automation to automatically read and categorize transactions
- 📈 Advanced analytics and reporting
- 📤 Export & Import functionality (CSV, PDF)

## 🤝 Contributing

This is a personal weekend project, but feel free to fork and modify for your own use!

---

**Note**: This was built as a weekend project for personal use with my wife. It's not production-ready software, but it gets the job done for our needs!
