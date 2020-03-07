import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import express_user_ip from "express-ip";
import bp from "body-parser";
import cluster from "cluster";
import { createServer } from "http";
import connectDB from "./DB/index";
import { MediaResolver } from "./resolvers/MediaResolver";
import { buildSchema } from "type-graphql";
import { customAuthChecker } from "./utils/validator/autorized";
import mediaRouter from "./routes/media";
import { make_media_dir } from "./controllers/media";
const dotenv = require("dotenv");

dotenv.config({ path: process.env.DEV ? ".env.dev" : ".env.prod" });

const PORT: string = process.env.PORT || "3000";

if (cluster.isMaster) {
  cluster.fork();

  cluster.on("exit", function(worker, code, signal) {
    cluster.fork();
  });
}
if (cluster.isWorker) {
  (async () => {
    try {
      // Initialize the app
      const app = express();

      app.use(
        /\/((?!graphql).)*/,
        bp.urlencoded({
          limit: "50mb",
          extended: true
        })
      );
      app.use(
        /\/((?!graphql).)*/,
        bp.json({
          limit: "50mb"
        })
      );
      app.use(express_user_ip().getIpInfoMiddleware); //* get the user location data
      app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*"); //* dominios por donde se permite el acceso
        res.setHeader(
          "Access-Control-Allow-Methods",
          "POST,GET,DELETE,UPDATE,PUT"
        ); //* metodos permitidos por el cliente
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With,token"
        );
        //* dominios por donde se permite el acceso
        //* graph ql no envia una respuesta valida con el tipo options, cuando hay un tipo de request OPTIONS se retorna una respuesta con el estado 200
        // * graphql does not send a valid response when the OPTIONS request is received, if a OPTIONS request type is presented server return an empty response with the code 200

        if (req.method === "OPTIONS") {
          res.sendStatus(200);
        }
        next();
      });
      const httpServer = createServer(app);
      const server = new ApolloServer({
        schema: await buildSchema({
          resolvers: [MediaResolver],
          authChecker: customAuthChecker
        }),

        context: req => req,
        formatError: err => {
          return err;
        }
      });
      // The GraphQL endpoint
      server.applyMiddleware({ app, path: "/graphql" });
      app.use(mediaRouter);

      // Start the server
      await connectDB();
      await make_media_dir();
      httpServer.listen(PORT, () => {
        console.log(`Go to http://localhost:${PORT}/graphiql to run queries!`);
      });
    } catch (error) {
      console.log(error);
    }
  })();
}
