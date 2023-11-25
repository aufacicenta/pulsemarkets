import client from "../client";

const createBucket = async (bucket: string) => {
  try {
    console.log(`Creating bucket ${bucket}`);

    const { data, error } = await client.storage.createBucket(bucket);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export default createBucket;
