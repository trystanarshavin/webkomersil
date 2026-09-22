const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export default async function handler(req, res) {
  try {
    if (!GOOGLE_SCRIPT_URL) {
      return res.status(500).json({
        success: false,
        message: "GOOGLE_SCRIPT_URL belum diatur di Vercel."
      });
    }

    if (req.method === "GET") {
      const url = new URL(GOOGLE_SCRIPT_URL);

      Object.entries(req.query || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        redirect: "follow"
      });

      const text = await response.text();

      res.status(response.status);
      res.setHeader("Content-Type", "application/json");
      return res.send(text);
    }

    if (req.method === "POST") {
      let body = req.body;

      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(body || {}),
        redirect: "follow"
      });

      const text = await response.text();

      res.status(response.status);
      res.setHeader("Content-Type", "application/json");
      return res.send(text);
    }

    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan"
    });

  } catch (error) {
    console.error("Google Sheets API error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghubungi Google Sheets: " + error.message
    });
  }
}
