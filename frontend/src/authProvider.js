import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from "axios";

const AuthContext = createContext(null);

const BASE_URL = "http://localhost:8000/api";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('user_name'))
    const [access_token, setAccess_token] = useState(localStorage.getItem('access_token'))
    const [refresh_token, setRefresh_token] = useState(localStorage.getItem('refresh_token'))
    useEffect(() => {
        if(token) {
            localStorage.setItem('user_name', token);
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
        }
        else localStorage.removeItem('token')
    }, [token, access_token])

    const login = (newToken, newAccess_token, newRefresh_token) => {
        setToken(newToken);
        setAccess_token(newAccess_token);
        setRefresh_token(newRefresh_token);
    };

    const refresh_access_token = () => {
        axios.post(`${BASE_URL}/refresh`, {
            refresh: localStorage.getItem('refresh_token')
        })
        .then((res) => {
            localStorage.setItem('access_token', res.data.access);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    const logout = () => {
        localStorage.setItem('refresh_token', null);
        localStorage.setItem('access_token', null);
        localStorage.setItem('user_name', null);
        setToken(null);
        setAccess_token(null);
        setRefresh_token(null);
    }

    const value = { token, login, refresh_access_token, logout };

    return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};