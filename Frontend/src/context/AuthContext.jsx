import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedSubject = localStorage.getItem('selectedSubject');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    if (storedSubject) {
      setSelectedSubject(JSON.parse(storedSubject));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    setUser(res.data);
    setSelectedSubject(null);
    localStorage.setItem('user', JSON.stringify(res.data));
    localStorage.removeItem('selectedSubject');
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    return res.data;
  };

  const register = async (userData) => {
    const normalizedData = {
      ...userData,
      role: userData.role ? userData.role.toLowerCase() : 'student'
    };
    const res = await axios.post(`${API_URL}/auth/register`, normalizedData);
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    return res.data;
  };

  const updateClass = async (studentClass) => {
    const res = await axios.put(`${API_URL}/auth/class`, { studentClass });
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  };

  const setSubject = (subject) => {
    setSelectedSubject(subject);
    localStorage.setItem('selectedSubject', JSON.stringify(subject));
  };

  const clearSubject = () => {
    setSelectedSubject(null);
    localStorage.removeItem('selectedSubject');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, selectedSubject, loading, login, register, updateClass, setSubject, clearSubject, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
