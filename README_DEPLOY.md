# Deploy XYZ Fulfillment for Free

This version is configured for Node.js 20.11.0 and can be deployed as a single Render Web Service.

## Local

Terminal:

    cd frontend
    npm install
    npm run dev

Second terminal:

    cd backend
    npm install
    npm run dev

## Render

1. Push this repository to GitHub.
2. Create a Render account.
3. New -> Web Service -> connect the GitHub repository.
4. Select the Free plan.
5. If Render does not detect `render.yaml`, use:
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - Start Command: `node backend/src/server.js`
6. Deploy.

The Node server serves the React production build and the `/api` routes from the same domain, so no frontend API URL needs to be configured.
