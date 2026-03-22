# 🔷 Connecting Custom Domain (Hostinger → Vercel)

## 📌 What is it?
Connecting a purchased domain to a deployed frontend project on Vercel.

Example:
app.jitcoder.in → React frontend on Vercel

---

## 🎯 Why we use it?

To make the project accessible using a professional domain instead of:

https://project-name.vercel.app

Example:

app.jitcoder.in

---

## ⚙️ Architecture

jitcoder.in → domain provider (Hostinger)

app.jitcoder.in → frontend (Vercel)

api.jitcoder.in → backend (Render)

---

## ⚙️ Steps

### 1️⃣ Add domain in Vercel

Open project dashboard

Settings → Domains

Add:

app.jitcoder.in

---

### 2️⃣ Add DNS record in Hostinger

Go to:

Domains → jitcoder.in → DNS Zone

Add record:

Type: CNAME  
Name: app  
Value: cname.vercel-dns.com

Example:

CNAME   app   cname.vercel-dns.com

---

### 3️⃣ Wait for DNS propagation

Usually takes:

5–30 minutes

---

### 4️⃣ Verify domain

Open:

https://app.jitcoder.in

If configured correctly, the React app loads.

---

## ⚠️ Common Mistakes

### DNS conflict

If another record exists:

A app  
AAAA app  

DNS will show error.

Fix:
Delete those records before adding CNAME.

---

### Wrong CNAME target

Wrong:

CNAME app 1dc43439b1a7a5ff.vercel-dns-017.com

Correct:

CNAME app cname.vercel-dns.com

---

### Domain not assigned to production

Check in Vercel:

Project → Settings → Domains

Ensure:

app.jitcoder.in → Production

---

## 🧠 My Understanding

Custom domains allow my deployed React app to run on a branded domain.

Hostinger manages DNS records while Vercel hosts the frontend application.

---

## 🔗 Used in

Codify project