import { check } from "express-validator";

import JwtMedia from "../jwtMedia";
import mediaModel from "../../models/media";

export const get_image = [
  check("token")
    .exists()
    .isJWT()
    .custom(async (val: string) => {
      console.log(val);

      try {
        let localToken = await JwtMedia.validateToken(val);
        return true;
      } catch (error) {
        throw error;
      }
    }),
  check("id")
    .exists()
    .custom(async (val: string) => {
      try {
        let localToken = await mediaModel.findOne({ name: val });
        console.log(localToken);

        if (localToken) return true;
        throw new Error();
      } catch (error) {
        console.log(error);

        throw error;
      }
    })
];

export const get_article_image = [
  check("token")
    .exists()
    .isJWT()
    .custom(async (val: string) => {
      console.log(val);

      try {
        let localToken = await JwtMedia.validateToken(val);
        return true;
      } catch (error) {
        throw error;
      }
    })
];
