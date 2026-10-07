export async function POST() {
  return Response.json(
    {
      success: false,
      message: "WhatsApp requests are handled directly through WhatsApp.",
    },
    { status: 410 }
  );
}