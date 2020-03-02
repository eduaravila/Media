import mongoose, { Schema, mongo } from "mongoose";
import mongoose_delete from "mongoose-delete";
import bc from "bcrypt";
import moment from "moment";
import { MediaModelType, MediaModelStaticsType } from "./types";

const Media_schema: Schema = new mongoose.Schema({
  original_name: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    unique: true
  },
  created_by: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  updated_by: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  created_at: {
    type: String,
    required: true,
    default: moment().format("YYYY-MM-DD/HH:mm:ZZ")
  },
  updated_at: {
    type: String,
    required: true,
    default: moment().format("YYYY-MM-DD/HH:mm:ZZ")
  }
});

Media_schema.plugin(mongoose_delete, {
  deletedAt: true,
  indexFields: true,
  overrideMethods: true,
  deletedBy: true
});

const media_model = mongoose.model<MediaModelType, MediaModelStaticsType>(
  "media",
  Media_schema
);

export default media_model;
