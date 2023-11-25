import uploadFile from "./storage/upload";
import getBucket from "./storage/get-bucket";
import createBucket from "./storage/create-bucket";
import downloadFile from "./storage/download";
import createSignedURL from "./storage/create-signed-url";
import client from "./client";

export default {
  client,
  storage: {
    uploadFile,
    downloadFile,
    createSignedURL,
    getBucket,
    createBucket,
  },
};
