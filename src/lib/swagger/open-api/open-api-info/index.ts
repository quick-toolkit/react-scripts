import { Typed } from '@quick-toolkit/class-transformer';
/**
 * OpenAPI info docs
 */
export class OpenApiInfo {
  @Typed()
  public version: string;

  @Typed()
  public title: string;

  @Typed()
  public description?: string;
}
