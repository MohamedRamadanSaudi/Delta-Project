# Delta-Project

## Project Overview
Delta-Project is the backend for a comprehensive customer service platform designed for an elevator company in Qatar. This platform includes a mobile application and a dashboard, enabling users to manage various aspects of customer service efficiently.

## Key Features
- **User Management:** RESTful APIs for user registration, authentication, and profile management.
- **Product Cataloging:** Manage elevator product catalogs, including CRUD operations.
- **Order Processing:** Handle customer orders, track progress, and manage order-related data.
- **Maintenance Request Handling:** Allow customers to submit and track maintenance requests.
- **Complaint Management:** Enable customers to file complaints and track their resolution status.
- **Notification Service:** Real-time notifications for order status, maintenance schedules, and other critical updates.

## Technologies Used
- **Node.js:** Server-side logic and API development.
- **Express.js:** Routing and controller logic.
- **MongoDB & Mongoose:** Database management for storing customer and product data.
- **Firebase & Cloudinary:** Used for notification services and managing media files.
- **JWT:** Implemented for secure authentication and authorization.
- **Docker:** Containerized the application for consistent environments across development, testing, and production.

## Installation and Setup
To run this project locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/MohamedRamadanSaudi/Delta-Project.git
   cd Delta-Project
2. Install dependencies:
   ```bash
   npm install
3. Set up environment variables:
   Create a .env file in the root directory and add the environment variables.
5. Run the application:
   ```bash
   npm run server  
 The server will start on `http://localhost:3000`.

## License
This project is licensed under the MIT License.

## Contact
Mohamed Ramadan - MohamedRamadanSaudi@gmail.com
