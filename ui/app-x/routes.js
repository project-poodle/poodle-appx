//import React from 'react'
const React = lib['react']
//import DashboardLayout from './layouts/DashboardLayout'
//import MainLayout from './layouts/MainLayout'
//import AccountView from './views/account/AccountView'
//import CustomerListView from './views/customer/CustomerListView'
import HeaderLayout from '/app-x/pages/layouts/headerLayout'
import ConsoleLayout from '/app-x/pages/layouts/consoleLayout'
import Home from '/app-x/pages/landing/Home'
import SignInSide from '/app-x/pages/auth/SignInSide'
//import DashboardView from '/app-x/views/reports/DashboardView'
import NotFoundView from '/app-x/views/errors/NotFoundView'
//import ProductListView from './views/product/ProductListView'
//import RegisterView from './views/auth/RegisterView'
//import SettingsView from './views/settings/SettingsView'


const routes = {
    '/': () => <Home/>,
    '/appx/login': () => <HeaderLayout><SignInSide/></HeaderLayout>,
    '/appx/console': () => <ConsoleLayout><NotFoundView/></ConsoleLayout>,
    '/404': () => <HeaderLayout><NotFoundView/></HeaderLayout>,
}

//console.log(routes)

export default routes;
