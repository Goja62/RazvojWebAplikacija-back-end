/* eslint-disable prettier/prettier */
import { ArticleFeatureComponentDto } from "./article.feature.component.dto";
export class AddArticleDto {
    name: string;
    categoryId: number;
    excerpt: string;
    description: string;
    price: number;
    features: ArticleFeatureComponentDto[]
}
