# Delta-Project

## Project Overview

Delta-Project is the backend for a comprehensive customer service platform designed for an elevator company in Qatar. This platform includes a mobile application and a dashboard, enabling users to manage various aspects of customer service efficiently. The backend is built using Node.js and Express.js, with MongoDB as the primary database. It provides RESTful APIs for user management, product cataloging, order processing, maintenance requests, complaint management, and real-time notifications.

## Key Features

- **User Management:** RESTful APIs for user registration, authentication, and profile management.
- **Product Cataloging:** Manage elevator product catalogs, including CRUD operations.
- **Order Processing:** Handle customer orders, track progress, and manage order-related data.
- **Maintenance Request Handling:** Allow customers to submit and track maintenance requests.
- **Complaint Management:** Enable customers to file complaints and track their resolution status.
- **Notification Service:** Real-time notifications for order status, maintenance schedules, and other critical updates.
- **File Uploads:** Support for uploading and managing files (e.g., PDFs, images, videos) using Cloudinary and Google Drive.
- **Caching:** Implemented Redis for caching frequently accessed data to improve performance.
- **Rate Limiting:** Applied rate limiting to prevent abuse of the API.

## Technologies Used

- **Node.js:** Server-side logic and API development.
- **Express.js:** Routing and controller logic.
- **MongoDB & Mongoose:** Database management for storing customer and product data.
- **Firebase & Cloudinary:** Used for notification services and managing media files.
- **JWT:** Implemented for secure authentication and authorization.
- **Redis:** Used for caching and rate limiting.
- **Docker:** Containerized the application for consistent environments across development, testing, and production.
- **Google Drive API:** Used for storing and managing PDF files.
- **Multer:** Middleware for handling file uploads.

## Installation and Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis

### Steps to Run the Project Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MohamedRamadanSaudi/Delta-Project.git
   cd Delta-Project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following environment variables:

   ```plaintext
   DATABASE_URL=mongodb://<username>:<password>@<host>:<port>/<database>
   DATABASE_PASSWORD=<your_mongodb_password>
   JWT_SECRET=<your_jwt_secret>
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   FIREBASE_SERVICE_ACCOUNT=<base64_encoded_firebase_service_account_json>
   REDIS_HOST=<your_redis_host>
   REDIS_PORT=<your_redis_port>
   REDIS_PASSWORD=<your_redis_password>
   GOOGLE_DRIVE_API_KEY=<base64_encoded_google_drive_api_key>
   GOOGLE_DRIVE_FOLDER_ID=<your_google_drive_folder_id>
   EMAIL_HOST=<your_email_host>
   EMAIL_PORT=<your_email_port>
   EMAIL_USERNAME=<your_email_username>
   EMAIL_PASSWORD=<your_email_password>
   EMAIL_FROM=<your_email_from>
   ```

4. **Run the application:**
   ```bash
   npm run server
   ```
   The server will start on `http://localhost:3000`.

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

## Contact

- **Mohamed Ramadan**
- Email: [MohamedRamadanSaudi@gmail.com](mailto:MohamedRamadanSaudi@gmail.com)
