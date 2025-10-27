import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(email: string, name: string, url: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[DailyMeal] 비밀번호 재설정 안내',
      html: `
        <p>안녕하세요, ${name}님.</p>
        <p>비밀번호를 재설정하려면 아래 링크를 클릭하세요.</p>
        <a href="${url}">비밀번호 재설정</a>
        <p>이 링크는 1시간 동안 유효합니다.</p>
      `,
    });
  }

  async sendUsernameReminderEmail(email: string, username: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[DailyMeal] 아이디 찾기 안내',
      html: `
        <p>안녕하세요.</p>
        <p>요청하신 DailyMeal 아이디는 <strong>${username}</strong> 입니다.</p>
      `,
    });
  }
}
