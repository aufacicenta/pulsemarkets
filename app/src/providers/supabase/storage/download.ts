import client from "../client";

const downloadFile = async (bucket: string, path: string) => {
  try {
    console.log(`Downloading file ${path} from bucket ${bucket}`);

    const { data, error } = await client.storage.from(bucket).download(path);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export default downloadFile;
