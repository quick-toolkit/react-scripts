import { Typed } from '@quick-toolkit/class-transformer';
/**
 * 输出信息
 */
export class OpenApiItems {
  @Typed()
  public $ref?: string;

  @Typed()
  public type?: string;

  @Typed()
  public format?: string;
}
