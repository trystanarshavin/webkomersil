const express = require("express");
const midtransClient = require("midtrans-client");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyveHvyVVFHAgEXh6dANiVxw9RsnYf2hGzl22Nc3Ca6Ovcmol3yJPRahSpsiSddJDqD/exec";

app.use(express.json({ type: ["application/json", "text/plain"] }));
app.use(express.static(path.join(__dirname)));

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Server Kopi Avicena aktif" });
});

// Client Key boleh dikirim ke browser karena memang digunakan oleh Snap.js.
app.get("/api/midtrans-config", (req, res) => {
  if (!process.env.MIDTRANS_CLIENT_KEY) {
    return res.status(500).json({
      success: false,
      message: "MIDTRANS_CLIENT_KEY belum ada di file .env"
    });
  }
  res.json({ success: true, clientKey: process.env.MIDTRANS_CLIENT_KEY });
});

app.get("/api/sheets", async (req, res) => {
  try {
    const params = new URLSearchParams();
    Object.keys(req.query).forEach((key) => params.set(key, req.query[key]));

    const url = GOOGLE_SCRIPT_URL + "?" + params.toString();
    console.log("Google Sheets GET:", url);

    const response = await fetch(url, { redirect: "follow" });
    const text = await response.text();

    console.log(
      "Google Sheets response:",
      response.status,
      text.substring(0, 300)
    );

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch (e) {
      res.status(502).json({
        success: false,
        message: "Apps Script mengembalikan respons yang bukan JSON.",
        upstreamStatus: response.status,
        upstreamPreview: text.substring(0, 300)
      });
    }
  } catch (error) {
    console.error("Google Sheets GET Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghubungkan ke Google Sheets",
      error: error.message
    });
  }
});

app.post("/api/sheets", async (req, res) => {
  try {
    console.log("Google Sheets POST:", req.body);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(req.body),
      redirect: "follow"
    });

    const text = await response.text();

    console.log(
      "Google Sheets POST response:",
      response.status,
      text.substring(0, 300)
    );

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch (e) {
      res.status(502).json({
        success: false,
        message: "Apps Script mengembalikan respons yang bukan JSON.",
        upstreamStatus: response.status,
        upstreamPreview: text.substring(0, 300)
      });
    }
  } catch (error) {
    console.error("Google Sheets POST Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengirim data ke Google Sheets",
      error: error.message
    });
  }
});

app.post("/api/create-transaction", async (req, res) => {
  try {
    const { orderId, grossAmount, customer } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId wajib diisi" });
    }
    if (!grossAmount) {
      return res.status(400).json({ success: false, message: "grossAmount wajib diisi" });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(grossAmount)
      },
      customer_details: {
        first_name: customer?.name || "Customer",
        email: customer?.email || "customer@example.com",
        phone: customer?.phone || ""
      }
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat transaksi Midtrans",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Kopi Avicena berjalan di http://localhost:${PORT}`);
});
