This is a Student/Teacher Management System built with [Next.js] (https://nextjs.org) , Express and MongoDB.

## Project Overview

This app allows teachers to manage students in their department, including registration, editing, deleting, and bulk uploading via CSV. Authentication is required for all dashboard operations.

### Main Pages & Features

- **Login/Register (`/`)**: Teachers can register and log in. Registration requires name, email, phone, password, and department. Login uses email and password.

- **Dashboard (`/dashboard`)**: After login, teachers see a table of students in their department. Features:
  - Add Student: Opens a modal to add a new student with validation.
  - Edit Student: Edit details in a modal.
  - Delete Student: Remove a student from the list.
  - Search: Filter students by name, email, or department.
  - Bulk Upload: Navigate to bulk upload page.
  - Logout: End session and return to login.

- **Bulk Upload (`/dashboard/bulk-upload`)**: Upload a CSV file of students. Features:
  - Validates required columns (name, email, age).
  - Checks for duplicate emails and validates each row.
  - Shows correct and incorrect data in separate tables.
  - Allows editing incorrect rows and validating them individually.
  - Delete incorrect rows.
  - Save all correct rows to backend in bulk.
  - Back button to dashboard.

## Getting Started

First, run the development server:

```bash
npm run dev
# or

# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

- Next.js (App Router)
- React
- Shadcn UI (for modern components)
- Axios (API calls)
- Sonner (toast notifications)
- PapaParse (CSV parsing)

## Backend API

The backend is a Node.js/Express/Mongoose server (see `/backend`). Key endpoints:
- `/teachers` (register/login/logout)
- `/students` (CRUD)
- `/students/by-department` (fetch students by teacher department)
- `/students/bulk-upload` (bulk upload students)
