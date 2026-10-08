import { get } from "@vercel/blob";
import { Readable } from "node:stream";

export default async function handler(req, res) {

  // =========================
  // METHOD
  // =========================

  if (req.method !== "GET") {
    return res.status(405).send(
      "Method Not Allowed"
    );
  }

  try {

    // =========================
    // GET FILENAME
    // =========================

    let filename =
      req.query?.filename;

    if (!filename) {
      return res.status(404).send(
        "Image Not Found"
      );
    }

    filename =
      decodeURIComponent(filename);

    // =========================
    // KIỂM TRA TÊN FILE
    // =========================

    const validName =
      /^[A-Za-z0-9]{9}\.(png|jpg|jpeg|webp|gif|avif)$/i;

    if (!validName.test(filename)) {
      return res.status(400).send(
        "Invalid Image Name"
      );
    }

    // =========================
    // LẤY BLOB
    // =========================

    const result = await get(
      filename,
      {
        access: "public"
      }
    );

    if (
      !result ||
      result.statusCode !== 200 ||
      !result.stream
    ) {
      return res.status(404).send(
        "Image Not Found"
      );
    }

    // =========================
    // RESPONSE HEADER
    // =========================

    res.statusCode = 200;

    res.setHeader(
      "Content-Type",
      result.blob.contentType ||
        "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      "inline"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    if (result.blob.size) {
      res.setHeader(
        "Content-Length",
        String(result.blob.size)
      );
    }

    // =========================
    // STREAM IMAGE
    // =========================

    Readable
      .fromWeb(result.stream)
      .pipe(res);

  } catch (error) {

    console.error(
      "IMAGE ERROR:",
      error
    );

    return res.status(500).send(
      "Image Server Error"
    );
  }
}
