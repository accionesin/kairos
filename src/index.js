export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // 🔁 Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ❤️ Health check
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

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      const body = await request.json();

      // =====================================================
      // 🔍 DETECT (YA EXISTENTE)
      // =====================================================
      if (path === "/detect") {

        if (!body.image) {
          return new Response(
            JSON.stringify({ error: "Missing image URL" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const kairosResponse = await fetch(
          "https://api.kairos.com/detect",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "app_id": env.KAIROS_APP_ID,
              "app_key": env.KAIROS_APP_KEY
            },
            body: JSON.stringify({ image: body.image })
          }
        );

        const data = await kairosResponse.json();

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders
        });
      }

      // =====================================================
      // 🧠 ENROLL (YA EXISTENTE)
      // =====================================================
      if (path === "/enroll") {

        const { image, subject_id } = body;

        if (!image || !subject_id) {
          return new Response(
            JSON.stringify({ error: "Missing image or subject_id" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const kairosResponse = await fetch(
          "https://api.kairos.com/enroll",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "app_id": env.KAIROS_APP_ID,
              "app_key": env.KAIROS_APP_KEY
            },
            body: JSON.stringify({
              image,
              subject_id,
              gallery_name: "acciones.in"
            })
          }
        );

        const data = await kairosResponse.json();

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders
        });
      }

      // =====================================================
      // 🧬 RECOGNIZE (YA EXISTENTE)
      // =====================================================
      if (path === "/recognize") {

        if (!body.image) {
          return new Response(
            JSON.stringify({ error: "Missing image URL" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const kairosResponse = await fetch(
          "https://api.kairos.com/recognize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "app_id": env.KAIROS_APP_ID,
              "app_key": env.KAIROS_APP_KEY
            },
            body: JSON.stringify({
              image: body.image,
              gallery_name: "acciones.in"
            })
          }
        );

        const data = await kairosResponse.json();

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders
        });
      }

      // =====================================================
      // 📂 GALLERY LIST ALL (NUEVO)
      // =====================================================
      if (path === "/gallery/list") {

        const kairosResponse = await fetch(
          "https://api.kairos.com/gallery/list_all",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "app_id": env.KAIROS_APP_ID,
              "app_key": env.KAIROS_APP_KEY
            },
            body: JSON.stringify({
              gallery_name: "acciones.in"
            })
          }
        );

        const data = await kairosResponse.json();

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders
        });
      }

      // =====================================================
      // ❌ ENDPOINT NO ENCONTRADO
      // =====================================================
      return new Response(
        JSON.stringify({ error: "Endpoint not found" }),
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
