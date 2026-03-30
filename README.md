# SpendWise - Personal Expense & Budget Tracker

SpendWise is a clean, modern, and intuitive personal finance manager built with React, Vite, and Tailwind CSS. It helps you track your expenses, manage your income, and stay on top of your monthly budgets with real-time visualizations.

## 🚀 Features

- **Dashboard Overview**: Get an immediate snapshot of your total balance, income, and expenses in INR (₹).
- **Interactive Charts**:
  - **Monthly Overview**: Bar chart comparing income vs. expenses over the last 6 months.
  - **Category Breakdown**: Pie chart showing your spending distribution across different categories.
- **Transaction Management**:
  - Log income and expenses with ease.
  - Categorize transactions (Food, Shopping, Salary, etc.).
  - Delete transactions with a single click.
- **Budgeting System**:
  - Set monthly spending limits for specific categories.
  - Real-time progress bars show how much of your budget is remaining.
  - Visual alerts (color changes) when you approach or exceed your budget.
- **Local Persistence**: All data is saved to your browser's `localStorage`, ensuring your data stays with you.
- **Responsive Design**: Fully optimized for both desktop and mobile viewing.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (formerly Framer Motion)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation & Setup

To run this project locally:

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd spendwise
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📝 License

This project is licensed under the Apache-2.0 License.
