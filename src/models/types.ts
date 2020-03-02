import mongoose, { Model } from "mongoose";
import {
  SoftDeleteDocument,
  SoftDeleteInterface,
  SoftDeleteModel
} from "mongoose-delete";

export interface MediaModelType extends mongoose.Document, SoftDeleteDocument {
  original_name: string;
  name: string;
  link: string;
  created_at: string;
  updated_at: string;
  created_by: mongoose.Types.ObjectId;
  updated_by: mongoose.Types.ObjectId;
}

export interface MediaModelStaticsType
  extends SoftDeleteModel<MediaModelType> {}
