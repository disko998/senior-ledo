import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

// Mark this page as server-rendered
export const prerender = false;

// Configure SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT || "465"),
  secure: true, // SSL/TLS
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    const { firstName, lastName, email, phone, companyName, message } = data;

    if (!firstName || !lastName || !email || !phone || !companyName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Phone validation
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send email notification
    const mailOptions = {
      from: import.meta.env.SMTP_FROM,
      to: import.meta.env.SMTP_TO,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2b76fe; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2b76fe; }
            .value { margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${firstName} ${lastName}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              <div class="field">
                <div class="label">Company Name:</div>
                <div class="value">${companyName}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message || "No message provided"}</div>
              </div>
              <div class="field" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <div class="label">Submitted at:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Company: ${companyName}
Message: ${message || "No message provided"}

Submitted at: ${new Date().toLocaleString()}
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log("Contact form submission sent:", {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for your submission! We will contact you shortly.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to send email. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
