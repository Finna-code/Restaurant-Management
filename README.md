
# EatKwik - Restaurant Management System

EatKwik is a modern, full-stack web application designed to streamline restaurant operations. It provides distinct interfaces and functionalities for administrators, staff, and customers, aiming to enhance efficiency in order management, menu configuration, and operational oversight.

## Tech Stack

The app is built with a robust and modern technology stack:

*   **Next.js (App Router):** Leveraged for its powerful features including Server Components, optimized routing, and server-side rendering capabilities, providing a fast and scalable foundation. The App Router handles both frontend rendering and backend API routes.
*   **React & TypeScript:** React is used for building dynamic and interactive user interfaces, while TypeScript ensures type safety, code quality, and improved maintainability across the project.
*   **Tailwind CSS:** A utility-first CSS framework used for rapid and consistent UI development, enabling a highly customizable and responsive design.
*   **ShadCN UI:** Provides a collection of beautifully designed, accessible, and customizable UI components (cards, buttons, forms, dialogs, etc.) built on top of Tailwind CSS and Radix UI. A custom dark theme is implemented in `src/app/globals.css`.
*   **MongoDB & Mongoose:** MongoDB serves as the NoSQL document database for storing application data (menu items, orders, settings). Mongoose is used as the Object Data Modeling (ODM) library to define schemas and interact with the database in a structured manner.
*   **Google Genkit AI:** Integrated for AI-powered features, currently used to generate intelligent insights from the admin dashboard analytics. Genkit flows are defined in `src/ai/flows/`. Requires a Google API key (e.g., for Gemini).
*   **Recharts:** A composable charting library used to display data visualizations (line, bar, pie charts) on the Admin Dashboard.
*   **Faker.js:** Used extensively for generating dynamic and realistic placeholder data for development and testing purposes.
*   **Lucide React:** Provides a comprehensive library of simply beautiful and consistent icons.

## Key Features

### Admin Role
*   **Comprehensive Dashboard:** View key performance indicators (KPIs), sales trends, most ordered dishes, category revenue, and peak ordering hours with interactive charts.
*   **AI-Powered Insights:** Receive generative AI insights based on dashboard analytics to help in decision-making.
*   **Menu Management (CRUD):** Full control over menu items, including creation, editing, deletion, pricing, ingredients, dietary tags, availability, and image management. Categories are dynamically managed.
*   **Order Management (CRUD):** Create new orders (via a multi-step form), view, update statuses, edit details, and delete existing customer orders.
*   **Settings Management:** Configure restaurant details, operational settings (online ordering, delivery radius, min order value), manage menu categories (add custom, hide/show default/custom), and toggle between live and placeholder data for the dashboard.

### Staff Role
*   **Staff Dashboard:** A quick overview of operational statistics relevant to staff tasks (e.g., pending orders, active orders).
*   **Order Processing:** View and manage active customer orders, update order statuses (e.g., "Placed" -> "In Preparation" -> "Ready for Pickup"), and edit order details.

### Customer (Public Interface)
*   **Interactive Menu:** Browse available menu items with detailed descriptions, images, pricing (INR), ingredients, and dietary tags.
*   **Advanced Filtering & Sorting:** Filter menu items by category, dietary tags, and price range. Sort items by name, price, or rating.
*   **Search Functionality:** Easily search for specific menu items.
*   **Order Tracking:** Customers can enter their order number to view its current status and progress.
*   **View Item Details:** A modal dialog provides an expanded view of each menu item, including customer feedback.

## Project Structure

<details>
<summary>Click to expand/collapse project structure</summary>

The project follows a standard Next.js App Router structure:

*   `src/app/`: Contains all application routes, layouts, and pages.
    *   `(auth)/login/`: Authentication page.
    *   `admin/...`: Routes and layouts specific to the Admin portal (Dashboard, Menu, Orders, Settings).
    *   `staff/...`: Routes and layouts specific to the Staff portal (Dashboard, Orders).
    *   `menu/`: Public menu browsing page.
    *   `orders/track/`: Public order tracking page.
    *   `api/...`: Backend API routes for data handling (e.g., `/api/menu-items`, `/api/orders`, `/api/settings`, `/api/analytics/dashboard`).
