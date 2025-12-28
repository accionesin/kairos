export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // -----------------------------
    // CORS Preflight
    // -----------------------------
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // -----------------------------
    // Health check
    // -----------------------------
    if (request.method === "GET" && path === "/") {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "Kairos Worker activo",
          time: new Date().toISOString()
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Solo POST para endpoints
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {

      // ======================================================
      // 🔍 DETECT
      // ======================================================
      if (path === "/detect") {
        const body = await request.json();

        if (!body.image) {
          return new Response(
            JSON.stringify({ error: "Missing image" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const r = await fetch("https://api.kairos.com/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify({ image: body.image })
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }

      // ======================================================
      // 🧠 ENROLL
      // ======================================================
      if (path === "/enroll") {
        const body = await request.json();

        const r = await fetch("https://api.kairos.com/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify(body)
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }

      // ======================================================
      // 🔎 RECOGNIZE
      // ======================================================
      if (path === "/recognize") {
        const body = await request.json();

        const r = await fetch("https://api.kairos.com/recognize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify(body)
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }

      // ======================================================
      // 🗂️ GALLERY LIST ALL  ✅ (ARREGLADO)
      // ======================================================
      if (path === "/gallery_list_all") {
        const r = await fetch("https://api.kairos.com/gallery/list_all", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          }
          // ⚠️ NO body
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }

      // ======================================================
      // 📂 GALLERY VIEW (subjects en galería)
      // ======================================================
      if (path === "/gallery_view") {
        const body = await request.json();

        if (!body.gallery_name) {
          return new Response(
            JSON.stringify({ error: "Missing gallery_name" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const r = await fetch("https://api.kairos.com/gallery/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify({ gallery_name: body.gallery_name })
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }

      // ======================================================
      // ❌ Endpoint no reconocido
      // ======================================================
      return new Response(
        JSON.stringify({ error: "Unknown endpoint" }),
        { status: 404, headers: corsHeaders }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Worker error",
          detail: err.message
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
