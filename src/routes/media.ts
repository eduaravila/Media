import { Router } from "express";

import { get_image } from "../utils/validator/media";
import { get_image as get_image_controller } from "../controllers/media";

let router = Router();
router.get("/image/:id", get_image, get_image_controller);

export default router;
