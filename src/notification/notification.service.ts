import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { LoggerUtil } from '../common/utils/logger.util';

@Injectable()
export class NotificationService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<boolean>('SMTP_SECURE', false),
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendWelcomeEmail(email: string, name: string, password: string) {
        const mailOptions = {
            from: this.configService.get<string>('SMTP_FROM', '"Niyaku Team" <no-reply@niyaku.com>'),
            to: email,
            subject: 'Welcome to Niyaku - Your Account Credentials',
            html: `
        <h1>Welcome to Niyaku, ${name}!</h1>
        <p>Your account has been successfully created.</p>
        <p>Here are your temporary credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Please log in and change your password immediately.</p>
        <br>
        <p>Best regards,</p>
        <p>The Niyaku Team</p>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            LoggerUtil.logDatabaseCall(`Email sent to ${email}`, 0, 'NotificationModule'); // Logging as DB call for now or use a different logger
        } catch (error) {
            LoggerUtil.logError(error, 'NotificationModule', { email });
            // Don't throw error to avoid blocking the user creation flow, just log it
        }
    }
}
