export default {
  async fetch(request) {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Kairos Worker activo 🚀",
        source: "Cloudflare Workers"
      }),
      {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*"
        }
      }
    )
  }
}
