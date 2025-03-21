import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import PrivateRoute from './components/PrivateRouter';

import Home from './views/Home';
import Login from './views/user/Login';
import Profile from './views/user/Profile';
import Register from './views/user/Register';

import Organization from './views/organization/Organization';
import OrganizationForm from './views/organization/OrganizationForm';

import Product from './views/product/Product';
import ProductForm from './views/product/ProductForm';
import ProductList from './views/product/ProductList';

import Content from './views/content/Content';
import ContentForm from './views/content/ContentForm';
import ContentList from './views/content/ContentList';

function App() {
  return (
    <div className="App">
      <header>
        <Navbar/>
      </header>
      <main>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            <Route path="/organization/:id" element={<PrivateRoute><Organization /></PrivateRoute>} />
            <Route path="/organization/form/:id?" element={<PrivateRoute><OrganizationForm /></PrivateRoute>} />

            <Route path="/products" element={<PrivateRoute><ProductList/></PrivateRoute>} />
            <Route path="/product/:id" element={<PrivateRoute><Product/></PrivateRoute>} />
            <Route path="/product/form/:id?" element={<PrivateRoute><ProductForm/></PrivateRoute>} />

            <Route path="/contents" element={<PrivateRoute><ContentList/></PrivateRoute>} />
            <Route path="/content/:id" element={<PrivateRoute><Content/></PrivateRoute>} />
            <Route path="/content/form/:id?" element={<PrivateRoute><ContentForm/></PrivateRoute>} />

            <Route path="*" element={<NotFound/>}/>
        </Routes>
      </main>
    </div>
  );
}

export default App;
