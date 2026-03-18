import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import Auth from "../utils/auth";

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [wrongInfo, setWrongInfo] = useState('');

    const [login] = useMutation(LOGIN_USER);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login({ variables: { email, password: pass } });
            Auth.login(data.login.token);
        } catch (err) {
            setWrongInfo("Incorrect Username or Password -- Try again!");
        }
    }

    return (
        <div className="auth-form-container">
            <h2>Login</h2>
            <h4 style={{ color: 'red' }}>{wrongInfo}</h4>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" />
                <label htmlFor="password">password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <button type="submit">Log In</button>
            </form>
            <button className="link-btn" onClick={() => props.onFormSwitch()}>Don't have an account? Register here.</button>
        </div>
    )
}
export default Login;