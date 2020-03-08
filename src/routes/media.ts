import { Router } from "express";

import { get_image, get_article_image } from "../utils/validator/media";
import {
  get_image as get_image_controller,
  get_article,
  get_public
} from "../controllers/media";

let router = Router();
router.get("/image/:id/:token", get_article_image, get_image_controller);

router.get("/public/:id", get_image, get_public);

router.get("/article/:id", get_article_image, get_article);

export default router;
