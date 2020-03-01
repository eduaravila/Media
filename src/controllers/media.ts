import moment from "moment";
import { ApolloError } from "apollo-server-express";
import { createWriteStream, unlink } from "fs";
import path from "path";
import os from "os";
import { GraphQLUpload, FileUpload } from "graphql-upload";

import challengeModel from "../models/challenge";
import { findInput } from "../schema/MediaSchema";
import JwtAdmin from "../utils/jwtAdmin";
import { decrypt, encrypt } from "../utils/crypt";

export const addMedia = async (file: FileUpload, ctx: any) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtAdmin.validateToken(token);

    let tokenData: any = await JwtAdmin.decrypt_data(localToken)();
    if (ctx.req.ipInfo.error) {
      ctx.req.ipInfo = {};
    }

    let {
      country = "",
      region = "",
      city = "",
      timezone = "",
      ll = []
    } = ctx.req.ipInfo;

    const { createReadStream, filename } = await file;

    const destinationPath = path.join(os.tmpdir(), filename);

    const url = await new Promise((res, rej) =>
      createReadStream()
        .pipe(createWriteStream(destinationPath))
        .on("error", rej)
        .on("finish", () => {
          // Do your custom business logic

          // Delete the tmp file uploaded
          unlink(destinationPath, () => {
            res("your image url..");
          });
        })
    );

    return Promise.resolve({ msg: "File added succesfully", code: "200" });
  } catch (error) {
    console.log(error);

    return new ApolloError(error);
  }
};

// export const getChallenges = async ({
//   page = 0,
//   size = 0,
//   search
// }: findInput) => {
//   try {
//     let offset = page * size;
//     let limit = offset + size;

//     let result =
//       search.length > 0
//         ? await challengeModel
//             .find({
//               $or: [
//                 { title: { $regex: ".*" + search + ".*" } },
//                 { _id: { $regex: ".*" + search + ".*" } },
//                 { arena: { $regex: ".*" + search + ".*" } }
//               ]
//             })
//             .skip(offset)
//             .limit(limit)
//             .lean()
//         : await challengeModel
//             .find({})
//             .skip(offset)
//             .limit(limit)
//             .lean();
//     let descripted_result = result.map(i => ({
//       ...i,
//       points: decrypt(i.points)
//     }));
//     return Promise.resolve(descripted_result);
//   } catch (error) {
//     new ApolloError(error);
//   }
// };

// export const deleteChallenge = async ({ id }: any, ctx: any) => {
//   try {
//     let token = ctx.req.headers.token;

//     let localToken = await JwtAdmin.validateToken(token);

//     let tokenData: any = await JwtAdmin.decrypt_data(localToken)();

//     let deletedChallenge = await challengeModel.delete(
//       { $and: [{ _id: id }, { created_by: tokenData.userId }] },
//       tokenData.userId
//     );

//     return Promise.resolve(`${deletedChallenge._id} succesfully created`);
//   } catch (error) {
//     new ApolloError(error);
//   }
// };

// export const modifyChallenge = async (
//   {
//     id,
//     title,
//     subtitle,
//     badges,
//     points,
//     rarity,
//     description,
//     portrait,
//     arena,
//     gendre,
//     minAge
//   }: ModifyChallenge,
//   ctx: any
// ) => {
//   try {
//     if (ctx.req.ipInfo.error) {
//       ctx.req.ipInfo = {};
//     }

//     let {
//       country = "",
//       region = "",
//       city = "",
//       timezone = "",
//       ll = []
//     } = ctx.req.ipInfo;

//     let token = ctx.req.headers.token;
//     let localToken = await JwtAdmin.validateToken(token);

//     let tokenData: any = await JwtAdmin.decrypt_data(localToken)();
//     let pointsEncripted = points ? encrypt(points.toString()) : undefined;

//     let updatedChallenge = await challengeModel.findByIdAndUpdate(
//       id,
//       {
//         title,
//         subtitle,
//         badges,
//         points: pointsEncripted,
//         rarity,
//         created_by: tokenData.userId,
//         updated_by: tokenData.userId,
//         description,
//         portrait,
//         arena,
//         gendre,
//         minAge,
//         updated_at: moment().format("YYYY-MM-DD/HH:mm:ZZ"),
//         location: {
//           country,
//           region,
//           city,
//           timezone,
//           ll
//         }
//       },
//       { omitUndefined: true }
//     );

//     return Promise.resolve(`${updatedChallenge._id} succesfully updated`);
//   } catch (error) {
//     throw new ApolloError(error);
//   }
// };
