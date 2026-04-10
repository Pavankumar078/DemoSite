from flask import Flask, render_template, request, jsonify, session
import json, os, uuid
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'traditional_shop_secret_2024'

PRODUCTS = [
    {"id": 1, "name": "Royal Banarasi Saree", "category": "sarees", "price": 8500, "original_price": 12000,
     "description": "Handwoven pure silk Banarasi saree with intricate zari work and traditional motifs. Perfect for weddings and festivals.",
     "tag": "Bestseller", "fabric": "Pure Silk", "origin": "Varanasi, UP", "rating": 4.8, "reviews": 124,
     "colors": ["#8B0000", "#FFD700", "#006400"], "emoji": "🥻"},
    {"id": 2, "name": "Kanjivaram Silk Saree", "category": "sarees", "price": 15000, "original_price": 18000,
     "description": "Authentic Kanjivaram silk with temple border design. Rich in tradition and grandeur, ideal for special occasions.",
     "tag": "Premium", "fabric": "Kanjivaram Silk", "origin": "Kanchipuram, TN", "rating": 4.9, "reviews": 89,
     "colors": ["#4B0082", "#FF8C00", "#B22222"], "emoji": "🥻"},
    {"id": 3, "name": "Bandhani Lehenga Set", "category": "lehenga", "price": 6200, "original_price": 8500,
     "description": "Vibrant Bandhani tie-dye lehenga with choli and dupatta. A celebration of Rajasthani artistry.",
     "tag": "New Arrival", "fabric": "Georgette", "origin": "Jaipur, Rajasthan", "rating": 4.7, "reviews": 67,
     "colors": ["#FF1493", "#FF8C00", "#9400D3"], "emoji": "👗"},
    {"id": 4, "name": "Sherwani Royal Gold", "category": "mens", "price": 12000, "original_price": 16000,
     "description": "Luxurious embroidered sherwani with churidar. Perfect for grooms and festive celebrations.",
     "tag": "Exclusive", "fabric": "Brocade", "origin": "Lucknow, UP", "rating": 4.8, "reviews": 56,
     "colors": ["#DAA520", "#1C1C1C", "#8B4513"], "emoji": "🥷"},
    {"id": 5, "name": "Phulkari Dupatta", "category": "accessories", "price": 2200, "original_price": 3000,
     "description": "Traditional Punjabi Phulkari embroidery on cotton. Bright, colorful floral threadwork passed down generations.",
     "tag": "Handcrafted", "fabric": "Cotton", "origin": "Punjab", "rating": 4.6, "reviews": 203,
     "colors": ["#FF4500", "#FFD700", "#32CD32"], "emoji": "🧣"},
    {"id": 6, "name": "Chanderi Salwar Kameez", "category": "salwar", "price": 4500, "original_price": 6000,
     "description": "Elegant Chanderi fabric salwar kameez with delicate butidar weave. Lightweight and graceful for daily wear.",
     "tag": "Classic", "fabric": "Chanderi Silk", "origin": "Chanderi, MP", "rating": 4.5, "reviews": 91,
     "colors": ["#E6E6FA", "#FFB6C1", "#98FB98"], "emoji": "👘"},
    {"id": 7, "name": "Ikat Cotton Kurta Set", "category": "mens", "price": 3200, "original_price": 4200,
     "description": "Authentic Ikat printed cotton kurta with pajama. Geometric patterns that tell stories of Odisha's weaving heritage.",
     "tag": "Eco-Friendly", "fabric": "Handloom Cotton", "origin": "Sambalpuri, Odisha", "rating": 4.7, "reviews": 78,
     "colors": ["#000080", "#DC143C", "#006400"], "emoji": "👕"},
    {"id": 8, "name": "Patola Silk Saree", "category": "sarees", "price": 25000, "original_price": 32000,
     "description": "Double Ikat Patola saree - a rare masterpiece from Gujarat. Each saree takes months to weave with geometric precision.",
     "tag": "Heritage", "fabric": "Pure Silk", "origin": "Patan, Gujarat", "rating": 5.0, "reviews": 34,
     "colors": ["#8B0000", "#FFD700", "#000080"], "emoji": "🥻"},
    {"id": 9, "name": "Anarkali Embroidered Suit", "category": "salwar", "price": 5800, "original_price": 7500,
     "description": "Floor-length Anarkali with heavy embroidery. Timeless Mughal-inspired design with modern silhouette.",
     "tag": "Trending", "fabric": "Net & Satin", "origin": "Delhi", "rating": 4.6, "reviews": 112,
     "colors": ["#9400D3", "#FF69B4", "#006400"], "emoji": "👗"},
]

