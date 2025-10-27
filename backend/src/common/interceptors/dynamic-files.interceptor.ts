import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Type,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '../../config/config.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createUploadPath, ensureDirectoryExists } from '../upload.utils';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * ConfigService를 사용하여 동적으로 Multer 설정을 생성하는 FilesInterceptor를 반환하는 팩토리 함수.
 * 데코레이터 실행 시점 문제를 해결하기 위해 사용합니다.
 */
export function DynamicFilesInterceptor(
  fieldName: string,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private readonly interceptor: NestInterceptor;

    constructor(private readonly configService: ConfigService) {
      const UPLOAD_DIR = this.configService.get('UPLOAD_DIR');
      const UPLOAD_MAX_FILE_SIZE = parseInt(
        this.configService.get('UPLOAD_MAX_FILE_SIZE'),
        10,
      );
      const UPLOAD_MAX_FILES = parseInt(
        this.configService.get('UPLOAD_MAX_FILES'),
        10,
      );

      if (
        !UPLOAD_DIR ||
        isNaN(UPLOAD_MAX_FILE_SIZE) ||
        isNaN(UPLOAD_MAX_FILES)
      ) {
        throw new Error('Upload configuration is missing or invalid.');
      }

      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination: (req, file, callback) => {
            const { dirPath } = createUploadPath('', {
              uploadDir: UPLOAD_DIR,
              category: 'meals',
              useDate: true,
            });
            ensureDirectoryExists(dirPath);
            callback(null, dirPath);
          },
          filename: (req, file, callback) => {
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            callback(null, uniqueName);
          },
        }),
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('이미지 파일만 업로드 가능합니다'), false);
          }
          callback(null, true);
        },
        limits: {
          fileSize: UPLOAD_MAX_FILE_SIZE,
          files: UPLOAD_MAX_FILES,
        },
      };

      this.interceptor = new (FilesInterceptor(
        fieldName,
        UPLOAD_MAX_FILES,
        multerOptions,
      ))();
    }

    intercept(context: ExecutionContext, next: CallHandler) {
      return this.interceptor.intercept(context, next);
    }
  }

  return MixinInterceptor as Type<NestInterceptor>;
}
