const bcrypt = require("bcrypt");

class Password {
  static async hash(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  static async compare(password, hash) {
    const match = await bcrypt.compare(password, hash);
    return match;
  }
}

module.exports = Password;
