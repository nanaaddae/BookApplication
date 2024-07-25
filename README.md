# Book Tracking Application

### Overview

Book Tracking Application is a full-stack web application that allows users to search for books, create personalized wishlists, and manage their reading lists. The application is built using Django for the backend and React for the frontend, providing a seamless and user-friendly experience for book enthusiasts.

### Features
- User authentication and authorization
- Book search functionality using external APIs
- Add books to wishlist and read list
- Remove books from wishlist and read list
- Move books from wishlist to read list
- Responsive user interface

### Technologies Used
- Backend: Django (Python)
- Frontend: React (JavaScript)
- API Requests: Axios
- Database: PostgreSQL (or SQLite)
- Styling: Bootstrap

## Installation


### Backend (Django)

1. Clone the repository:
   git clone https://github.com/nanaaddae/BookApplication.git
   cd book-tracking-application/backend

2. Create and activate a virtual environment:
   python3 -m venv venv
   source venv/bin/activate

3. Install the required packages:
   pip install -r requirements.txt

4. Apply migrations:
   python manage.py migrate

5. Create a superuser:
   python manage.py createsuperuser

6. Run the development server:
   python manage.py runserver

### Frontend (React)

1. Navigate to the frontend directory:
   cd ../frontend

2. Install the required packages:
   npm install

3. Start the development server:
   npm start

### Usage

1. Register a new user or log in with an existing account.
2. Use the search functionality to find books.
3. Add books to your wishlist or read list.
4. Manage your book collections by moving books between lists or removing them.

Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or improvements.

