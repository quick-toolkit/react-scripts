import { Typed } from '@quick-toolkit/class-transformer';

export class LoginVo {
  @Typed({
    required: true,
  })
  username: string;

  @Typed({
    required: true,
  })
  password: string;
}
