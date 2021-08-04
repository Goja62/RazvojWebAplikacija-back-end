/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { MailConfig } from "config/mail.config";
import { CartArticle } from "src/entities/cart-article.entiry";
import { Order } from "src/entities/order.entity";

@Injectable()
export class OrderMailer {
    constructor(private readonly mailerService: MailerService) {}

    async sendOrderEmail(order: Order): Promise<boolean> {
        try {
            this.mailerService.sendMail({
                to: order.cart.user.email,
                bcc: MailConfig.orderNotificatiomMail,
                subject: 'Order deatails',
                encoding: 'UTF-8',
                html: this.makeOrderHtml(order),
            })
        } catch (e){
            return false
        }
    }

    private makeOrderHtml(order: Order): string {
        let suma = order.cart.cartArticles.reduce((sum, current: CartArticle) => {
            return sum +
                   current.quantity *
                   current.article.articlePrices[current.article.articlePrices.length-1].price
        }, 0);
        
        return `<p>Zahvaljujemo se za Vašu porudžbinu!</p>
                <p>Ovo su detalji Vaše porudžbine:</p>
                <ul>
                    ${ order.cart.cartArticles.map((cartArticle: CartArticle) => {
                        return `<li>
                                    ${ cartArticle.article.name } X
                                    ${ cartArticle.quantity }
                                </li>`;
                    }).join("") }
                </ul>
                <p>Ukupan iznos je: ${ suma.toFixed(2) } EUR.</p>
                <p>Goja...</p>`;
    }
}

