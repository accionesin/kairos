export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ---------- HEALTH CHECK ----------
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "Kairos Worker activo",
          endpoint: path,
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

      // ---------- DETECT ----------
      if (path === "/" || path === "/detect") {
        if (!body.image) {
          return new Response(
            JSON.stringify({ error: "Missing image" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const res = await fetch("https://api.kairos.com/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify({ image: body.image })
        });

        return new Response(JSON.stringify(await res.json()), {
          status: 200,
          headers: corsHeaders
        });
      }

      // ---------- ENROLL ----------
      if (path === "/enroll") {
        const { image, subject_id, gallery_name } = body;

        if (!image || !subject_id || !gallery_name) {
          return new Response(
            JSON.stringify({ error: "Missing enroll parameters" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const res = await fetch("https://api.kairos.com/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify({
            image,
            subject_id,
            gallery_name
          })
        });

        return new Response(JSON.stringify(await res.json()), {
          status: 200,
          headers: corsHeaders }
        );
      }

      // ---------- RECOGNIZE ----------
      if (path === "/recognize") {
        const { image, gallery_name } = body;

        if (!image || !gallery_name) {
          return new Response(
            JSON.stringify({ error: "Missing recognize parameters" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const res = await fetch("https://api.kairos.com/recognize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify({
            image,
            gallery_name
          })
        });

        return new Response(JSON.stringify(await res.json()), {
          status: 200,
          headers: corsHeaders
        });
      }

      // ---------- GALLERY LIST ALL ----------
      if (path === "/gallery_list_all") {
        const res = await fetch(
          "https://api.kairos.com/gallery/list_all",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "app_id": env.KAIROS_APP_ID,
              "app_key": env.KAIROS_APP_KEY
            }
          }
        );

        return new Response(JSON.stringify(await res.json()), {
          status: 200,
          headers: corsHeaders
        });
      }

      // ---------- GALLERY VIEW ----------
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
            headers: {
              "Content-Type": "application/json",
              "app_id": env.KAIROS_APP_ID,
              "app_key": env.KAIROS_APP_KEY
            },
            body: JSON.stringify({ gallery_name })
          }
        );

        return new Response(JSON.stringify(await res.json()), {
          status: 200,
          headers: corsHeaders
        });
      }

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
