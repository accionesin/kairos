export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Health check
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

    // Solo POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const body = await request.json();

      if (!body.image) {
        return new Response(
          JSON.stringify({ error: "Missing image" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // ======================
      // 🔍 DETECT (EXACTO COMO ANTES)
      // ======================
      if (path === "/" || path === "/detect") {

        const kairosResponse = await fetch(
          "https://api.kairos.com/detect",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "app_id": env.KAIROS_APP_ID,
              "app_key": env.KAIROS_APP_KEY
            },
            body: JSON.stringify({
              image: body.image
            })
          }
        );

        const kairosData = await kairosResponse.json();

        return new Response(
          JSON.stringify(kairosData),
          { status: 200, headers: corsHeaders }
        );
      }

      // ======================
      // 🧠 ENROLL (NUEVO, AISLADO)
      // ======================
      if (path === "/enroll") {

        if (!body.subject_id) {
          return new Response(
            JSON.stringify({ error: "Missing subject_id" }),
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
              image: body.image,
              subject_id: body.subject_id,
              gallery_name: "acciones.in"
            })
          }
        );

        const kairosData = await kairosResponse.json();

        return new Response(
          JSON.stringify(kairosData),
          { status: 200, headers: corsHeaders }
        );
      }

      // ======================
      // ❌ RUTA DESCONOCIDA
      // ======================
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
