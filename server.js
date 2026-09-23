const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Google Apps Script yang aktif
const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL ||
  process.env.APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxwvl9fXI_QGQ6SNhX_JjW1pDc5sBBCaML6z0xZoNOYUxeV4vz7Eh6k8ehKwEhCebrm/exec";

// Middleware
app.use(express.json({
  type: ["application/json", "text/plain"],
  limit: "2mb"
}));

app.use(express.urlencoded({
  extended: true
}));

// Serve index.html + gambar + asset lainnya
app.use(express.static(path.join(__dirname)));


/* =========================================================
   TEST SERVER
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Server Kopi Avicena aktif"
  });
});


/* =========================================================
   GOOGLE SHEETS - GET
========================================================= */

app.get("/api/sheets", async (req, res) => {
  try {
    const params = new URLSearchParams();

    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    const separator = GOOGLE_SCRIPT_URL.includes("?")
      ? "&"
      : "?";

    const url =
      GOOGLE_SCRIPT_URL +
      separator +
      params.toString();

    console.log("Google Sheets GET:", url);

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow"
    });

    const text = await response.text();

    console.log(
      "Google Sheets GET response:",
      response.status,
      text.substring(0, 300)
    );

    try {
      const data = JSON.parse(text);

      return res
        .status(response.status)
        .json(data);

    } catch (error) {

      return res.status(502).json({
        success: false,
        message:
          "Google Apps Script mengembalikan data yang bukan JSON.",
        upstreamStatus: response.status,
        upstreamPreview: text.substring(0, 300)
      });
    }

  } catch (error) {

    console.error(
      "Google Sheets GET Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Gagal menghubungkan ke Google Sheets.",
      error: error.message
    });
  }
});


/* =========================================================
   GOOGLE SHEETS - POST
========================================================= */

app.post("/api/sheets", async (req, res) => {
  try {

    console.log(
      "Google Sheets POST:",
      req.body
    );

    const response = await fetch(
      GOOGLE_SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify(
          req.body || {}
        ),

        redirect: "follow"
      }
    );

    const text = await response.text();

    console.log(
      "Google Sheets POST response:",
      response.status,
      text.substring(0, 300)
    );

    try {

      const data = JSON.parse(text);

      return res
        .status(response.status)
        .json(data);

    } catch (error) {

      return res.status(502).json({
        success: false,
        message:
          "Google Apps Script mengembalikan data yang bukan JSON.",
        upstreamStatus: response.status,
        upstreamPreview:
          text.substring(0, 300)
      });
    }

  } catch (error) {

    console.error(
      "Google Sheets POST Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Gagal mengirim data ke Google Sheets.",
      error: error.message
    });
  }
});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

  console.log(
    `Kopi Avicena berjalan di http://localhost:${PORT}`
  );

});