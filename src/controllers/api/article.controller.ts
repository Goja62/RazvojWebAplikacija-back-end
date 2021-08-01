/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { Article } from "src/entities/article.entity";
import { ArticleService } from "src/services/article/article.service";
import { diskStorage } from "multer";
import { StorageConfig } from "config/storage.config";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { ApiResponse } from "src/misc/api.response.class";

@Controller('api/article')
@Crud({
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true,
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            photos: {
                eager: true
            },
            articlePrices: {
                eager: true
            },
            articleFeatures: {
                eager: true
            },
            features: {
                eager: true
            }
        }
    },
})
export class ArticleController {
    constructor(
        public service: ArticleService,
        public photoService: PhotoService,
    ) {}

    @Post('createFull')  //POST http://localhost:3000/api/article/
    createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }

    @Post(':id/uploadPhoto/') // POST http://localhost:3000/api/article/:id/uploadPhoto/ 
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photoDestination,  
                filename: (req, file, callback) => {
                    let original = file.originalname;

                    let normalized = original.replace(/\s+/g, '-');
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, '');
                    let sada = new Date();
                    let datePart = '';
                    datePart += sada.getFullYear().toString();
                    datePart += (sada.getMonth() + 1).toString();
                    datePart += sada.getDate().toString();

                    let randomPart: string =
                        new Array(10)
                            .fill(0)
                            .map(e => (Math.random() * 9).toFixed(0).toString())
                            .join('');

                    let fileName = datePart + '-' + randomPart + '-' + normalized;
                    fileName = fileName.toLocaleLowerCase();

                    callback(null, fileName);
                }
            }),
            fileFilter: (req, file, callback) => {
                // 1. Check ekstenzije: JPG, PNG
                if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
                    req.fileFilterError = 'Bad file extension!';
                    callback(null, false);
                    return;
                }

                // 2. Check tipa sadrzaja: image/jpeg, image/png (mimetype)
                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    req.fileFilterError = 'Bad file content type!';
                    callback(null, false);
                    return;
                }

                callback(null, true);
            },
            limits: {
                files: 1,
                fileSize: StorageConfig.maxSize
            },
        })
    )
    async uploadPhoto(@Param('id') articleId: number, @UploadedFile() photo): Promise<Photo | ApiResponse> {
        let imagePath = photo.filename; // Zapis za bazu podataka

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto) {
            return new ApiResponse('error', -4001, 'Photo not uploaded!');
        }

        return savedPhoto;

    }
}   