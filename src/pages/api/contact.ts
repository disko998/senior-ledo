import type { APIRoute } from "astro";

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

    // Here you would typically:
    // 1. Send an email notification
    // 2. Save to a database
    // 3. Send to a CRM system
    // 4. Integrate with a service like SendGrid, Mailgun, etc.

    // For now, we'll just log the data
    console.log("Contact form submission:", {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual email sending or database storage
    // Example with SendGrid:
    // await sendEmail({
    //   to: 'contact@seniorlead.com',
    //   subject: `New Contact Form Submission from ${firstName} ${lastName}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Phone:</strong> ${phone}</p>
    //     <p><strong>Company:</strong> ${companyName}</p>
    //     <p><strong>Message:</strong> ${message || 'No message provided'}</p>
    //   `
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for your submission! We will contact you shortly.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
