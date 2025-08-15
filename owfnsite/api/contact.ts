
export const runtime = 'edge'; // Vercel Edge runtime

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        const { name, email, reason, message } = await request.json();

        // Basic validation
        if (!name || !email || !reason || !message || !name.trim() || !email.trim() || !message.trim()) {
            return new Response(JSON.stringify({ success: false, error: 'All fields are required.' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        
        // Very basic email format check
        if (!/^\S+@\S+\.\S+$/.test(email)) {
             return new Response(JSON.stringify({ success: false, error: 'Invalid email format.' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        
        // In a real application, you would send an email here using a service like SendGrid, Resend, etc.
        // The logic would use the `reason` to route the email to the correct address (e.g., partnerships@owfn.org).
        // For this simulation, we'll just log it and return success.
        console.log(`Simulating email send: From ${name} <${email}>, Reason: ${reason}, Message: ${message.substring(0, 100)}...`);

        // Simulate a short delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));

        return new Response(JSON.stringify({ success: true, message: 'Message sent successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Contact form API error:', error);
        return new Response(JSON.stringify({ success: false, error: 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
