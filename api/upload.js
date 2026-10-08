import { handleUpload } from "@vercel/blob/client";

const MAX_SIZE =
  10 * 1024 * 1024 * 1024;

const ALLOWED_TYPES = [

  "image/png",

  "image/jpeg",

  "image/webp",

  "image/gif",

  "image/avif"

];


export default async function handler(
  req,
  res
) {

  /*
   * WEBSITE ĐƯỢC PHÉP GỌI API
   */
  const allowedOrigin =
    "https://azerstimagev1.vercel.app";


  /*
   * CORS
   */
  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigin
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


  /*
   * PREFLIGHT
   */
  if(req.method === "OPTIONS"){

    return res
      .status(204)
      .end();

  }


  /*
   * CHỈ POST
   */
  if(req.method !== "POST"){

    return res
      .status(405)
      .json({
        error:
          "Method Not Allowed"
      });

  }


  try{

    const response =
      await handleUpload({

        body:
          req.body,

        request:
          req,


        /*
         * KIỂM TRA FILE
         */
        onBeforeGenerateToken:
          async (pathname) => {

            const extension =
              pathname
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


            if(
              !allowedExtensions
                .includes(extension)
            ){

              throw new Error(
                "Định dạng ảnh không được hỗ trợ."
              );

            }


            return {

              allowedContentTypes:
                ALLOWED_TYPES,

              maximumSizeInBytes:
                MAX_SIZE,

              /*
               * Không tự thêm chuỗi
               * vào filename.
               */
              addRandomSuffix:
                false,

              tokenPayload:
                JSON.stringify({
                  application:
                    "azerst-image-vn",
                  maxSize:
                    MAX_SIZE
                })

            };

          },


        onUploadCompleted:
          async ({ blob }) => {

            console.log(
              "UPLOAD COMPLETE:",
              blob.url
            );

          }

      });


    return res
      .status(200)
      .json(response);


  }catch(error){

    console.error(
      "UPLOAD ERROR:",
      error
    );

    return res
      .status(500)
      .json({

        error:
          error?.message ||
          "Upload Error"

      });

  }

     }
