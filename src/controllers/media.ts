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

import { findInput, SuccessResponseArray } from "../schema/MediaSchema";
import JwtAdmin from "../utils/jwtAdmin";
import JwtMedia from "../utils/jwtMedia";
import jwtTicket from "../utils/jwtTicket";
import { media_dir, public_dir, articles_dir } from "../utils/dirs";
import { decrypt, encrypt } from "../utils/crypt";

export const addMediaAdmin = async (files: [FileUpload], ctx: any) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtAdmin.validateToken(token);

    let tokenData: any = await JwtAdmin.decrypt_data(localToken)();

    let names = await Promise.all(
      await files.map(async (file: any) => {
        const { createReadStream, filename, mimetype } = await file;

        const semiTransparentRedPng = sharp().resize(1200);

        let final = ".png";
        if (mimetype == "image/png") {
          final = ".png";
          semiTransparentRedPng.png();
        } else if (mimetype == "image/jpg") {
          final = ".jpg";
          semiTransparentRedPng.jpeg();
        } else if (mimetype == "image/jpeg") {
          final = ".jpeg";
          semiTransparentRedPng.jpeg();
        } else {
          throw new ApolloError("File extension not valid");
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
        return await newMedia.save();
      })
    );

    let justNames = [...names.map(i => i.name)];

    console.log(justNames);

    return Promise.resolve({
      msg: justNames,
      code: "200"
    });
  } catch (error) {
    throw new ApolloError(error);
  }
};

export const addArticleAdmin = async (files: [FileUpload], ctx: any) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtAdmin.validateToken(token);

    let tokenData: any = await JwtAdmin.decrypt_data(localToken)();
    let filesNames = await files;

    let names = await Promise.all(
      await files.map(async (file: any) => {
        const { createReadStream, filename, mimetype } = await file;

        let final = ".md";

        let newFileName = v4() + final;
        const destinationPath = path.join(articles_dir(), newFileName);

        const url = await new Promise((res, rej) =>
          createReadStream()
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
        return await newMedia.save();
      })
    );

    let justNames = [...names.map(i => i.name)];

    return Promise.resolve({
      msg: justNames,
      code: "200"
    });
  } catch (error) {
    throw new ApolloError(error);
  }
};

export const addMedia = async (files: [FileUpload], ctx: any) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtMedia.validateToken(token);

    let tokenData: any = await JwtMedia.decrypt_data(localToken)();
    let multiplier = 2;

    let names = await Promise.all(
      await files.map(async (file: any) => {
        const { createReadStream, filename, mimetype } = await file;

        const semiTransparentRedPng = sharp().resize(1200);

        let final = ".png";
        if (mimetype == "image/png") {
          final = ".png";
          semiTransparentRedPng.png();
        } else if (mimetype == "image/jpg") {
          final = ".jpg";
          semiTransparentRedPng.jpeg();
        } else if (mimetype == "image/jpeg") {
          final = ".jpeg";
          semiTransparentRedPng.jpeg();
        } else {
          throw new ApolloError("File extension not valid");
        }

        let newFileName = v4() + final;
        const destinationPath = path.join(public_dir(), newFileName);

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
        multiplier++;
        return await newMedia.save();
      })
    );

    // * sets the reward for uploading files to the ecolote server
    let ticketToken = new jwtTicket({
      multiplier: multiplier.toString(),
      userId: tokenData.userId
    });
    await ticketToken.create_token("1h");

    let justNames = [...names.map(i => i.name)];

    return Promise.resolve({
      msg: justNames,
      code: "200",
      token: ticketToken.token
    });
  } catch (error) {
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

export const get_public = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log("send file");

    let { id } = req.params;
    let path_image = path.join(public_dir(), id);

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

export const get_article = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let { id } = req.params;
    let path_image = path.join(articles_dir(), id);

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
      await mkdirSync(media_dir());
    }
    if (await !existsSync(public_dir())) {
      await mkdirSync(public_dir());
    }
    if (await !existsSync(articles_dir())) {
      await mkdirSync(articles_dir());
    }
    return Promise.resolve();
  } catch (error) {
    throw error;
  }
};
