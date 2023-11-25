import client from "../client";

const getBucket = async (bucket: string) => {
  try {
    console.log(`Getting bucket ${bucket}`);

    const { data, error } = await client.storage.getBucket(bucket);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export default getBucket;
