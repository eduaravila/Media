import { Resolver, Mutation, Arg, Ctx, Query, ID } from "type-graphql";

import { GraphQLUpload, FileUpload } from "graphql-upload";
import { SuccessResponse } from "../schema/MediaSchema";
import { addMedia } from "../controllers/media";
import { ApolloError } from "apollo-server-express";

@Resolver()
export class MediaResolver {
  @Mutation(() => SuccessResponse)
  async uploadImage(
    @Arg("file", () => GraphQLUpload)
    file: FileUpload,
    @Ctx() ctx: any
  ): Promise<SuccessResponse | ApolloError> {
    return await addMedia(file, ctx);
  }
}
