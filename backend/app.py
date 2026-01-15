import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# DB_PATH = os.path.join(os.path.dirname(__file__), "mock_florist.db")
DB_PATH = os.path.join(os.path.dirname(__file__), "PetalPushers.db")

def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # ← add this
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

#Read
@app.route("/api/flowers")
def get_flowers():
    rows = query_db("SELECT * FROM Flower")
    return jsonify([dict(row) for row in rows])

@app.route("/api/arrangements")
def get_arrangements():
    rows = query_db("SELECT * FROM Arrangement")
    return jsonify([dict(row) for row in rows])

@app.route("/api/customers")
def get_customers():
    rows = query_db("SELECT * FROM Customer")
    return jsonify([dict(row) for row in rows])

@app.route("/api/orders")
def get_orders():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get all orders with customer info
    cur.execute("""
        SELECT o.order_id, o.customer_id, o.order_date, o.total_price, o.status, c.full_name AS customer_name
        FROM "Order" o
        JOIN Customer c ON o.customer_id = c.customer_id
        ORDER BY o.order_date DESC
    """)
    orders = [dict(row) for row in cur.fetchall()]

    # For each order, get the items
    for order in orders:
        cur.execute("""
            SELECT oi.item_type, oi.item_id, oi.quantity,
                CASE
                    WHEN oi.item_type = 'flower' THEN f.flower_name
                    WHEN oi.item_type = 'arrangement' THEN a.arrangement_name
                END AS name
            FROM Order_Item oi
            LEFT JOIN Flower f ON oi.item_type='flower' AND oi.item_id=f.flower_id
            LEFT JOIN Arrangement a ON oi.item_type='arrangement' AND oi.item_id=a.arrangement_id
            WHERE oi.order_id=?
        """, (order["order_id"],))
        order["items"] = [dict(row) for row in cur.fetchall()]

    conn.close()
    return jsonify(orders)

#Create
@app.route("/api/flowers", methods=["POST"])
def create_flower():
    data = request.get_json()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO Flower (flower_name, color, price, stock_quantity)
        VALUES (?, ?, ?, ?)
    """, (
        data["flower_name"],
        data["color"],
        data["price"],
        data.get("stock_quantity", 0)
    ))

    conn.commit()
    flower_id = cur.lastrowid
    conn.close()

    return jsonify({"flower_id": flower_id}), 201
    
@app.route("/api/arrangements", methods=["POST"])
def create_arrangement():
    data = request.get_json()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO Arrangement (arrangement_name, description, price)
        VALUES (?, ?, ?)
    """, (
        data["arrangement_name"],
        data.get("description"),
        data["price"]
    ))

    conn.commit()
    arrangement_id = cur.lastrowid
    conn.close()

    return jsonify({"arrangement_id": arrangement_id}), 201

