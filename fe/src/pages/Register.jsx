import React from 'react';
import Login from './Login';

function Register() {
    // Reuse Login component with initial "register" mode so
    // both login/register live on one page with smooth switching.
    return <Login initialMode="register" />;
}

export default Register;
