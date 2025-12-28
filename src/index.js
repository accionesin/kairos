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
      // 🗂️ GALLERY LIST ALL
      // ======================================================
      if (path === "/gallery_list_all") {
        const r = await fetch("https://api.kairos.com/gallery/list_all", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          }
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }

      // ======================================================
      // 📂 GALLERY VIEW
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
          body: JSON.stringify({
            gallery_name: body.gallery_name
          })
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }

      // ======================================================
      // 🗑️ GALLERY REMOVE SUBJECT  ✅ NUEVO
      // ======================================================
      if (path === "/gallery_remove_subject") {
        const body = await request.json();

        if (!body.gallery_name || !body.subject_id) {
          return new Response(
            JSON.stringify({ error: "Missing gallery_name or subject_id" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const r = await fetch("https://api.kairos.com/gallery/remove_subject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app_id": env.KAIROS_APP_ID,
            "app_key": env.KAIROS_APP_KEY
          },
          body: JSON.stringify({
            gallery_name: body.gallery_name,
            subject_id: body.subject_id
          })
        });

        return new Response(await r.text(), { status: 200, headers: corsHeaders });
      }
// ======================================================
// 👤 GALLERY VIEW SUBJECT (detalle de un rostro)
// ======================================================
if (path === "/gallery_view_subject") {
  const body = await request.json();

  if (!body.gallery_name || !body.subject_id) {
    return new Response(
      JSON.stringify({
        error: "Missing gallery_name or subject_id"
      }),
      { status: 400, headers: corsHeaders }
    );
  }

  const r = await fetch("https://api.kairos.com/gallery/view_subject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "app_id": env.KAIROS_APP_ID,
      "app_key": env.KAIROS_APP_KEY
    },
    body: JSON.stringify({
      gallery_name: body.gallery_name,
      subject_id: body.subject_id
    })
  });

  return new Response(await r.text(), {
    status: 200,
    headers: corsHeaders
  });
}
// ======================================================
// 📊 ANALYTICS (uso del sistema) — FIX DEFINITIVO
// ======================================================
if (path === "/analytics") {

  let body = null;

  try {
    body = await request.json();
  } catch (e) {
    body = null;
  }

  const r = await fetch("https://api.kairos.com/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "app_id": env.KAIROS_APP_ID,
      "app_key": env.KAIROS_APP_KEY
    },
    body: body && Object.keys(body).length > 0
      ? JSON.stringify(body)
      : null
  });

  return new Response(await r.text(), {
    status: r.status,
    headers: corsHeaders
  });
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
