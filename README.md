# E-Commerce Backend

## Project Overview

This project is a comprehensive backend implementation for an e-commerce platform. It mimics the functionality of a real-world e-commerce system, encompassing the following features:

- **User  Registration and Authentication**: Secure user sign-up and login processes.
- **Role-Based Access Control**: Differentiation between Admin and Regular User privileges.
- **Product Management**: Admin capabilities to manage product listings (view, add, update, delete).
- **Cart Management**: User functionalities to manage shopping cart items (add, modify, remove).
- **Entity Relationships**: Establishing connections between users, products, and carts.

The backend is developed using **Node.js**, **Express.js**, and **MySQL** for data management. Also the tools used for testing are **supertest** and **jest**.

---

## Base URL

All API endpoints are prefixed with:  
`http://localhost/api`

---

## API Routes

### User Routes (`/users`)

#### Public Routes
Accessible without authentication:
- **`POST /users/token`**  
  Retrieves a JWT token for user authentication (login).

- **`POST /users/register`**  
  Registers a new user and stores their information in the database.

#### Protected Routes
Authentication required:
- **`GET /users/profile`**  
  Retrieves the logged-in user's profile information.

- **`PUT /users/profile`**  
  Allows the logged-in user to update their profile information (nickname or email).

- **`DELETE /users/profile`**  
  Allows the logged-in user to delete their own account.

#### Admin Routes
Accessible only to users with admin privileges:
- **`GET /users/`**  
  Retrieves a list of all users in the database.

- **`PUT /users/promote/:userId`**  
  Promotes a regular user to admin.

- **`GET /users/:userId`**  
  Retrieves information about a specific user by their ID.

---

### Product Routes (`/products`)

#### Public Routes
Accessible without authentication:
- **`GET /products/`**  
  Retrieves all products in the database.

- **`GET /products/:product_id`**  
  Retrieves details about a single product by its ID.

#### Admin Routes
Accessible only to users with admin privileges:
- **`POST /products/`**  
  Allows an admin to add a new product to the database.

- **`DELETE /products/:product_id`**  
  Allows an admin to delete a product by its ID.

- **`PUT /products/:product_id`**  
  Allows an admin to update the details of an existing product.

---

### Cart Routes (`/cart`)

#### Protected Routes
Authentication required:
- **`GET /cart/`**  
  Retrieves the authenticated user's active cart, if one exists.

- **`POST /cart/addToCart`**  
  Adds a product to the user's cart. Creates a new cart if one doesn’t already exist.

- **`GET /cart/products`**  
  Retrieves all the products in the user's active cart.

- **`PUT /cart/products`**  
  Updates the quantity of a specific product in the user's cart.

- **`DELETE /cart/products`**  
  Removes a specific product from the user's cart.

---

## Query Parameters

### Admin-Only Parameters
Restricted to admin users:
- **`GET /users?name={nickname}`**  
  Retrieves a user by their nickname.  
  **Example:**  
  GET /users?name=JohnDoe



### Public Parameters
Accessible to all users:
- **`GET /products?name=${productName}`**  
Retrieves a product by its name.

- **`GET /products?orderBy=${Options}`**  
**Options**: `stock`, `price`  
Orders the products in ascending order by stock or price.

- **`GET /products?asc=${true || false}`**  
Determines the order of the previous query. If `asc=true`, it orders in ascending order; if `false`, in descending order.

### Pagination
- **`GET /products?page=${page}&limit=${limit}`**  
If the limit is not specified, the default is set to 5.  
Example: To retrieve the first 3 products of the 2nd page:
  `/products?page=2&limit=3`
---

## Technologies Used

- **Node.js**: A server-side JavaScript runtime.
- **Express.js**: A web framework for building the API.
- **MySQL**: A relational database for data storage.
- **JWT**: Utilized for user authentication.
- **Middleware**: Implemented for role-based access control (e.g., `isAuthenticated`, `isAdmin`).

## Testing Frameworks

- **supertest**: A popular testing library for HTTP assertions in Node.js applications. It allows for easy testing of API endpoints by simulating HTTP requests and validating responses. Supertest works seamlessly with any testing framework and is commonly used in conjunction with Jest for comprehensive testing of RESTful APIs.

- **jest**: A delightful JavaScript testing framework with a focus on simplicity. It provides a robust testing environment with features like zero configuration, snapshot testing, and built-in mocking capabilities. Jest is widely used for unit and integration testing in Node.js applications, making it an ideal choice for testing the e-commerce backend.

---

## Running Tests

To run the tests for this project, ensure that you have the necessary dependencies installed. You can execute the following command in your terminal:

```bash
npm test
```

---

## Contribution Guidelines

I´m welcoming contributions to enhance the functionality and performance of this e-commerce backend. If you would like to contribute, please follow these steps:

1. **Fork the Repository**: Create a personal copy of the repository.
2. **Create a Feature Branch**: Use a descriptive name for your branch (e.g., `feature/new-product-endpoint`).
3. **Make Your Changes**: Implement your feature or fix.
4. **Commit Your Changes**: Write clear and concise commit messages.
5. **Push to Your Branch**: Push your changes to your forked repository.
6. **Open a Pull Request**: Submit a pull request to the main repository for review.

---

For further inquiries, issues, or feature requests, please refer to the project's issue tracker on GitHub.

Thank you for your interest in contributing to this e-commerce backend project!
---