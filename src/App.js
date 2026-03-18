import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import './App.css';
import Login from './Components/Login';
import Navbar from './Components/Navbar';
import Dashboard from "./pages/Dashboard";
import Calories from "./pages/Calories";
import { Register } from "./Components/Signup";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from "./pages/Homepage";
import AboutUs from "./pages/AboutUs";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_URL || 'http://localhost:3001/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const toggleForm = () => {
    if (window.location.pathname === '/login') {
      window.location.pathname = '/register'
    } else {
      window.location.pathname = '/login'
    }
  }

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <div>
          <nav>
            <Navbar />
          </nav>
          <Routes>
            <Route path='calories' element={<Calories />} />
            <Route path='login' element={<Login onFormSwitch={toggleForm} />} />
            <Route path='/' element={<Homepage />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='register' element={<Register onFormSwitch={toggleForm} />} />
            <Route path='/about-us' element={<AboutUs />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
