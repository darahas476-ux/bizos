import os, random, json, psycopg2
from faker import Faker
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
fake = Faker("en_IN")
random.seed(104)

conn = psycopg2.connect(os.environ["DATABASE_URL"])
cur = conn.cursor()
cur.execute("SELECT id FROM users WHERE business_name IS NOT NULL ORDER BY created_at DESC LIMIT 1")
row = cur.fetchone()
if not row:
    cur.execute("SELECT id FROM users ORDER BY created_at DESC LIMIT 1")
    row = cur.fetchone()
if not row:
    print("❌ Login first"); exit(1)
USER_ID = row[0]
print(f"✅ Seeding for {USER_ID}")

cur.execute("DELETE FROM entities WHERE user_id = %s", (USER_ID,))
today = datetime.now().date()

# ===== CUSTOMERS =====
CUSTOMERS = [
    ("Sharma Traders", "Mumbai", "top5", 2100000, 12),
    ("Zenith Technologies LLP", "Bengaluru", "top5", 1750000, 15),
    ("Patel Precision Works", "Ahmedabad", "top5", 1480000, 18),
    ("ABC Enterprises Pvt Ltd", "Mumbai", "top5", 1120000, 22),
    ("XYZ Engineering Works", "Pune", "top5", 950000, 8),
    ("Mehta Industries", "Surat", "standard", 720000, 20),
    ("Iyer Trading Co", "Chennai", "standard", 640000, 25),
    ("Reddy Components", "Hyderabad", "standard", 520000, 30),
    ("Kulkarni Auto Parts", "Nashik", "standard", 480000, 14),
    ("Nair Engineering", "Kochi", "standard", 420000, 35),
]

customers = []
for name, city, tier, ltv, delay in CUSTOMERS:
    cur.execute(
        "INSERT INTO entities (user_id, type, name, data) VALUES (%s, 'customer', %s, %s) RETURNING id",
        (USER_ID, name, json.dumps({
            "tier": tier, "city": city,
            "gstin": fake.bothify(text="27?????####?#?#").upper(),
            "phone": f"+91 {random.randint(70,99)}{random.randint(10000000,99999999)}",
            "lifetime_value": ltv,
            "avg_payment_delay": delay,
            "customer_since": str(fake.date_between(start_date="-5y", end_date="-2y")),
        }))
    )
    customers.append((cur.fetchone()[0], name))
print(f"✅ {len(customers)} customers")

# ===== VENDORS =====
vendor_names = [
    ("Bharat Steel Suppliers Pvt Ltd", "Raw Material - Steel"),
    ("Surya Packaging Industries", "Packaging"),
    ("Delhivery Logistics", "Logistics"),
    ("Tata Precision Tools", "CNC Tools"),
    ("Kirloskar Fasteners Ltd", "Fasteners"),
    ("Asian Paints Industrial", "Coatings"),
]
vendors = []
for name, cat in vendor_names:
    cur.execute(
        "INSERT INTO entities (user_id, type, name, data) VALUES (%s, 'vendor', %s, %s) RETURNING id",
        (USER_ID, name, json.dumps({
            "category": cat, "rating": round(random.uniform(3.8, 5.0), 1),
            "payment_terms": random.choice(["Net 30", "Net 15", "Net 45"]),
            "gstin": fake.bothify(text="27?????####?#?#").upper(),
        }))
    )
    vendors.append((cur.fetchone()[0], name))
print(f"✅ {len(vendors)} vendors")

# ===== HERO INVOICE: INV-104 =====
cur.execute(
    "INSERT INTO entities (user_id, type, name, data) VALUES (%s, 'invoice', %s, %s)",
    (USER_ID, "INV-104", json.dumps({
        "customer_id": str(customers[0][0]),
        "customer_name": "Sharma Traders",
        "amount": 355932,
        "gst": 64068,
        "total": 420000,
        "issued_date": str(today - timedelta(days=65)),
        "due_date": str(today - timedelta(days=35)),
        "status": "overdue",
        "days_overdue": 35,
        "top_customer": True,
        "confidence": 0.94,
    }))
)
print("✅ INV-104 (hero): Sharma Traders · ₹4.2L · 35d overdue")

# ===== 4 OTHER OVERDUE INVOICES =====
for i, (cust_id, cust_name) in enumerate(customers[1:5]):
    total = random.randint(150000, 380000)
    issued = today - timedelta(days=random.randint(40, 80))
    due = issued + timedelta(days=30)
    cur.execute(
        "INSERT INTO entities (user_id, type, name, data) VALUES (%s, 'invoice', %s, %s)",
        (USER_ID, f"INV-{105 + i}", json.dumps({
            "customer_id": str(cust_id),
            "customer_name": cust_name,
            "total": total,
            "gst": int(total * 0.18),
            "amount": int(total * 0.82),
            "issued_date": str(issued),
            "due_date": str(due),
            "status": "overdue",
            "days_overdue": max(0, (today - due).days),
            "confidence": round(random.uniform(0.85, 0.97), 2),
        }))
    )

# ===== 20 PAID INVOICES =====
for i in range(20):
    cust_id, cust_name = random.choice(customers)
    total = random.randint(80000, 450000)
    issued = today - timedelta(days=random.randint(30, 180))
    paid = issued + timedelta(days=random.randint(10, 40))
    cur.execute(
        "INSERT INTO entities (user_id, type, name, data) VALUES (%s, 'invoice', %s, %s)",
        (USER_ID, f"INV-{200 + i}", json.dumps({
            "customer_id": str(cust_id),
            "customer_name": cust_name,
            "total": total,
            "gst": int(total * 0.18),
            "amount": int(total * 0.82),
            "issued_date": str(issued),
            "due_date": str(issued + timedelta(days=30)),
            "paid_date": str(paid),
            "status": "paid",
            "confidence": 0.98,
        }))
    )
print("✅ 25 invoices total (INV-104 + 4 overdue + 20 paid)")

# ===== TASKS =====
TASKS = [
    ("Follow up with Sharma Traders on ₹4.2L overdue", "Ravi", "high", "agent"),
    ("Send final reminder to Zenith Technologies", "Ravi", "high", "agent"),
    ("Verify GSTR-3B filing data", "Meera", "high", "user"),
    ("Negotiate with Bharat Steel Suppliers", "Ankit", "medium", "user"),
    ("Approve purchase order for raw material", "Ankit", "high", "user"),
    ("Schedule demo with Patel Precision Works", "Priya", "low", "user"),
    ("Reconcile bank statement", "Ravi", "low", "user"),
    ("Update DPDP consent ledger", "Meera", "medium", "user"),
]
for i, (title, owner, pri, src) in enumerate(TASKS):
    cur.execute(
        "INSERT INTO entities (user_id, type, name, data) VALUES (%s, 'task', %s, %s)",
        (USER_ID, title, json.dumps({
            "status": "open", "owner": owner, "priority": pri,
            "due_date": str(today + timedelta(days=i + 1)),
            "created_by": src,
        }))
    )
print(f"✅ {len(TASKS)} tasks")

# ===== ESG METRIC =====
cur.execute(
    "INSERT INTO entities (user_id, type, name, data) VALUES (%s, 'esg_metric', %s, %s)",
    (USER_ID, "Governance Coverage", json.dumps({
        "category": "governance", "value": 68, "target": 90,
        "source": "ledger + compliance",
    }))
)
print("✅ ESG metric: governance 68%")

conn.commit()
cur.close()
conn.close()
print("\n🎉 Seeded. INV-104 is live.")