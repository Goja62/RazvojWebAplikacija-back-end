/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { Article } from "src/entities/article.entity";
import { ArticleService } from "src/services/article/article.service";

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
    ) {}

    @Post('createFull')  //POST http://localhost:3000/api/article/
    createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }
}