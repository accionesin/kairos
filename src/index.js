export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // -------- CORS PREFLIGHT --------
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // -------- HEALTH CHECK --------
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "Kairos Worker activo",
          time: new Date().toISOString()
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // -------- SOLO POST --------
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      const body = await request.json();
      const url = new URL(request.url);
      const path = url.pathname;

      // -------- VALIDACIÓN BÁSICA --------
      if (!body) {
        return new Response(
          JSON.stringify({ error: "Missing request body" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // -------- HEADERS KAIROS --------
      const kairosHeaders = {
        "Content-Type": "application/json",
        "app_id": env.KAIROS_APP_ID,
        "app_key": env.KAIROS_APP_KEY
      };

      // ===============================
      // 🔍 DETECT
      // ===============================
      if (path === "/detect") {
        if (!body.image) {
          return new Response(
            JSON.stringify({ error: "Missing image" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const res = await fetch("https://api.kairos.com/detect", {
          method: "POST",
          headers: kairosHeaders,
          body: JSON.stringify({ image: body.image })
        });

        return new Response(await res.text(), {
          status: res.status,
          headers: corsHeaders
        });
      }

      // ===============================
      // 🧠 ENROLL
      // ===============================
      if (path === "/enroll") {
        const { image, subject_id, gallery_name } = body;

        if (!image || !subject_id || !gallery_name) {
          return new Response(
            JSON.stringify({ error: "Missing image, subject_id or gallery_name" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const res = await fetch("https://api.kairos.com/enroll", {
          method: "POST",
          headers: kairosHeaders,
          body: JSON.stringify({
            image,
            subject_id,
            gallery_name
          })
        });

        return new Response(await res.text(), {
          status: res.status,
          headers: corsHeaders
        });
      }

      // ===============================
      // 👁️ RECOGNIZE
      // ===============================
      if (path === "/recognize") {
        const { image, gallery_name } = body;

        if (!image || !gallery_name) {
          return new Response(
            JSON.stringify({ error: "Missing image or gallery_name" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const res = await fetch("https://api.kairos.com/recognize", {
          method: "POST",
          headers: kairosHeaders,
          body: JSON.stringify({
            image,
            gallery_name
          })
        });

        return new Response(await res.text(), {
          status: res.status,
          headers: corsHeaders }
        );
      }

      // ===============================
      // 📚 GALLERY LIST ALL
      // ===============================
      if (path === "/gallery_list_all") {
        const res = await fetch(
          "https://api.kairos.com/gallery/list_all",
          {
            method: "POST",
            headers: kairosHeaders
          }
        );

        return new Response(await res.text(), {
          status: res.status,
          headers: corsHeaders
        });
      }

      // ===============================
      // 📂 GALLERY VIEW
      // ===============================
      if (path === "/gallery_view") {
        const { gallery_name } = body;

        if (!gallery_name) {
          return new Response(
            JSON.stringify({ error: "Missing gallery_name" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const res = await fetch(
          "https://api.kairos.com/gallery/view",
          {
            method: "POST",
            headers: kairosHeaders,
            body: JSON.stringify({ gallery_name })
          }
        );

        return new Response(await res.text(), {
          status: res.status,
          headers: corsHeaders
        });
      }

      // -------- ENDPOINT DESCONOCIDO --------
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
