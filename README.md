## Student Record System

A comprehensive web application for managing student records with persistent data storage, built with Bootstrap (frontend) and Node.js + Express.js + SQLite (backend).

## Features

### Core Functionality
- **Complete CRUD Operations**:
  - Create, Read, Update, and Delete student records
  - Paginated student listing (10 records per page by default)
  - Detailed student view with all information

### Advanced Features
- **Search System**:
  - Real-time search by student name or ID
  - Debounced input for performance
- **Filtering Capabilities**:
  - Filter by course (Computer Science, Engineering, etc.)
  - Filter by year level (1-5)
  - Combined course + year level filtering

### User Experience
- **Responsive Interface**:
  - Fully mobile-friendly Bootstrap 5 layout
  - Adaptive tables and forms
- **Interactive Elements**:
  - Toast notifications for all operations
  - Confirmation dialogs for deletions
  - Form validation with visual feedback
- **Data Management**:
  - Persistent SQLite database storage
  - Automatic database backup system

## Technology Stack

### Frontend
- **Core**: HTML5, CSS3, Vanilla JavaScript
- **UI Framework**: Bootstrap 5.3
- **Icons**: Font Awesome 6
- **Client-Side Validation**: Custom implementation

### Backend
- **Runtime**: Node.js (v18+ recommended)
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Validation**: Express Validator
- **Security**: Helmet, CORS, rate limiting

### Development Tools
- **Version Control**: Git
- **Environment Management**: dotenv
- **Containerization**: Docker (for production)

## Installation Guide

### Prerequisites
- Node.js v16 or higher
- npm v8 or higher
