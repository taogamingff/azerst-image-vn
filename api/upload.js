import { handleUpload } from "@vercel/blob/client";

const MAX_SIZE = 10 * 1024 * 1024 * 1024;
const TYPES = ["image/png","image/jpeg","image/webp","image/gif","image/avif"];
const ORIGIN = "https://azerstimagev1.vercel.app";

export default async function handler(req,res) {
  res.setHeader("Access-Control-Allow-Origin",ORIGIN);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  res.setHeader("Access-Control-Max-Age","86400");
  if(req.headers.origin && req.headers.origin!==ORIGIN) return res.status(403).json({error:"Origin không được phép."});
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method Not Allowed"});
  try {
    const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
    if(!body) return res.status(400).json({error:"Request body rỗng."});
    const result=await handleUpload({
      body, request:req,
      onBeforeGenerateToken:async(pathname)=>{
        if(!/^images\/[A-Za-z0-9_-]{1,80}\.(png|jpg|jpeg|webp|gif|avif)$/i.test(pathname)) throw new Error("Tên hoặc định dạng ảnh không hợp lệ.");
        return {allowedContentTypes:TYPES,maximumSizeInBytes:MAX_SIZE,addRandomSuffix:false};
      },
      onUploadCompleted:async({blob})=>console.log("AZERST UPLOAD:",blob.pathname)
    });
    return res.status(200).json(result);
  } catch(e) {
    console.error("UPLOAD ERROR:",e);
    return res.status(400).json({error:e?.message||"Không thể tạo client token."});
  }
                                                     }
