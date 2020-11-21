//import React from 'react'
const React = module['react']
//import DashboardLayout from './layouts/DashboardLayout'
//import MainLayout from './layouts/MainLayout'
//import AccountView from './views/account/AccountView'
//import CustomerListView from './views/customer/CustomerListView'
import HeaderLayout from '/appx/pages/layouts/headerLayout'
import ConsoleLayout from '/appx/pages/layouts/consoleLayout'
import Home from '/appx/pages/landing/Home'
import SignInSide from '/appx/pages/auth/SignInSide'
//import DashboardView from '/appx/views/reports/DashboardView'
import NotFoundView from '/appx/views/errors/NotFoundView'
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
