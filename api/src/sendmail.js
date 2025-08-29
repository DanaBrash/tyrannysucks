import { app } from "@azure/functions";
import emailjs from "@emailjs/nodejs";
import { z } from "zod";

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY, // <-- required in strict mode
});


const cors = () => {
  const allow = process.env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
};

const Body = z.object({
  from_name: z.string().min(1),
  reply_to: z.string().email(),
  alias: z.string().email(),
  message: z.string().min(1)
});

app.http("sendmail", {
  route: "sendmail",
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (req, ctx) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    let payload;
    try {
      payload = Body.parse(await req.json());
    } catch (e) {
      return new Response(JSON.stringify({ error: "Bad request", details: String(e) }), {
        status: 400,
        headers: { "content-type": "application/json", ...cors() }
      });
    }

    try {
      const res = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          from_name: payload.from_name,
          reply_to: payload.reply_to,
          alias: payload.alias,
          message: payload.message
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY
        }
      );

      ctx.log("EmailJS result", res?.status || "ok");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json", ...cors() }
      });
    } catch (err) {
      ctx.error("EmailJS error", err);
      return new Response(
        JSON.stringify({ ok: false, error: String(err?.text || err?.message || err) }),
        { status: 502, headers: { "content-type": "application/json", ...cors() } }
      );
    }
  }
});