@app.route("/api/customers", methods=["POST"])
def create_customer():
    data = request.get_json()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO Customer (full_name, phone_number, email_address, home_address)
        VALUES (?, ?, ?, ?)
    """, (
        data["full_name"],
        data.get("phone_number"),
        data["email_address"],
        data.get("home_address")
    ))

    conn.commit()
    customer_id = cur.lastrowid
    conn.close()

    return jsonify({"customer_id": customer_id}), 201
   
@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    total_price = 0

    # Calculate total
    for item in data["items"]:
        if item["item_type"] == "flower":
            cur.execute(
                "SELECT price FROM Flower WHERE flower_id = ?",
                (item["item_id"],)
            )
        else:
            cur.execute(
                "SELECT price FROM Arrangement WHERE arrangement_id = ?",
                (item["item_id"],)
            )

        price = cur.fetchone()[0]
        total_price += price * item["quantity"]

    status = data.get("status", "Shipped")

    # Insert order
    cur.execute("""
        INSERT INTO "Order" (customer_id, order_date, total_price, status)
        VALUES (?, ?, ?, ?)
    """, (
        data["customer_id"],
        datetime.now(),
        total_price,
        status
    ))

    order_id = cur.lastrowid

    # Insert order items
    for item in data["items"]:
        cur.execute("""
            INSERT INTO Order_Item (order_id, item_type, item_id, quantity)
            VALUES (?, ?, ?, ?)
        """, (
            order_id,
            item["item_type"],
            item["item_id"],
            item["quantity"]
        ))

    conn.commit()
    conn.close()

    return jsonify({"order_id": order_id}), 201

#Update
@app.route("/api/flowers/<int:flower_id>", methods=["PUT"])
def update_flower(flower_id):
    data = request.get_json()
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("""
            UPDATE Flower
            SET flower_name = ?, color = ?, price = ?, stock_quantity = ?
            WHERE flower_id = ?
        """, (
            data["flower_name"],
            data["color"],
            data["price"],
            data["stock_quantity"],
            flower_id
        ))

        conn.commit()
        conn.close()
        return jsonify({"message": "Flower updated"})
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/arrangements/<int:arrangement_id>", methods=["PUT"])
def update_arrangement(arrangement_id):
    data = request.get_json()
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("""
            UPDATE Arrangement
            SET arrangement_name = ?, description = ?, price = ?
            WHERE arrangement_id = ?
        """, (
            data["arrangement_name"],
            data.get("description"),
            data["price"],
            arrangement_id
        ))

        conn.commit()
        conn.close()
        return jsonify({"message": "Arrangement updated"})
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
  
@app.route("/api/customers/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    data = request.get_json()
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("""
            UPDATE Customer
            SET full_name = ?, phone_number = ?, email_address = ?, home_address = ?
            WHERE customer_id = ?
        """, (
            data["full_name"],
            data.get("phone_number"),
            data["email_address"],
            data.get("home_address"),
            customer_id
        ))

        conn.commit()
        conn.close()
        return jsonify({"message": "Customer updated"})
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders/<int:order_id>", methods=["PUT"])
def update_order(order_id):
    data = request.get_json()
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # Update customer if provided
        if "customer_id" in data:
            cur.execute("""
                UPDATE "Order"
                SET customer_id = ?
                WHERE order_id = ?
            """, (data["customer_id"], order_id))

        # Update order items if provided
        if "items" in data and data["items"]:
            # Delete old items
            cur.execute("DELETE FROM Order_Item WHERE order_id = ?", (order_id,))

            total_price = 0

            for item in data["items"]:
                # Determine item price safely
                if item["item_type"] == "flower":
                    cur.execute("SELECT price FROM Flower WHERE flower_id = ?", (item["item_id"],))
                else:
                    cur.execute("SELECT price FROM Arrangement WHERE arrangement_id = ?", (item["item_id"],))
                
                row = cur.fetchone()
                if row:
                    price = row[0]
                    total_price += price * item["quantity"]
                else:
                    # Skip invalid items
                    continue

                # Insert new item
                cur.execute("""
                    INSERT INTO Order_Item (order_id, item_type, item_id, quantity)
                    VALUES (?, ?, ?, ?)
                """, (order_id, item["item_type"], item["item_id"], item["quantity"]))

            # Update total price in the Order table
            cur.execute("""
                UPDATE "Order"
                SET total_price = ?
                WHERE order_id = ?
            """, (total_price, order_id))

        # Update status if provided
        if "status" in data:
            cur.execute("""
                UPDATE "Order"
                SET status = ?
                WHERE order_id = ?
            """, (data["status"], order_id))

        conn.commit()
        conn.close()
        return jsonify({"message": "Order updated"})
    
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

#Delete
@app.route("/api/flowers/<int:flower_id>", methods=["DELETE"])
def delete_flower(flower_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("DELETE FROM Flower WHERE flower_id = ?", (flower_id,))

        conn.commit()
        conn.close()
        return jsonify({"message": "Flower deleted"})
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/arrangements/<int:arrangement_id>", methods=["DELETE"])
def delete_arrangement(arrangement_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute(
            "DELETE FROM Arrangement WHERE arrangement_id = ?",
            (arrangement_id,)
        )

        conn.commit()
        conn.close()
        return jsonify({"message": "Arrangement deleted"})
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/customers/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute(
            "DELETE FROM Customer WHERE customer_id = ?",
            (customer_id,)
        )

        conn.commit()
        conn.close()
        return jsonify({"message": "Customer deleted"})
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # Delete order items first
        cur.execute(
            "DELETE FROM Order_Item WHERE order_id = ?",
            (order_id,)
        )

        # Delete order
        cur.execute(
            'DELETE FROM "Order" WHERE order_id = ?',
            (order_id,)
        )

        conn.commit()
        conn.close()
        return jsonify({"message": "Order deleted"})
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)