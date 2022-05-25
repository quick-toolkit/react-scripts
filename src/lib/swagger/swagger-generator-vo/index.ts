import { Typed } from '@quick-toolkit/class-transformer';
/**
 * @class SwaggerGeneratorDto
 */
export class SwaggerGeneratorVo {
  /**
   * 目标模型
   */
  @Typed()
  public target: string;

  /**
   * 生成的名称
   */
  @Typed()
  public name?: string;
}
