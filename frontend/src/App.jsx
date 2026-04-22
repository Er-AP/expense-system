import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [expenses, setExpenses] = useState([]);

  const url = "http://localhost:5000/api";

  const token = localStorage.getItem("token");

  const register = async () => {
    try {
      await axios.post(`${url}/register`, {
        name,
        email,
        password,
      });

      alert("Registered Successfully");
      setIsLogin(true);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      alert("Register Failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${url}/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      window.location.reload();
    } catch (error) {
      alert("Login Failed");
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${url}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addExpense = async () => {
    try {
      await axios.post(
        `${url}/expense`,
        {
          title,
          amount,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setAmount("");
      setCategory("");

      fetchExpenses();
    } catch (error) {
      alert("Failed to add expense");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, []);

  const total = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  if (!token) {
    return (
      <div className="container">
        <h1>💰 Expense Manager</h1>

        <div className="form-box">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isLogin ? (
            <button className="primary-btn" onClick={login}>
              Login
            </button>
          ) : (
            <button className="primary-btn" onClick={register}>
              Register
            </button>
          )}

          <p
            className="link-text"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Create new account"
              : "Already have account? Login"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>💸 Expense Dashboard</h1>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

      <div className="total-box">
        Total Expense: ₹{total}
      </div>

      <div className="expense-form">
        <input
          type="text"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button className="primary-btn" onClick={addExpense}>
          Add Expense
        </button>
      </div>

      <div className="cards">
        {expenses.map((item) => (
          <div className="card" key={item._id}>
            <h3>{item.title}</h3>
            <p className="amount">₹{item.amount}</p>
            <p className="category">{item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;