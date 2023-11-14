/**
 * @description ->  This class defines the nature of this service
 *                  and implements process callbacks.
 */
class Service {
  static name = process.env.NAME;
  static port = process.env.PORT;
  static limit = { limit: process.env.LIMIT };
  static env = process.env.NODE_ENV;

  /**
   * @description ->  callback for uncaughtException event
   */
  static uce(e) {
    console.error("There was an uncaught error...", e);
    process.exit(1);
  }

  /**
   * @description ->  callback for unhandledRejection event
   */
  static uhr(r, p) {
    console.error("Unhandled Rejection at:", p, "reason:", r);
    process.exit(1);
  }

  /**
   * @description ->  callback for warning event
   */
  static warning(w) {
    console.warn("Warning...", w);
  }

  /**
   * @description ->  callback for exit event
   */
  static exit(c) {
    console.log(`Process exited with code ${c}...`);
  }

  /**
   * @description ->  callback for SIGTERM event
   */
  static sigterm() {
    console.log(`Received SIGTERM signal, shutting down gracefully...`);
    process.exit(0);
  }

  /**
   * @description ->  callback for SIGHUP event
   */
  static sighup() {
    console.log(`Received SIGHUP signal, reloading configuration...`);
  }

  /**
   * @description ->  callback for listen event
   */
  static listen() {
    console.log(
      `<----------${Service.name} is ready to serve requests on port:${Service.port}---------->`
    );
  }
}

module.exports = Service;
