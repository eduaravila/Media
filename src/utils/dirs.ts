import path from "path";

export const media_dir = () =>
  path.join(path.dirname(process.mainModule.filename), "media");

export const public_dir = () =>
  path.join(path.dirname(process.mainModule.filename), "public");

export const articles_dir = () =>
  path.join(path.dirname(process.mainModule.filename), "articles");
