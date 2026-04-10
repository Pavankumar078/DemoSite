# 🥻 Vasudha — Traditional Indian Clothing Shop

A rich, interactive e-commerce website for traditional Indian clothing built with **Flask**, **HTML**, **CSS**, and **JavaScript**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install flask
```

### 2. Run the App
```bash
cd traditional_shop
python app.py
```

### 3. Open in Browser
```
http://localhost:5000
```

---

## ✨ Features

### 🛍️ Shopping
- **9 products** across Sarees, Lehenga, Salwar Suits, Men's Wear & Accessories
- **Filter by category** (All, Sarees, Lehenga, Salwar, Men's, Accessories)
- **Sort** by Featured / Price / Rating
- **Live search** with instant results
- **Product Quick View** modal with size, color, quantity selection
- **Add to Cart** with persistent session storage
- **Cart Sidebar** with quantity update & item removal
- **Full Checkout Flow** with customer details & payment method
- **Order confirmation** with unique Order ID

### 🎨 Design
- **Cinzel + Cormorant Garamond** luxury typography
- **Deep maroon & gold** traditional color palette
- **Mandala hero animation** with floating labels
- **Marquee strip** of Indian textile traditions
- **Scroll-triggered animations** on all cards
- **Toast notifications** for user feedback
- Fully **responsive** design

### 🗂️ Pages/Sections
1. **Hero** — Cinematic landing with animated mandala
2. **Marquee** — Scrolling textile traditions
3. **Collections** — Filterable product grid
4. **Heritage** — Brand story with stats
5. **Testimonials** — Customer reviews
6. **Contact** — Details + contact form
7. **Footer** — Links and social

---

## 🏗️ Project Structure

```
traditional_shop/
├── app.py                  # Flask backend & API
├── requirements.txt
├── templates/
│   └── index.html          # Main HTML template
└── static/
    ├── css/
    │   └── style.css       # Full CSS styling
    └── js/
        └── main.js         # Interactive JS
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main page |
| GET | `/api/products` | All products (supports `?category=` `?sort=`) |
| GET | `/api/product/<id>` | Single product |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add to cart |
| POST | `/api/cart/remove` | Remove from cart |
| POST | `/api/cart/update` | Update quantity |
| POST | `/api/order` | Place order |
| GET | `/api/search` | Search products |
