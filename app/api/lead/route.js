// app/api/lead/route.js
// Receives the form submission from the browser and forwards it to n8n.
// The n8n webhook URL stays secret on the server (visitors never see it).

export async function POST(request) {
  try {
    const lead = await request.json();

    // Basic validation before wasting an n8n execution
    if (!lead.name || !lead.email || !lead.message) {
      return Response.json(
        { success: false, error: "Please fill in your name, email and message." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return Response.json(
        { success: false, error: "Server is not configured yet (missing N8N_WEBHOOK_URL)." },
        { status: 500 }
      );
    }

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        company: lead.company || "",
        message: lead.message,
      }),
    });

    if (!n8nResponse.ok) {
      return Response.json(
        { success: false, error: "The automation didn't respond. Try again in a moment." },
        { status: 502 }
      );
    }

    const result = await n8nResponse.json();
    // n8n replies with { success, score, message } from the Respond to Webhook node
    return Response.json({ success: true, message: result.message || "Received!" });
  } catch (err) {
    return Response.json(
      { success: false, error: "Something went wrong sending your message." },
      { status: 500 }
    );
  }
}
