import fs from 'fs';
import path from 'path';
import { transformer } from '../utils';
import { Swagger } from './swagger/swagger';
import { SwaggerGeneratorDto } from './swagger/swagger-generator-dto';
import { OpenApi } from './swagger/open-api';
import { SwaggerGeneratorVo } from './swagger/swagger-generator-vo';
import { OpenApiDefinition } from './swagger/open-api/open-api-definition';
import { SwaggerGenerator } from './swagger/swagger-generator';

/**
 * 编译swagger api文件
 */
export async function swaggerGenerator(): Promise<void> {
  if (fs.existsSync(path.resolve('project.config.js'))) {
    const config = require(path.resolve('project.config.js'));
    if (config && Array.isArray(config.swaggers)) {
      const swaggers = config.swaggers.map((x: any) =>
        transformer.transform(Swagger, x)
      );
      for (const swagger of swaggers) {
        const res: OpenApi = await swagger.loadFile();
        const outputs: SwaggerGenerator[] = swagger.outputs;
        for (const output of outputs) {
          for (const dto of output.dtos) {
            const pathMethod = res.paths.get(dto.path);
            if (pathMethod) {
              const pathMethodInfo =
                pathMethod[dto.method as 'get' | 'post' | 'put' | 'delete'];
              if (pathMethodInfo) {
                await pathMethodInfo.createFile(
                  (res.basePath || '') + dto.path,
                  dto.method,
                  dto.name,
                  output.dest,
                  output
                );
              }
            }
          }
          for (const vo of output.vos) {
            let definition: OpenApiDefinition | undefined = undefined;
            if (res.definitions) {
              definition = res.definitions.get(vo.target);
            }
            if (res.components) {
              definition = res.components.get(vo.target);
            }

            if (definition) {
              await definition.createFile(
                vo.name || definition.title,
                output.dest,
                output
              );
            }
          }
        }
      }
    }
  }
}
