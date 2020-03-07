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
import {
  SuccessResponse,
  Media,
  findInput,
  SuccessResponseArray,
  SuccessResponseTicket
} from "../schema/MediaSchema";
import {
  addMedia,
  getMedia,
  deleteMedia,
  addMediaAdmin,
  addArticleAdmin
} from "../controllers/media";
import { ApolloError } from "apollo-server-express";

@Resolver()
export class MediaResolver {
  @Mutation(() => SuccessResponseTicket)
  async uploadImage(
    @Arg("file", () => [GraphQLUpload])
    files: [FileUpload],
    @Ctx() ctx: any
  ) {
    return await addMedia(files, ctx);
  }

  @Authorized("ADMIN")
  @Mutation(() => SuccessResponseArray, {
    description: "Admin query 🔏"
  })
  async uploadImageAdmin(
    @Arg("file", () => [GraphQLUpload])
    files: [FileUpload],
    @Ctx() ctx: any
  ) {
    return await addMediaAdmin(files, ctx);
  }

  @Authorized("ADMIN")
  @Mutation(() => SuccessResponseArray)
  async uploadArticleAdmin(
    @Arg("file", () => [GraphQLUpload])
    files: [FileUpload],
    @Ctx() ctx: any
  ) {
    return await addArticleAdmin(files, ctx);
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
