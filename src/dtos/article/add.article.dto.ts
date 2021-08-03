/* eslint-disable prettier/prettier */
import * as Validator from 'class-validator';
import { ArticleFeatureComponentDto } from './article.feature.component.dto';

export class AddArticleDto {
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5, 128)
    name: string;

    categoryId: number;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 255)
    excerpt: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(64, 10000)
    description: string;

    price: number;
    @Validator.IsNotEmpty()
    @Validator.IsPositive()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })

    @Validator.IsArray()
    @Validator.ValidateNested({
        always: true,
    })
    features: ArticleFeatureComponentDto[];
}
