import { resolve } from 'path';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import { defaults, omit } from 'lodash';
import AWS from 'aws-sdk';

import translator from '../utils/translator';

export default ({ config }) => {
  AWS.config.update({
    credentials: {
      accessKeyId: config.aws.key,
      secretAccessKey: config.aws.secret,
    },
    region: 'eu-west-1',
  });
  const SES = new AWS.SES({
    apiVersion: '2010-12-01',
  });
  const transport = nodemailer.createTransport({ SES });
  const email = new Email({
    message: {
      from: 'noreply@wekey.fr',
    },
    transport,
    send: true,
    views: {
      root: resolve(__dirname, '../../assets/emails'),
      options: {
        extension: 'ejs',
      },
    },
    preview: {
      dir: resolve(__dirname, '../../tmp'),
      open: false,
    },
  });

  function factory(template) {
    return (data, callback) => {
      console.log('-----------------------------', data);
      email
        .send({
          template,
          message: { to: data.to, replyTo: 'lecunffxavier@gmail.com' },
          locals: defaults(
            { locale: translator(data.locale || 'fr') },
            omit(data, ['to', 'locale'])
          ),
        })
        .then((msg) => {
          console.log('TEST -----------', msg);
          callback(null, msg);
        })
        .catch((err) => {
          console.log('ERR --------------', err);
          callback(err);
        });
    };
  }

  return {
    invite: factory('invite'),
  };
};
