import mongoose, { Model } from "mongoose";
import {
  SoftDeleteDocument,
  SoftDeleteInterface,
  SoftDeleteModel
} from "mongoose-delete";

type errorOrBool = boolean | never;

enum rarityEmun {
  Normal = "normal",
  Epic = "epic",
  Legendary = "legendary"
}

enum gendreEmun {
  Famele = "famele",
  Male = "male",
  Nobinary = "nobinary"
}

export interface ChallengeModelType
  extends mongoose.Document,
    SoftDeleteDocument {
  title: string;
  subtitle: string;
  created_at: string;
  updated_at: string;
  created_by: mongoose.Types.ObjectId;
  updated_by: mongoose.Types.ObjectId;
  badges: {
    type: mongoose.Types.ObjectId;
    zone: mongoose.Types.ObjectId;
    rarity: mongoose.Types.ObjectId;
  };
  points: string;
  rarity: rarityEmun;
  description: [string];
  portrait: mongoose.Types.ObjectId;
  arena: { _id: mongoose.Types.ObjectId };
  gendre: gendreEmun;
  minAge: number;
  location: {
    country: {
      type: string;
    };
    region: {
      type: string;
    };
    city: {
      type: string;
    };
    timezone: {
      type: string;
    };
    ll: {
      type: Array<number>;
    };
  };
}

export interface ChallengeModelStaticsType
  extends SoftDeleteModel<ChallengeModelType> {}