*   `src/components/`: Reusable UI components.
    *   `common/`: General components like `SiteHeader`, `AppLogo`, `TopLoadingBar`.
    *   `auth/`: Authentication-related components (e.g., `LoginForm`).
    *   `menu/`: Components for the menu page (e.g., `MenuItemCard`, `MenuFilters`, `MenuItemDetailsDialog`).
    *   `orders/`: Components for order management (e.g., `OrderForm`, `OrderDetailsDialog`, `MultiStepOrderForm`).
    *   `ui/`: ShadCN UI components.
*   `src/lib/`: Utility functions, type definitions, and placeholder data.
    *   `dbConnect.ts`: MongoDB connection utility.
    *   `types.ts`: Core TypeScript type definitions for the application.
    *   `placeholder-data.ts`: Logic for generating dynamic placeholder data using Faker.js. This data is used when the "Use Placeholder Dashboard Data" setting is enabled by an admin.
    *   `currency-utils.ts`: Utilities for formatting currency (INR).
*   `src/models/`: Mongoose schemas for database collections (`MenuItem.ts`, `Order.ts`, `Settings.ts`, `User.ts`).
*   `src/context/`: React Context API providers for global state management.
    *   `auth-context.tsx`: Manages user authentication state and mock login logic.
    *   `loading-context.tsx`: Manages global loading indicators (e.g., top loading bar simulation).
*   `src/ai/`: Genkit AI integration.
    *   `genkit.ts`: Genkit global AI object initialization.
    *   `flows/`: Contains Genkit flow definitions (e.g., `generate-dashboard-insights-flow.ts`).
    *   `dev.ts`: Entry point for Genkit development server, registering flows.
*   `public/`: Static assets (though images are primarily handled via `next/image` or URLs).
*   `package.json`: Lists project dependencies and scripts.
*   `next.config.ts`: Next.js configuration file.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `components.json`: ShadCN UI configuration.

</details>

## Getting Started (Setup & Installation)

⚙️ **Local Development Setup**

To run the EatKwik project locally, you'll need to launch both the Next.js application (which includes frontend and backend API routes) and the Genkit development server for AI functionalities.

Make sure you have Node.js (v18 or higher recommended) and npm installed. A running MongoDB instance (local or cloud-hosted like MongoDB Atlas) is also required. A Google API Key (e.g., for Gemini) is needed for AI features.

1.  **Clone the Repository (or use your downloaded files):**
    If you have the project files from a Git repository:
    ```bash
    git clone <repository-url>
    cd eatkwik-project-directory
    ```
    If you've downloaded the files, navigate to the project's root directory in your terminal.

2.  **Install Dependencies:**
    Navigate to the project root (where `package.json` is located) and run:
    ```bash
    npm install
    ```

3.  **Set Environment Variables:**
    Create a `.env.local` file in the root of your project. This file should **not** be committed to Git. Add your configuration:
    ```env
    MONGODB_URI="your_mongodb_connection_string"
    GOOGLE_API_KEY="your_google_api_key_for_genkit_ai_features"
    ```
    Replace `"your_mongodb_connection_string"` with your actual MongoDB Atlas URI or local MongoDB URI (e.g., `mongodb://localhost:27017/eatkwik`).
    Replace `"your_google_api_key_for_genkit_ai_features"` with your actual Google API key (e.g., a Gemini API key obtained from Google AI Studio). The Genkit AI features rely on this key.

4.  **Run the Next.js Application:**
    To start the main application (frontend and API routes):
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:9006` (or as configured in `package.json`).

5.  **Run the Genkit Development Server (for AI features):**
    In a separate terminal, navigate to the project root again and start the Genkit development server to make AI flows callable:
    ```bash
    npm run genkit:dev
    ```
    Or, for auto-reloading on changes to flow files:
    ```bash
    npm run genkit:watch
    ```
    The Genkit development UI will usually be available at `http://localhost:4000` (or as specified in the Genkit CLI output).

You should now have both the Next.js application and the Genkit server running, allowing you to test all features locally.

## Authentication & User Roles

EatKwik uses a mock authentication system (`AuthContext`) for demonstration and development purposes. User data is stored in browser localStorage upon login.

*   **Admin:**
    *   Email: `admin@example.com`
    *   Password: `password`
*   **Staff:**
    *   Email: `staff@example.com`
    *   Password: `password`
