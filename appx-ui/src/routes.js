import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import MainLayout from './layouts/MainLayout';
//import AccountView from './views/account/AccountView';
//import CustomerListView from './views/customer/CustomerListView';
import DashboardView from './views/reports/DashboardView';
//import LoginView from './views/auth/LoginView';
import Home from './pages/landing/Home';
import SignInSide from './pages/auth/SignInSide';
//import NotFoundView from './views/errors/NotFoundView';
//import ProductListView from './views/product/ProductListView';
//import RegisterView from './views/auth/RegisterView';
//import SettingsView from './views/settings/SettingsView';

const routes = [
  {
    path: 'app',
    element: <DashboardLayout />,
    children: [
        { path: 'dashboard', element: <DashboardView /> },
        /*
      { path: 'account', element: <AccountView /> },
      { path: 'customers', element: <CustomerListView /> },
      { path: 'products', element: <ProductListView /> },
      { path: 'settings', element: <SettingsView /> },
      { path: '*', element: <Navigate to="/404" /> }
      */
    ]
  },
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'login',
    element: <MainLayout />,
    children: [
      { path: '/', element: <SignInSide /> },
      /*
      { path: 'register', element: <RegisterView /> },
      { path: '404', element: <NotFoundView /> },
      { path: '/', element: <Navigate to="/app/dashboard" /> },
      { path: '*', element: <Navigate to="/404" /> }
      { path: '/', element: <Navigate to="/login" /> },
      */
    ]
  }
];

export default routes;
