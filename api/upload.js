import { handleUpload } from "@vercel/blob/client";

const MAX_SIZE = 10 * 1024 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif"
];

export default async function handler(req, res) {

  // =========================
  // CORS
  // =========================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://azerstimagev1.vercel.app"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  res.setHeader(
    "Access-Control-Max-Age",
    "86400"
  );

  // =========================
  // OPTIONS
  // =========================

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // =========================
  // METHOD
  // =========================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {

    // =========================
    // BODY
    // =========================

    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    if (!body) {
      return res.status(400).json({
        error: "Request body is empty"
      });
    }

    // =========================
    // VERCEL BLOB
    // =========================

    const result = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async (pathname) => {

        // Lấy phần mở rộng
        const extension = pathname
          .split(".")
          .pop()
          ?.toLowerCase();

        const allowedExtensions = [
          "png",
          "jpg",
          "jpeg",
          "webp",
          "gif",
          "avif"
        ];

        // Kiểm tra đuôi file
        if (!allowedExtensions.includes(extension)) {
          throw new Error(
            "Định dạng ảnh không được hỗ trợ."
          );
        }

        return {

          // Chỉ cho phép ảnh
          allowedContentTypes: ALLOWED_TYPES,

          // Tối đa 10 GB
          maximumSizeInBytes: MAX_SIZE,

          // Không tự thêm hậu tố
          addRandomSuffix: false
        };
      },

      // =========================
      // UPLOAD COMPLETE
      // =========================

      onUploadCompleted: async ({ blob }) => {

        console.log(
          "UPLOAD COMPLETE:",
          blob.pathname
        );

      }
    });

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json(result);

  } catch (error) {

    console.error(
      "BLOB UPLOAD ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Không thể tạo Client Token"
    });
  }
}