ORDERS = []

@app.route('/')
def index():
    return render_template('index.html', products=PRODUCTS)

@app.route('/api/products')
def get_products():
    category = request.args.get('category', 'all')
    sort = request.args.get('sort', 'default')
    filtered = PRODUCTS if category == 'all' else [p for p in PRODUCTS if p['category'] == category]
    if sort == 'price_asc':
        filtered = sorted(filtered, key=lambda x: x['price'])
    elif sort == 'price_desc':
        filtered = sorted(filtered, key=lambda x: x['price'], reverse=True)
    elif sort == 'rating':
        filtered = sorted(filtered, key=lambda x: x['rating'], reverse=True)
    return jsonify(filtered)

@app.route('/api/product/<int:pid>')
def get_product(pid):
    product = next((p for p in PRODUCTS if p['id'] == pid), None)
    if not product:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(product)

@app.route('/api/cart', methods=['GET'])
def get_cart():
    cart = session.get('cart', [])
    total = sum(item['price'] * item['quantity'] for item in cart)
    return jsonify({'items': cart, 'total': total, 'count': sum(i['quantity'] for i in cart)})

@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    data = request.json
    cart = session.get('cart', [])
    product = next((p for p in PRODUCTS if p['id'] == data['id']), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    existing = next((i for i in cart if i['id'] == data['id'] and i.get('color') == data.get('color') and i.get('size') == data.get('size')), None)
    if existing:
        existing['quantity'] += data.get('quantity', 1)
    else:
        cart.append({
            'id': product['id'], 'name': product['name'], 'price': product['price'],
            'emoji': product['emoji'], 'quantity': data.get('quantity', 1),
            'color': data.get('color', product['colors'][0]),
            'size': data.get('size', 'M')
        })
    session['cart'] = cart
    session.modified = True
    total = sum(item['price'] * item['quantity'] for item in cart)
    return jsonify({'success': True, 'count': sum(i['quantity'] for i in cart), 'total': total})

@app.route('/api/cart/remove', methods=['POST'])
def remove_from_cart():
    data = request.json
    cart = session.get('cart', [])
    cart = [i for i in cart if not (i['id'] == data['id'] and i.get('size') == data.get('size'))]
    session['cart'] = cart
    session.modified = True
    total = sum(item['price'] * item['quantity'] for item in cart)
    return jsonify({'success': True, 'count': sum(i['quantity'] for i in cart), 'total': total})

@app.route('/api/cart/update', methods=['POST'])
def update_cart():
    data = request.json
    cart = session.get('cart', [])
    for item in cart:
        if item['id'] == data['id'] and item.get('size') == data.get('size'):
            item['quantity'] = max(1, data['quantity'])
    session['cart'] = cart
    session.modified = True
    total = sum(item['price'] * item['quantity'] for item in cart)
    return jsonify({'success': True, 'total': total})

@app.route('/api/order', methods=['POST'])
def place_order():
    data = request.json
    cart = session.get('cart', [])
    if not cart:
        return jsonify({'error': 'Cart is empty'}), 400
    order_id = str(uuid.uuid4())[:8].upper()
    order = {
        'id': order_id, 'items': cart,
        'customer': data.get('customer', {}),
        'total': sum(i['price'] * i['quantity'] for i in cart),
        'timestamp': datetime.now().strftime('%d %b %Y, %I:%M %p'),
        'status': 'Confirmed'
    }
    ORDERS.append(order)
    session['cart'] = []
    session.modified = True
    return jsonify({'success': True, 'order_id': order_id, 'order': order})

@app.route('/api/search')
def search():
    q = request.args.get('q', '').lower()
    results = [p for p in PRODUCTS if q in p['name'].lower() or q in p['category'].lower() or q in p['fabric'].lower()]
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
