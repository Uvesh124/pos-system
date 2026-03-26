import React, { useState } from "react";

// --- MOCK USERS ---
const defaultUsers = [
  { username: "admin", password: "123", role: "admin" },
];

export default function POS() {
  const [users, setUsers] = useState(defaultUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [login, setLogin] = useState({ username: "", password: "" });

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const [cart, setCart] = useState([]);

  // --- LOGIN ---
  const handleLogin = () => {
    const user = users.find(
      (u) => u.username === login.username && u.password === login.password
    );
    if (user) setCurrentUser(user);
    else alert("Invalid Login");
  };

  // --- ADD USER (ADMIN ONLY) ---
  const addUser = () => {
    const username = prompt("New Username");
    const password = prompt("Password");
    if (!username || !password) return;

    setUsers([...users, { username, password, role: "user" }]);
  };

  // --- EXCEL IMPORT (CSV SIMPLE) ---
  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const text = evt.target.result;
      const rows = text.split("\n").slice(1);
      const parsed = rows.map((r) => {
        const [stock, company, item, rate] = r.split(",");
        return { stock, company, item, rate: Number(rate) };
      });
      setData(parsed);
    };

    reader.readAsText(file);
  };

  // --- FILTER ---
  const filtered = data.filter(
    (d) =>
      d.item?.toLowerCase().includes(search.toLowerCase()) &&
      (stockFilter ? d.stock === stockFilter : true) &&
      (companyFilter ? d.company === companyFilter : true)
  );

  // --- ADD ITEM ---
  const addItem = (item) => {
    const qty = prompt("Qty?");
    const rate = prompt("Rate?", item.rate);
    if (!qty || !rate) return;

    setCart([
      ...cart,
      { ...item, qty: Number(qty), rate: Number(rate) },
    ]);
  };

  const total = cart.reduce((sum, i) => sum + i.qty * i.rate, 0);

  // --- SUBMIT ---
  const handleSubmit = () => {
    const name = prompt("Customer Name");
    if (!name) return;

    const content = `Customer: ${name}\n\n${cart
      .map((i) => `${i.item} - ${i.qty} x ${i.rate}`)
      .join("\n")}\n\nTotal: ${total}`;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "receipt.txt";
    link.click();

    setCart([]);
  };

  // --- LOGIN UI ---
  if (!currentUser) {
    return (
      <div className="p-10 max-w-sm mx-auto">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          placeholder="Username"
          className="border p-2 w-full mb-2"
          onChange={(e) => setLogin({ ...login, username: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-2"
          onChange={(e) => setLogin({ ...login, password: e.target.value })}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full p-2"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">POS System</h2>
        <div>
          {currentUser.role === "admin" && (
            <button
              onClick={addUser}
              className="bg-green-500 text-white px-2 py-1 mr-2"
            >
              Add User
            </button>
          )}
          <button
            onClick={() => setCurrentUser(null)}
            className="bg-red-500 text-white px-2 py-1"
          >
            Logout
          </button>
        </div>
      </div>

      {/* IMPORT */}
      <input type="file" onChange={handleFile} className="mb-2" />

      {/* FILTERS */}
      <div className="flex gap-2 mb-2">
        <input
          placeholder="Search"
          className="border p-2"
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="Stock"
          className="border p-2"
          onChange={(e) => setStockFilter(e.target.value)}
        />
        <input
          placeholder="Company"
          className="border p-2"
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ITEMS */}
        <div className="border h-96 overflow-auto">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => addItem(item)}
            >
              {item.item} ({item.company})
            </div>
          ))}
        </div>

        {/* RECEIPT */}
        <div>
          <h3 className="font-bold mb-2">Receipt</h3>
          <div className="border p-2 h-80 overflow-auto">
            {cart.map((c, i) => (
              <div key={i} className="flex justify-between">
                <span>{c.item}</span>
                <span>
                  {c.qty} x {c.rate}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 font-bold">Total: {total}</div>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 mt-2"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}
