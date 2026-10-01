# XYZ Fulfillment Control Center

A demo fulfillment operations application for XYZ, built with React.js and Node.js/Express.

## Runtime compatibility

This version is specifically configured for **Node.js 20.11.0**.

The frontend intentionally uses **Vite 6.4.1** and **@vitejs/plugin-react 4.7.0** instead of Vite 7, which requires a newer Node.js runtime.

## Run the application

### Backend

```bash
cd backend
npm install
npm run dev
```

API: http://localhost:4000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## If you previously installed the old version

Delete the old frontend dependencies before installing the updated project:

Windows PowerShell:

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

Windows Command Prompt:

```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

## Main screens

- Dashboard
- Orders
- Order details
- Warehouse picking
- Inventory
- Exceptions

## Demo scenarios

The seeded data demonstrates priority orders, inventory discrepancies, secondary warehouse stock, picking exceptions, staging issues, and courier pickup tracking.
