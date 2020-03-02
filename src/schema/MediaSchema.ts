import {
  ObjectType,
  Field,
  Directive,
  Int,
  InputType,
  registerEnumType,
  ID
} from "type-graphql";
import mongoose from "mongoose";
import {
  Trim,
  SanitizerConstraint,
  SanitizerInterface,
  Sanitize
} from "class-sanitizer";
import mediaModel from "../models/media";

@SanitizerConstraint()
export class toLowerCase implements SanitizerInterface {
  sanitize(text: string): string {
    return text.toLowerCase();
  }
}

@ObjectType()
export class SuccessResponse {
  @Field(type => String)
  msg?: string;

  @Field(type => String)
  code?: string;
}

@ObjectType()
export class SuccessResponseArray {
  @Field(type => [String])
  msg?: [string];

  @Field(type => String)
  code?: string;
}

@ObjectType()
export class SuccessResponseTicket {
  @Field(type => [String])
  msg?: [string];

  @Field(type => String)
  token?: string;

  @Field(type => String)
  code?: string;
}

@Directive(`@key(fields:"_id")`)
@ObjectType()
export class Media {
  @Field(type => ID, { nullable: false })
  _id: mongoose.Types.ObjectId;

  @Field(type => String, { nullable: true })
  name: string;

  @Field(type => String, { nullable: true })
  original_name: string;

  @Field(type => String, { nullable: true })
  link: string;

  @Field(type => String, { nullable: true })
  created_at: string;

  @Field(type => String, { nullable: true })
  updated_at: string;

  @Field(type => ID, { nullable: true })
  updated_by: mongoose.Types.ObjectId;

  @Field(type => ID, { nullable: true })
  created_by: mongoose.Types.ObjectId;
}

@InputType()
export class findInput {
  @Field(type => Int, { nullable: true })
  page: number;

  @Field(type => Int, { nullable: true })
  size: number;

  @Field(type => String, { nullable: true, defaultValue: "" })
  @Trim()
  @Sanitize(toLowerCase)
  search: string;
}

export async function resolveMediaReference(
  reference: Pick<Media, "_id">
): Promise<Media> {
  let result = await mediaModel.findOne({ _id: reference._id });

  return result;
}
