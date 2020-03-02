import path from "path";

export const media_dir = () =>
  path.join(path.dirname(process.mainModule.filename), "media");
