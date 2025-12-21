export default {
  async fetch() {
    return new Response(
      JSON.stringify({
        ok: true,
        service: "Kairos",
        status: "Worker operativo 🚀"
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
