import {MailerModule} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {join} from 'path';
import {ConfigService} from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: config.get("MAIL_TRANSPORT"),
        defaults: {
          from: `PixelHub <${config.get("MAIL_USER")}>`,
          attachments: [{
            filename: 'pixelhub_logo.png',
            path: __dirname +'/templates/images/pixelhub_logo.png',
            cid: 'logo'
          }]
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
}