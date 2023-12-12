import clientPromise from "@/lib/mongoclient";
export const dynamic = 'force-dynamic'
export async function GET(req) {
    try {
        const client = await clientPromise;
        const db = client.db("taiga-point-counter-web");

        let url = new URL(req.url);
        let hostname = url.searchParams.get("hostname");


        if (!hostname) {
            return new Response("Please provide hostname", {
                status: 400,
                headers: { "Content-Type": "text/plain" },
            });
        }

        if (hostname != process.env.TAIGA_HOSTNAME) {
            return new Response("Sorry, we currently support our internal taiga. Please open an issue or pull request if you need this feature", {
                status: 400,
                headers: { "Content-Type": "text/plain" },
            });
        }
        let currentMonth = new Date().toISOString().slice(0, 7);
        let result = await db.collection("leaderboard").findOne({ hostname: hostname, month: currentMonth });
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error(e);
        throw new Error(e).message;
    }
};

// to refresh the leaderboard