*   **Customer (Generic):**
    *   Any other email address with the password `password` will log in as a 'customer' for testing public views like the menu.
    *   Alternatively, public routes like `/menu` or `/orders/track` can be accessed without logging in.

Upon successful login, users are redirected to their respective dashboards (`/admin/dashboard`, `/staff/dashboard`, or `/menu` for customers). Role-based layouts and route protection are managed via `AuthContext` and conditional rendering in layout components (`AdminLayout.tsx`, `StaffLayout.tsx`).

## Usage Instructions

### Admin Portal:
*   **Dashboard:** Navigate to `/admin/dashboard`. View analytics. AI insights are generated based on the displayed data.
*   **Live/Placeholder Data Toggle:** Go to `/admin/settings` -> "Developer Settings" to switch the Admin Dashboard between live MongoDB data and dynamic placeholder data.
*   **Menu Management:** Access `/admin/menu`. Click "Add New Item" to open the form. Use table actions to edit, delete, or toggle availability. Categories for new items are sourced from "Category Management" in Admin Settings.
*   **Order Management:** Visit `/admin/orders`. Click "New Order" for the multi-step creation form. Use table actions to view, edit, or delete orders, and update their status.
*   **Settings:** Go to `/admin/settings` to configure restaurant info, operations (online ordering, delivery radius, min order value), menu categories (add custom, hide/show default/custom), and developer settings.

### Staff Portal:
*   **Dashboard:** Navigate to `/staff/dashboard` for an operational overview.
*   **Order Processing:** Go to `/staff/orders`. Use search and filters. Update order statuses directly in the table. Click actions to view or edit order details.

### Customer Interface:
*   **Menu:** Visit `/menu`. Use filters on the left to narrow down choices by category, dietary tag, or price. Use the search bar for specific items. Click on a card to open the `MenuItemDetailsDialog` for more information, including ingredients and placeholder customer feedback.
*   **Order Tracking:** Go to `/orders/track`. Enter your order number to see its current status.

## AI Integration

*   **Dashboard Insights:** The Admin Dashboard features AI-generated insights. This is powered by the Genkit flow defined in `src/ai/flows/generate-dashboard-insights-flow.ts`. The flow takes the current dashboard analytics data (either live or placeholder) as input and returns 2-3 concise textual insights. To use this, ensure you have set your `GOOGLE_API_KEY` in your `.env.local` file and the Genkit development server (`npm run genkit:dev` or `npm run genkit:watch`) is running alongside the Next.js application.

## Placeholder Data & Live Data

*   **Dynamic Placeholders:** The application features a robust placeholder data generation system located in `src/lib/placeholder-data.ts`. It uses `Faker.js` to create varied and realistic-looking data for menu items, orders, and analytics on each relevant page load when placeholder mode is active. This is extremely useful for development, testing UI with different data scenarios, and providing rich input for AI features without needing a populated live database.
*   **Live Data Toggle:** Admins can switch the Admin Dashboard to use live data from MongoDB via a toggle in `/admin/settings` under "Developer Settings". When live data is active, the dashboard fetches analytics directly from the `/api/analytics/dashboard` API route, which performs aggregations on the MongoDB database.

## Development Context

This project was developed through an iterative process, leveraging AI collaboration for rapid prototyping and feature implementation. This approach allowed for quick exploration of different solutions and continuous refinement based on evolving requirements.

## Future Scope & Improvements (Potential)

*   **Real Payment Gateway Integration:** Implement Stripe, Razorpay, or similar for actual transactions.
*   **Real-time Features:** Use WebSockets (e.g., with Socket.IO) for live order updates and kitchen display systems.
*   **Expanded AI Functionalities:**
    *   AI-generated menu item descriptions.
    *   Advanced demand forecasting.
    *   Personalized customer recommendations based on order history.
*   **Robust Authentication & Security:** Replace mock authentication with a secure solution like NextAuth.js. Implement proper authorization and input validation across all APIs.
*   **Customer Accounts & Order History:** Allow customers to create accounts, save preferences, and view their past orders.
*   **Staff Roles & Permissions:** More granular roles for staff (chef, cashier, delivery) with specific permissions.
*   **Inventory Management:** Basic tracking of ingredient stock.
*   **Table Reservation System.**
*   **Enhanced UI/UX:** Further refinement of user flows and visual appeal.

---

This README provides a comprehensive guide to the EatKwik application for local development and exploration. Enjoy!

