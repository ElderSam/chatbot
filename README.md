# Instructions

## Backend
NOTE: using ``pnpm`` Node.js package manager.

1. create Nest.js project:  
``nest new backend``

2. remove ``.git`` folder in ``/backend`` (because I will have 2 projects in one repository): 
```
cd backend
rm -rf .git
```

### initial content
- Created AppController and AppService with a simple "Hello World!" endpoint.
- Added unit tests for AppController.
- Set up main application module and bootstrap function.
- Implemented end-to-end tests for the root GET endpoint.
- Configured TypeScript settings for the project.
- Updated documentation with initial tasks for backend development.