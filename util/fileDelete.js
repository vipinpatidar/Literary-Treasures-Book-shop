import fs from "fs";

export const deleteFileImage = async (filePath) => {
  await fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("file deleted");
    }
  });
};
