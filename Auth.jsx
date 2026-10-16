import { useState } from "react";
import { loginUser, registerUser } from "./auth.js";
import "./Auth.css";

function Auth({ onLogin }) {
const [isRegister, setIsRegister] = useState(false);
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [loading, setLoading] = useState(false);


async function handleSubmit(event) {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    let data;

    if (isRegister) {
      await registerUser(name, email, password);
    }

    data = await loginUser(email, password);

    if (!data.token) {
      throw new Error("Login succeeded, but the server did not return a token.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("Token saved:", localStorage.getItem("token") !== null);

    onLogin(data.user);
  } catch (err) {
    setError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
}



function toggleMode() {
setIsRegister((previous) => !previous);
setError("");
setSuccess("");
setPassword("");
}

return ( <div className="auth-page"> <div className="auth-card"> <div className="auth-brand">TaskFlow</div>


    <h1>{isRegister ? "Create your account" : "Welcome back!"}</h1>

    <p className="auth-subtitle">
      {isRegister
        ? "Create an account to manage your tasks."
        : "Sign in to continue to your dashboard."}
    </p>

    {error && (
      <div className="auth-error" role="alert">
        {error}
      </div>
    )}

    {success && (
      <div className="auth-success" role="status">
        {success}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      {isRegister && (
        <div className="auth-field">
          <label htmlFor="auth-name">Full name</label>

          <input
            id="auth-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="auth-email">Email address</label>

        <input
          id="auth-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="auth-field">
        <label htmlFor="auth-password">Password</label>

        <input
          id="auth-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={8}
          maxLength={72}
          required
        />
      </div>

      <button
        className="auth-submit"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Please wait..."
          : isRegister
            ? "Create Account"
            : "Sign In"}
      </button>
    </form>

    <div className="auth-switch">
      <span>
        {isRegister
          ? "Already have an account?"
          : "Don't have an account?"}
      </span>

      <button type="button" onClick={toggleMode} disabled={loading}>
        {isRegister ? "Sign In" : "Register"}
      </button>
    </div>
  </div>
</div>


);
}

export default Auth;
