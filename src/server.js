require("dotenv/config");
const helmet = require("helmet");
const compress = require("compression");
const express = require("express");
const Service = require("./Util/service");
const routes = require("./routes");
const errorMiddleware = require("./Middleware/error");

process.nextTick(() => Server.start(true));

/**
 * @description ->  This class is used to setup and initiate the express server
 */
class Server {
  /**
   * @description -> Creates an instance of Server.
   */
  constructor() {
    this.app = express();
    this.registerEvents();
    this.mountPreRouteMiddleware();
    this.mountRoutes();
    this.mountPostRouteMiddleware();
    this.listen();
  }

  /**
   * @description ->  Instance method to register callbacks for node process events.
   */
  registerEvents() {
    process.on("unhandledRejection", Service.uhr);
    process.on("uncaughtException", Service.uce);
    process.on("SIGTERM", Service.sigterm);
    process.on("warning", Service.warning);
    process.on("SIGHUP", Service.sighup);
    process.on("exit", Service.exit);
  }

  /**
   * @description ->  Instance method to add the necessary middleware.
   */
  mountPreRouteMiddleware() {
    this.app.enable("trust proxy");
    this.app.use(helmet());
    this.app.use(compress());
    this.app.use(express.json(Service.limit));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.cors);
  }

  /**
   * @description ->  Options route to handle pre-flight requests.
   */
  cors(req, res, next) {
    if (req.headers?.origin?.includes("api.plantix")) {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header("Access-Control-Max-Age", "86400");
      res.header("Cache-Control", "public, max-age=86400");
      res.header("Vary", "origin");
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With, x-api-key"
      );

      if (req.method === "OPTIONS") return res.send(200);
    }
    next();
  }

  /**
   * @description ->  Instance method to probe the service health
   *                  called by aws ALB.
   */
  ping() {
    this.app.get("/ping", (req, res, next) => {
      return res.send(`PONG : ${Service._name} service is awake...`);
    });
  }

  /**
   *  @description ->  Instance method to add routes to the server.
   */
  mountRoutes() {
    this.ping();
    routes.forEach(route => {
      this.app.use("", route.router);
    });
  }

  /**
   * @description ->  This middlewhere is responsible for sending
   *                  the error response for all routes
   */
  mountPostRouteMiddleware() {
    this.app.use(errorMiddleware);
  }

  /**
   * @description ->  Instance method to start listening for network events.
   */
  listen() {
    this.app.listen(Service.port, Service.listen);
  }

  /**
   * @description -> Instance method to get all registered express routes.
   */
  getAllRoutes() {
    let routes = new Set();
    function print(path, layer) {
      if (layer.route) {
        layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))));
      } else if (layer.name === "router" && layer.handle.stack) {
        layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))));
      } else if (layer.method) {
        routes.add(
          layer.method.toUpperCase() +
            " " +
            path.concat(split(layer.regexp)).filter(Boolean).join("/")
        );
      }
    }

    function split(thing) {
      if (typeof thing === "string") {
        return thing.split("/");
      } else if (thing.fast_slash) {
        return "";
      } else {
        var match = thing
          .toString()
          .replace("\\/?", "")
          .replace("(?=\\/|$)", "$")
          .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
        return match
          ? match[1].replace(/\\(.)/g, "$1").split("/")
          : "<complex:" + thing.toString() + ">";
      }
    }
    this.app._router.stack.forEach(print.bind(null, []));
    console.log(routes);
    return this;
  }

  /**
   * @description ->  Class method to initiate Server class
   */
  static start(log = false) {
    return log ? new Server().getAllRoutes() : new Server();
  }
}
