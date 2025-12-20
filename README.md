# Timetable Scheduler Frontend

## Project Overview

The Timetable Scheduler Frontend is a comprehensive web application designed for educational institutions to manage and visualize academic timetables. Built with React 18 and modern web technologies, this application provides intuitive interfaces for both administrators and students to interact with timetable data effectively.

The application serves as the client-side component of a complete timetable management system, offering responsive design, real-time data visualization, and comprehensive administrative controls. It facilitates the creation, management, and viewing of academic schedules with built-in conflict detection and resolution capabilities.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation Guide](#installation-guide)
6. [Configuration](#configuration)
7. [User Interfaces](#user-interfaces)
8. [Component Documentation](#component-documentation)
9. [API Integration](#api-integration)
10. [Development Guidelines](#development-guidelines)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)

## Features

### Administrative Features

**Comprehensive Timetable Management**

- Create, edit, and delete academic timetables
- Multi-semester and multi-year support
- Department and level-based organization
- Automatic conflict detection and prevention
- Real-time validation and error handling

**Academic Structure Management**

- Department creation and management
- Level and course administration
- Teacher and room resource management
- Hierarchical data organization

**Advanced Scheduling**

- Time slot creation and modification
- Room and teacher availability checking
- Automatic clash detection for rooms and instructors
- Flexible scheduling constraints

**Data Visualization**

- Interactive timetable grids
- Multiple view modes (by level, department, room)
- Visual conflict highlighting
- Responsive data tables and cards

**System Administration**

- User authentication and authorization
- Data export and reporting capabilities
- System settings and configuration
- Audit trails and logging

### Student Features

**Timetable Access**

- Personal timetable viewing
- Course schedule browsing
- Multi-format timetable display
- Mobile-optimized interface

**Course Information**

- Detailed course descriptions
- Instructor information
- Room and time details
- Academic year and semester filtering

**Interactive Features**

- Course detail modals
- Search and filtering capabilities
- PDF export functionality
- Responsive design for all devices

### Technical Features

**Performance Optimizations**

- Lazy loading and code splitting
- Efficient state management
- Optimized API calls and caching
- Responsive image and resource loading

**Accessibility and UX**

- WCAG compliant design patterns
- Keyboard navigation support
- Screen reader compatibility
- Progressive web app capabilities

**Cross-Platform Compatibility**

- Desktop browser optimization
- Mobile and tablet responsive design
- Touch-friendly interface elements
- Cross-browser compatibility

## Architecture

### Application Architecture

The frontend follows a modular React architecture with clear separation of concerns:

**Presentation Layer**: React components handling user interface and user interactions
**Business Logic Layer**: Custom hooks and utility functions managing application logic
**Data Layer**: API integration and state management for data persistence
**Routing Layer**: React Router for navigation and route protection

### Component Hierarchy

```
App Component
├── Router Configuration
├── Route Protection
└── Main Layout
    ├── Header Component
    ├── Navigation Components
    └── Page Components
        ├── Home Page
        ├── Login Page
        ├── Admin Dashboard
        └── Student Portal
```

### State Management Pattern

The application uses React's built-in state management with strategic state lifting and context where appropriate. Local component state handles UI-specific data, while shared state is managed at the appropriate parent component level.

### Data Flow Architecture

1. **User Interactions**: Captured by UI components
2. **Event Handlers**: Process user inputs and validation
3. **API Calls**: Communicate with backend services
4. **State Updates**: Reflect changes in the user interface
5. **UI Re-rendering**: Display updated information to users

## Technology Stack

### Core Technologies

**React 18.2.0**: Modern React with concurrent features, hooks, and functional components
**React DOM 18.2.0**: DOM manipulation and rendering library
**React Router DOM 6.8.0**: Client-side routing and navigation management

### Build Tools and Development

**Vite 7.2.4**: Fast build tool and development server with hot module replacement
**Vitejs Plugin React 4.7.0**: React integration for Vite with Fast Refresh support

### Styling and UI Framework

**Tailwind CSS 4.1.17**: Utility-first CSS framework for rapid UI development
**Tailwind CLI 4.1.17**: Command-line interface for Tailwind CSS processing
**Tailwind Vite Plugin 4.1.17**: Vite integration for Tailwind CSS
**Autoprefixer 10.4.14**: CSS vendor prefix automation

### HTTP Client and Data Management

**Axios 1.13.2**: HTTP client for API communication with interceptors and request/response handling

### Document Generation

**html2pdf.js 0.12.1**: Client-side PDF generation from HTML content

## Project Structure

```
src/
├── components/                 # Reusable UI components
│   ├── AdminDashboard/        # Admin-specific components
│   │   ├── DeleteConfirmModal.jsx
│   │   ├── DepartmentsTab.jsx
│   │   ├── EditTimetableModal.jsx
│   │   ├── NavigationTabs.jsx
│   │   ├── OverviewTab.jsx
│   │   ├── SettingsTab.jsx
│   │   ├── SlotModal.jsx
│   │   ├── TimetableViewTab.jsx
│   │   ├── TimetablesTab.jsx
│   │   └── index.js
│   ├── StudentPortal/         # Student-specific components
│   │   ├── CourseDetailModal.jsx
│   │   ├── CourseSearch.jsx
│   │   ├── SelectionCards.jsx
│   │   └── TimetableView.jsx
│   ├── TimetableGrid/         # Timetable visualization
│   │   └── TimetableGrid.jsx
│   ├── common/                # Shared UI components
│   │   ├── Breadcrumb.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   └── index.js
│   ├── icons/                 # Icon components
│   │   └── index.jsx
│   └── layout/                # Layout components
│       ├── Footer.jsx
│       └── Header.jsx
├── pages/                     # Main page components
│   ├── AdminDashboard.jsx     # Admin control panel
│   ├── AdminTimetableView.jsx # Admin timetable display
│   ├── Home.jsx              # Landing page
│   ├── Loading.jsx           # Loading screen
│   ├── Login.jsx             # Authentication page
│   ├── NotFound.jsx          # 404 error page
│   ├── StudentPortal.jsx     # Student interface
│   └── index.js
├── utils/                     # Utility functions
│   ├── api.js                # API communication layer
│   ├── helpers.js            # Helper functions
│   └── storage.js            # Local storage management
├── constants/                 # Application constants
│   └── index.js
├── data/                     # Sample and static data
│   ├── sampleData.js
│   └── timetableData.js
├── hooks/                    # Custom React hooks
│   └── index.js
├── App.jsx                   # Main application component
├── main.jsx                  # Application entry point
└── index.css                 # Global styles and Tailwind imports
```

### Component Organization Philosophy

**Pages**: Top-level route components that represent entire screens
**Components**: Reusable UI elements organized by feature or functionality
**Common**: Shared components used across multiple features
**Utils**: Business logic and utility functions separate from UI concerns
**Constants**: Application-wide constants and configuration values

## Installation Guide

### Prerequisites

Before installing the application, ensure you have the following installed on your system:

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control and repository cloning
- **Backend API**: The timetable manager backend should be running (see backend README)

### Step-by-Step Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd Time_Table_Scheduler_frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   Or using alternative package managers:

   ```bash
   # Using yarn
   yarn install

   # Using pnpm
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the project root (optional - defaults work for development):

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_TITLE=Timetable Scheduler
   VITE_APP_VERSION=1.0.0
   ```

   **Note**: If using Docker for the backend, ensure the backend is accessible at `http://localhost:5000`

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5173` (Vite default port)

5. **Verify Installation**

   - Open your browser and navigate to `http://localhost:5173`
   - You should see the home page
   - Ensure the backend API is running and accessible

### Alternative Installation Methods

**Using Yarn**

```bash
yarn install
yarn dev
```

**Using Docker** (if Dockerfile is available)

```bash
# Build Docker image
docker build -t timetable-frontend .

# Run container
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=http://localhost:5000/api \
  timetable-frontend
```

**Note**: For production builds, use `npm run build` and serve the `dist` folder with a web server like Nginx.

## Configuration

### Environment Variables

The application uses environment variables for configuration management. Create a `.env` file in the project root (optional - defaults work for development):

**VITE_API_BASE_URL**: Backend API base URL

- Development: `http://localhost:5000/api`
- Production: Set to your deployed backend URL
- Default: `http://localhost:5000/api` (if not set)

**VITE_APP_TITLE**: Application title displayed in browser tab

- Default: "Timetable Scheduler"

**VITE_APP_VERSION**: Application version for display and debugging

- Default: "1.0.0"

**Example `.env` file:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=Timetable Scheduler
VITE_APP_VERSION=1.0.0
```

**Note**: Environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

### Vite Configuration

The application uses Vite for build tooling with the following key configurations:

```javascript
// vite.config.js
export default {
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
};
```

### Tailwind CSS Configuration

Custom Tailwind configuration for the design system:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      spacing: {
        // Custom spacing scale
      },
    },
  },
};
```

### API Configuration

The API client is configured in `src/utils/api.js` with:

- Automatic token attachment for authenticated requests
- Request and response interceptors
- Error handling and retry logic
- Base URL configuration

## User Interfaces

### Administrator Interface

**Dashboard Overview**
The admin dashboard provides a comprehensive control panel with multiple tabs for different administrative functions:

- **Overview Tab**: System statistics, recent activities, and quick actions
- **Timetables Tab**: Complete timetable CRUD operations with advanced filtering
- **Departments Tab**: Department management with hierarchical organization
- **Timetable View Tab**: Visual timetable representation with conflict detection
- **Settings Tab**: System configuration and administrative preferences

**Timetable Management Features**

- Create new timetables with department and level association
- Edit existing timetables with real-time validation
- Delete timetables with confirmation dialogs
- Publish/unpublish timetables for student visibility
- Bulk operations for efficient management

**Scheduling Interface**

- Interactive time slot creation and modification
- Drag-and-drop functionality for schedule adjustments
- Real-time conflict detection with visual indicators
- Multiple view modes for different organizational perspectives
- Export capabilities for reporting and documentation

**Resource Management**

- Teacher assignment and availability tracking
- Room allocation and capacity management
- Course scheduling with prerequisite checking
- Equipment and resource booking integration

### Student Interface

**Portal Overview**
The student portal focuses on timetable viewing and course information with:

- **Dashboard**: Personalized view of current semester schedule
- **Course Browser**: Detailed course information and descriptions
- **Schedule Views**: Multiple format options for timetable display
- **Search and Filter**: Advanced filtering by department, level, or instructor

**Timetable Viewing Features**

- Weekly and daily schedule views
- Course detail modal with comprehensive information
- PDF export for offline access
- Mobile-optimized responsive design
- Accessibility features for all users

**Interactive Elements**

- Course selection and filtering
- Search functionality with real-time results
- Responsive data visualization
- Touch-friendly mobile interface

### Responsive Design Implementation

**Breakpoint Strategy**

- Mobile: 320px - 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: 1024px+ (lg, xl)

**Adaptive Components**

- Navigation transforms to mobile menu
- Data tables become card layouts on mobile
- Modal dialogs adapt to screen size
- Touch targets optimized for mobile interaction

**Performance Considerations**

- Lazy loading for large datasets
- Image optimization for different screen densities
- Efficient re-rendering strategies
- Progressive enhancement principles

## Component Documentation

### Page Components

**AdminDashboard.jsx**
The central administrative interface managing all timetable operations:

```jsx
// Key Features:
- State management for all admin operations
- Authentication and authorization checking
- Data fetching and caching strategies
- Error handling and user feedback
- Modal management and form handling

// Props: None (top-level page component)
// State: Complex state management for timetables, departments, users
// Hooks: useEffect for data loading, useState for local state
```

**StudentPortal.jsx**
Student-focused interface for viewing and interacting with timetables:

```jsx
// Key Features:
- Timetable visualization and filtering
- Course information display
- PDF export functionality
- Responsive design implementation
- Search and filtering capabilities

// Props: None (top-level page component)
// State: Timetable data, filter states, UI control states
// Context: User preferences and session data
```

### Administrative Components

**TimetablesTab.jsx**
Manages all timetable-related operations with comprehensive CRUD functionality:

- **Data Management**: Handles timetable creation, editing, and deletion
- **Validation**: Real-time form validation with error messaging
- **State Synchronization**: Maintains consistency between local and server state
- **UI Responsiveness**: Adaptive layouts for different screen sizes

**DepartmentsTab.jsx**
Provides department management with hierarchical organization:

- **CRUD Operations**: Complete department lifecycle management
- **Relationship Management**: Handles department-level-course relationships
- **Data Validation**: Ensures data integrity and business rule compliance
- **Responsive Design**: Mobile-optimized interface for all operations

**SlotModal.jsx**
Advanced modal component for time slot creation and editing:

- **Conflict Detection**: Real-time checking for scheduling conflicts
- **Resource Validation**: Teacher and room availability verification
- **Form Management**: Complex form state with validation
- **Accessibility**: ARIA compliance and keyboard navigation

### Student Components

**TimetableView.jsx**
Primary component for displaying student timetables:

- **Data Visualization**: Multiple format support for timetable display
- **Filtering System**: Advanced filtering by multiple criteria
- **Export Functionality**: PDF generation with customization options
- **Responsive Grid**: Adaptive grid layout for different devices

**CourseDetailModal.jsx**
Modal component providing detailed course information:

- **Information Display**: Comprehensive course details and metadata
- **Interactive Elements**: Links to related resources and information
- **Accessibility**: Screen reader support and keyboard navigation
- **Mobile Optimization**: Touch-friendly interface design

### Utility Components

**NavigationTabs.jsx**
Flexible tab component with responsive behavior:

- **Dynamic Tab Management**: Programmatic tab addition and removal
- **State Management**: Active tab state with persistence
- **Responsive Design**: Mobile dropdown conversion
- **Accessibility**: Full keyboard navigation and ARIA support

**DeleteConfirmModal.jsx**
Reusable confirmation dialog with safety features:

- **Action Confirmation**: Prevents accidental deletions
- **Customizable Content**: Flexible messaging and action buttons
- **Accessibility**: Focus management and escape key handling
- **Animation Support**: Smooth enter and exit transitions

## API Integration

### Architecture Overview

The frontend communicates with the backend through a well-structured API layer built on Axios with comprehensive error handling and authentication management.

### API Client Configuration

```javascript
// Base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication interceptor
api.interceptors.request.use((config) => {
  const token = getFromStorage('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      removeFromStorage('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### API Endpoints and Methods

**Authentication Services**

```javascript
// User authentication and session management
authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  validateToken: () => api.get('/auth/validate'),
  refreshToken: () => api.post('/auth/refresh'),
};
```

**Timetable Management Services**

```javascript
// Complete timetable CRUD operations
timetablesAPI = {
  getAll: (params) => api.get('/timetables', { params }),
  getById: (id) => api.get(`/timetables/${id}`),
  create: (data) => api.post('/timetables', data),
  update: (id, data) => api.put(`/timetables/${id}`, data),
  delete: (id) => api.delete(`/timetables/${id}`),
  publish: (id) => api.patch(`/timetables/${id}/publish`),
  unpublish: (id) => api.patch(`/timetables/${id}/unpublish`),
};
```

**Department and Organization Services**

```javascript
// Academic structure management
departmentsAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

levelsAPI = {
  getAll: () => api.get('/levels'),
  getByDepartment: (deptId) => api.get(`/levels?department_id=${deptId}`),
};
```

**Course and Scheduling Services**

```javascript
// Course and time slot management
coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getByLevel: (levelId) => api.get(`/courses?level_id=${levelId}`),
};

slotsAPI = {
  create: (data) => api.post('/slots', data),
  update: (id, data) => api.put(`/slots/${id}`, data),
  delete: (id) => api.delete(`/slots/${id}`),
  checkConflicts: (data) => api.post('/slots/check-conflicts', data),
};
```

### Error Handling Strategy

**Centralized Error Management**
The application implements a comprehensive error handling strategy:

```javascript
// Global error handler
const handleAPIError = (error, context = '') => {
  const message =
    error.response?.data?.error ||
    error.message ||
    'An unexpected error occurred';

  // Log error for debugging
  console.error(`API Error [${context}]:`, error);

  // Display user-friendly message
  setError(message);

  // Handle specific error types
  switch (error.response?.status) {
    case 400: // Bad Request
      // Handle validation errors
      break;
    case 403: // Forbidden
      // Handle authorization errors
      break;
    case 404: // Not Found
      // Handle resource not found
      break;
    case 500: // Internal Server Error
      // Handle server errors
      break;
  }
};
```

**Retry Logic and Recovery**

```javascript
// Automatic retry for failed requests
const apiWithRetry = async (apiCall, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      await delay(1000 * attempt); // Exponential backoff
    }
  }
};
```

### Data Flow and State Management

**API Data Flow Pattern**

1. **Component Trigger**: User action initiates API call
2. **Loading State**: UI shows loading indicators
3. **API Request**: Axios processes the request with interceptors
4. **Response Handling**: Success or error response processing
5. **State Update**: Component state updated with new data
6. **UI Update**: React re-renders affected components

**Caching Strategy**

```javascript
// Simple caching implementation
const cache = new Map();

const getCachedData = async (key, apiCall, ttl = 300000) => {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await apiCall();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

## Development Guidelines

### Code Style and Standards

**JavaScript/JSX Standards**

- Use ES6+ syntax and features consistently
- Implement functional components with hooks
- Follow React best practices for component design
- Use destructuring for props and state variables
- Implement proper error boundaries where appropriate

**Naming Conventions**

- **Components**: PascalCase (e.g., `TimetableView`, `CourseModal`)
- **Functions**: camelCase (e.g., `handleSubmit`, `validateForm`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `DEFAULT_PAGE_SIZE`)
- **Files**: PascalCase for components, camelCase for utilities

**Component Structure Guidelines**

```jsx
// Recommended component structure
import React, { useState, useEffect } from 'react';
import { ComponentDependencies } from './dependencies';

const ComponentName = ({ prop1, prop2, ...props }) => {
  // Hooks (useState, useEffect, etc.)
  const [state, setState] = useState(initialValue);

  // Event handlers
  const handleEvent = (event) => {
    // Event handling logic
  };

  // Effects and lifecycle methods
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Early returns for conditional rendering
  if (!prop1) return null;

  // Main component render
  return <div className='component-container'>{/* Component JSX */}</div>;
};

export default ComponentName;
```

### Performance Optimization

**React Performance Best Practices**

- Use React.memo() for expensive components
- Implement useCallback() for stable function references
- Apply useMemo() for expensive calculations
- Optimize component re-renders with proper dependency arrays
- Implement code splitting for large component trees

**Bundle Optimization**

```javascript
// Lazy loading implementation
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>;
```

**API Optimization**

- Implement request deduplication for simultaneous calls
- Use pagination for large data sets
- Implement intelligent caching strategies
- Minimize API calls through efficient state management

### Testing Strategy

**Unit Testing Guidelines**

- Test component rendering and behavior
- Mock external dependencies and API calls
- Test user interactions and event handling
- Verify accessibility and keyboard navigation
- Test error states and edge cases

**Integration Testing Approach**

- Test component integration and data flow
- Verify API integration and error handling
- Test routing and navigation functionality
- Validate form submission and validation logic

**Testing Tools and Framework**

- React Testing Library for component testing
- Jest for test running and assertions
- MSW (Mock Service Worker) for API mocking
- Axe for accessibility testing

### Development Workflow

**Git Workflow Standards**

- Use feature branches for development
- Follow conventional commit message format
- Implement pull request reviews
- Maintain clean commit history
- Use semantic versioning for releases

**Development Environment Setup**

1. Install recommended VS Code extensions
2. Configure ESLint and Prettier for code formatting
3. Set up pre-commit hooks for code quality
4. Configure environment variables for development
5. Use React Developer Tools for debugging

**Code Review Guidelines**

- Review for functionality and business logic
- Check for performance implications
- Verify accessibility compliance
- Ensure proper error handling
- Validate responsive design implementation

## Deployment

### Build Process

**Production Build Configuration**

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Preview build locally
npm run preview
```

**Build Optimization**
The production build includes:

- JavaScript minification and optimization
- CSS purging and optimization
- Asset bundling and versioning
- Tree shaking for unused code removal
- Code splitting for optimal loading

### Environment Configuration

**Production Environment Variables**

```env
# Production API configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_TITLE=Timetable Scheduler
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Optional: Analytics and monitoring
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

### Deployment Options

**Static Site Hosting**
Deploy to platforms like Netlify, Vercel, or GitHub Pages:

```bash
# Build for production
npm run build

# Deploy dist folder to hosting platform
```

**Docker Deployment**

```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Server Deployment with Nginx**

```nginx
# Nginx configuration for SPA
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/timetable-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-server:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Performance Monitoring

**Production Monitoring Setup**

- Implement error tracking with Sentry or similar
- Set up performance monitoring with Web Vitals
- Configure analytics for user behavior tracking
- Monitor API response times and error rates
- Set up alerts for critical issues

## Troubleshooting

### Common Issues and Solutions

**Development Server Issues**

_Problem_: Development server won't start

```bash
# Solution: Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

_Problem_: Hot reloading not working

```bash
# Check Vite configuration and file watching limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Build and Deployment Issues**

_Problem_: Build fails with memory errors

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

_Problem_: Assets not loading in production

```javascript
// Check base URL configuration in vite.config.js
export default {
  base: '/your-app-path/', // Set correct base path
  // ... other config
};
```

**API Integration Issues**

_Problem_: CORS errors during development

```javascript
// Configure proxy in vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
};
```

_Problem_: Authentication token issues

```javascript
// Check token storage and retrieval
const token = getFromStorage('auth_token');
if (!token) {
  // Handle missing token
  redirectToLogin();
}
```

**Performance Issues**

_Problem_: Slow rendering with large datasets

```javascript
// Implement virtualization for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List height={600} itemCount={items.length} itemSize={50} itemData={items}>
    {Row}
  </List>
);
```

### Debugging Techniques

**React Developer Tools**

- Use React DevTools for component inspection
- Profile component performance and re-renders
- Debug state changes and prop passing
- Analyze component tree structure

**Browser Developer Tools**

- Monitor network requests and responses
- Debug JavaScript errors and warnings
- Analyze performance with Lighthouse
- Test responsive design with device emulation

**Logging and Monitoring**

```javascript
// Implement structured logging
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data),
  error: (message, data) => console.error(`[ERROR] ${message}`, data),
};

// Usage throughout application
logger.info('User login successful', { userId, timestamp });
```

### Error Recovery Strategies

**Graceful Error Handling**

```jsx
// Error boundary implementation
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to external service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Contributing

### Contribution Guidelines

**Getting Started**

1. Fork the repository
2. Create a feature branch from main
3. Make your changes with appropriate tests
4. Submit a pull request with detailed description

**Code Contribution Standards**

- Follow existing code style and conventions
- Include tests for new functionality
- Update documentation for API changes
- Ensure accessibility compliance
- Test on multiple browsers and devices

**Pull Request Process**

1. Ensure your branch is up to date with main
2. Run all tests and linting checks
3. Provide clear description of changes
4. Include screenshots for UI changes
5. Request review from maintainers

**Reporting Issues**
When reporting bugs or requesting features:

- Use provided issue templates
- Include steps to reproduce bugs
- Provide system and browser information
- Include relevant logs or screenshots
- Search existing issues before creating new ones

### Development Setup for Contributors

**Prerequisites for Contributors**

- Node.js 16+ and npm 8+
- Git with proper configuration
- Code editor with recommended extensions
- Basic knowledge of React and modern JavaScript

**Recommended Development Tools**

- Visual Studio Code with React extensions
- React Developer Tools browser extension
- Git GUI client or command line proficiency
- Postman or similar for API testing

---

## Quick Start Guide

### Prerequisites

- Node.js 16+ and npm 8+
- Backend API running (see backend README for setup)

### Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure environment
# Create .env file if you need custom API URL
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### Backend Connection

Ensure the backend API is running before starting the frontend:

**Using Docker (Recommended):**

```bash
cd ../timetable_manager_backend
docker compose up
```

**Or Locally:**

```bash
cd ../timetable_manager_backend
source venv/bin/activate
flask run
```

The frontend will connect to `http://localhost:5000/api` by default.

### Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run linter (if configured)
```

---

**Last Updated**: December 17, 2025
**Version**: 1.0.0

This comprehensive README provides a complete overview of the Timetable Scheduler Frontend application, covering all aspects from installation and configuration to development and deployment. The documentation serves as both a user guide and developer reference, enabling anyone to understand, use, and contribute to the project effectively.
