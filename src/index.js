export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // Health check
    if (url.pathname === "/") {
      return json({
        ok: true,
        message: "Kairos Worker activo",
        time: new Date().toISOString()
      });
    }

    // DETECT
    if (url.pathname === "/detect" && request.method === "POST") {
      const body = await request.json();
      return callKairos("detect", body, env);
    }

    // ENROLL
    if (url.pathname === "/enroll" && request.method === "POST") {
      const body = await request.json();

      // Protección básica del plan free
      const today = new Date().toISOString().slice(0, 10);
      const key = `enroll_${today}`;
      const count = Number(await env.KV.get(key)) || 0;

      if (count >= 20) {
        return json({
          ok: false,
          error: "Límite diario de registros alcanzado (20)"
        }, 429);
      }

      // Incrementa contador
      await env.KV.put(key, count + 1);

      return callKairos("enroll", {
        image: body.image,
        subject_id: body.subject_id,
        gallery_name: "acciones.in"
      }, env);
    }

    return new Response("Not found", { status: 404 });
  }
};

// =====================

async function callKairos(endpoint, payload, env) {
  const res = await fetch(`https://api.kairos.com/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "app_id": env.KAIROS_APP_ID,
      "app_key": env.KAIROS_APP_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  return json(data, res.status);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
