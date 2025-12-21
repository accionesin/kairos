export default {
  async fetch(request) {
    return new Response(
      JSON.stringify({
        ok: true,
        message: "Kairos Worker activo",
        time: new Date().toISOString()
      }),
      {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*"
        }
      }
    );
  }
};
