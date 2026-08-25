const nodemailer = require("nodemailer");

const { env } = require("../config/env");

const getMailConfig = () => ({
  host: env.MAIL.SERVER,
  port: env.MAIL.PORT,
  secure: env.MAIL.SECURE,
  user: env.MAIL.USERNAME,
  pass: env.MAIL.PASSWORD,
  from: env.MAIL.FROM,
});

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const { host, port, secure, user, pass } = getMailConfig();

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    authMethod: "LOGIN",
    auth: {
      user,
      pass,
    },
    requireTLS: !secure,
    tls: {
      servername: host || undefined,
    },
  });

  return transporter;
};

module.exports = {
  getMailConfig,
  getTransporter,
};
