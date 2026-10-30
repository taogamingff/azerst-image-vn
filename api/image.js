import { get } from "@vercel/blob";
import { Readable } from "node:stream";

export default async function handler(req,res) {
  if(req.method!=="GET" && req.method!=="HEAD") return res.status(405).send("Method Not Allowed");
  try {
    let filename=req.query?.filename;
    if(Array.isArray(filename)) filename=filename[0];
    if(!filename) return res.status(404).send("Image Not Found");
    filename=decodeURIComponent(filename);
    if(!/^[A-Za-z0-9_-]{1,80}\.(png|jpg|jpeg|webp|gif|avif)$/i.test(filename)) return res.status(400).send("Invalid Image Name");
    const result=await get(`images/${filename}`,{access:"public"});
    if(!result || result.statusCode!==200 || !result.stream) return res.status(404).send("Image Not Found");
    res.status(200);
    res.setHeader("Content-Type",result.blob.contentType||"application/octet-stream");
    res.setHeader("Content-Disposition","inline");
    res.setHeader("X-Content-Type-Options","nosniff");
    res.setHeader("Cache-Control","public, max-age=31536000, immutable");
    if(result.blob.size!=null) res.setHeader("Content-Length",String(result.blob.size));
    if(req.method==="HEAD"){result.stream.cancel?.();return res.end();}
    Readable.fromWeb(result.stream).pipe(res);
  } catch(e) {
    console.error("IMAGE ERROR:",e);
    return res.status(500).send("Image Server Error");
  }
}
