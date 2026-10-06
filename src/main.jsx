import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, ShoppingCart, Search, Plus, Minus, Trash2 } from "lucide-react";
import "./styles.css";

const API = "/api";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, category });
    const response = await fetch(`${API}/products?${params}`);
    const data = await response.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category))],
    [products]
  );

  const addToCart = product => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart(current =>
      current
        .map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0)
    );
  };

  const removeItem = id => setCart(current => current.filter(item => item.id !== id));

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div>
      <header className="header">
        <div className="brand">
          <BookOpen size={28} />
          <span>VAM Books</span>
        </div>
        <button className="cart-button" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={20} />
          Cart ({cartCount})
        </button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">BOOKS • STATIONERY • LEARNING</p>
          <h1>Find your next great read.</h1>
          <p className="hero-text">
            Discover books, stationery and useful products for readers and learners.
          </p>
        </div>
      </section>

      <main className="container">
        <div className="toolbar">
          <div className="search">
            <Search size={19} />
            <input
              placeholder="Search books and products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="empty">Loading products...</div>
        ) : (
          <div className="grid">
            {products.map(product => (
              <article className="card" key={product.id}>
                <img src={product.image_url} alt={product.name} />
                <div className="card-body">
                  <span className="category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="card-footer">
                    <strong>₹{Number(product.price).toFixed(2)}</strong>
                    <button onClick={() => addToCart(product)}>
                      <Plus size={17} /> Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button className="close" onClick={() => setCartOpen(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty">Your cart is empty.</div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.image_url} alt={item.name} />
                      <div className="cart-info">
                        <strong>{item.name}</strong>
                        <span>₹{Number(item.price).toFixed(2)}</span>
                        <div className="qty">
                          <button onClick={() => changeQty(item.id, -1)}><Minus size={14}/></button>
                          <span>{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)}><Plus size={14}/></button>
                          <button className="remove" onClick={() => removeItem(item.id)}><Trash2 size={15}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Total</span>
                  <strong>₹{total.toFixed(2)}</strong>
                </div>
                <button className="checkout">Proceed to Checkout</button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
