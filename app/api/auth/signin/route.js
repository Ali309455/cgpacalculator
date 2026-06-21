import dbConnect from "../../../../lib/db";

export async function GET(){
   return new Response("Hello, Next.js!"); 
}
export async function POST(req) {
   await dbConnect();
   console.log(req);
    return new Response(req);
}