import { copy, del } from "@vercel/blob";
import { timingSafeEqual } from "node:crypto";
const ORIGIN="https://azerstimagev1.vercel.app";
const valid=n=>typeof n==="string" && /^[A-Za-z0-9_-]{1,80}\.(png|jpg|jpeg|webp|gif|avif)$/i.test(n);
function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length && timingSafeEqual(x,y)}
export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin",ORIGIN);res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.headers.origin && req.headers.origin!==ORIGIN)return res.status(403).json({error:"Origin không được phép."});
  if(req.method==="OPTIONS")return res.status(204).end();
  if(req.method!=="POST")return res.status(405).json({error:"Method Not Allowed"});
  try{
    const b=typeof req.body==="string"?JSON.parse(req.body):req.body||{};
    const secret=process.env.AZERST_RENAME_KEY;
    if(!secret)return res.status(500).json({error:"Chưa cấu hình AZERST_RENAME_KEY trên Vercel."});
    if(!equal(b.key||"",secret))return res.status(401).json({error:"Khóa đổi tên không chính xác."});
    if(!valid(b.oldFilename)||!valid(b.newFilename))return res.status(400).json({error:"Tên ảnh không hợp lệ."});
    if(b.oldFilename===b.newFilename)return res.status(400).json({error:"Tên mới giống tên hiện tại."});
    if(b.oldFilename.split(".").pop().toLowerCase()!==b.newFilename.split(".").pop().toLowerCase())return res.status(400).json({error:"Không đổi phần mở rộng ảnh."});
    const result=await copy(`images/${b.oldFilename}`,`images/${b.newFilename}`,{access:"public",addRandomSuffix:false});
    await del(`images/${b.oldFilename}`);
    return res.status(200).json({ok:true,pathname:result.pathname});
  }catch(e){
    console.error("RENAME ERROR:",e);
    return res.status(400).json({error:e?.message||"Không thể đổi tên. Có thể tên mới đã tồn tại."});
  }
}
