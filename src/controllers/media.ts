import moment from "moment";
import { ApolloError } from "apollo-server-express";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import path from "path";
import os from "os";
import { v4 } from "uuid";
import { GraphQLUpload, FileUpload } from "graphql-upload";
import sharp from "sharp";
import { validationResult } from "express-validator";
import mediaModel from "../models/media";

import { findInput } from "../schema/MediaSchema";
import JwtAdmin from "../utils/jwtAdmin";
import JwtMedia from "../utils/jwtMedia";
import { media_dir } from "../utils/dirs";
import { decrypt, encrypt } from "../utils/crypt";

export const addMedia = async (file: FileUpload, ctx: any) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtMedia.validateToken(token);

    let tokenData: any = await JwtMedia.decrypt_data(localToken)();

    const { createReadStream, filename, mimetype } = await file;

    console.log(createReadStream);

    const semiTransparentRedPng = sharp()
      .resize(1200)
      .png();

    let final = ".png";
    if (mimetype == "image/png") {
      final = ".png";
    } else if (mimetype == "image/jpg") {
      final = ".jpg";
    } else if (mimetype == "image/jpeg") {
      final = ".jpeg";
    }

    let newFileName = v4() + final;
    const destinationPath = path.join(media_dir(), newFileName);

    const url = await new Promise((res, rej) =>
      createReadStream()
        .pipe(semiTransparentRedPng)
        .pipe(createWriteStream(destinationPath))
        .on("error", rej)
        .on("finish", async () => {
          res(newFileName);
        })
    );
    let newMedia = await new mediaModel({
      original_name: filename,
      name: newFileName,
      created_by: tokenData.userId,
      updated_by: tokenData.userId,
      link: newFileName
    });
    await newMedia.save();

    return Promise.resolve({
      msg: newMedia.link.toString(),
      code: "200"
    });
  } catch (error) {
    console.log(error);

    throw new ApolloError(error);
  }
};

export const getMedia = async ({ page = 0, size = 0, search }: findInput) => {
  try {
    let offset = page * size;
    let limit = offset + size;

    let result =
      search.length > 0
        ? await mediaModel
            .find({
              $or: [{ name: { $regex: ".*" + search + ".*" } }]
            })
            .skip(offset)
            .limit(limit)
        : await mediaModel
            .find({})
            .skip(offset)
            .limit(limit);

    return Promise.resolve(result);
  } catch (error) {
    console.log(error);

    throw new ApolloError(error);
  }
};

export const deleteMedia = async ({ id }: any, ctx: any) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtAdmin.validateToken(token);

    let tokenData: any = await JwtAdmin.decrypt_data(localToken)();

    let deletedMedia = await mediaModel.delete(
      { $and: [{ _id: id }] },
      tokenData.userId
    );
    await unlinkSync(path.join(media_dir(), deletedMedia.name));

    return Promise.resolve({
      msg: id + "Succesfully deleted",
      code: "200"
    });
  } catch (error) {
    new ApolloError(error);
  }
};

export const get_image = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log("send file");

    let { id } = req.params;
    let path_image = path.join(media_dir(), id);

    if (existsSync(path_image)) {
      res.sendFile(path_image);
    } else
      res.status(404).send({
        msg: "Image not found",
        code: "404"
      });
  } catch (error) {
    res.status(404).send({
      msg: "Image not found",
      code: "404"
    });
  }
};

export const make_media_dir = async () => {
  try {
    if (await !existsSync(media_dir())) {
      return await mkdirSync(media_dir());
    }
  } catch (error) {
    throw error;
  }
};
