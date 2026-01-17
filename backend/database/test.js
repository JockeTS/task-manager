// For testing
import fs from "fs/promises";

// Load test data
export const readTestData = async () => {

  const data = JSON.parse(
    await fs.readFile(new URL("./dst2.json", import.meta.url))
  );

  return data;
};