import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Query,
  ID,
  Authorized
} from "type-graphql";

import { GraphQLUpload, FileUpload } from "graphql-upload";
import { SuccessResponse, Media, findInput } from "../schema/MediaSchema";
import { addMedia, getMedia, deleteMedia } from "../controllers/media";
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

  @Authorized()
  @Query(returns => [Media])
  async Media(@Arg("findInput", () => findInput) findInput: findInput) {
    let msg = await getMedia(findInput);
    return [...msg];
  }

  @Authorized("ADMIN")
  @Query(returns => SuccessResponse)
  async deleteMedia(@Arg("id", () => ID) id: string, @Ctx() ctx: any) {
    let msg = await deleteMedia({ id }, ctx);
    return msg;
  }
}
