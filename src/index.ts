import './scss/styles.scss';

import { ensureElement, cloneTemplate, createElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { WebLarekApi } from './components/webLarekApi';
import { CDN_URL, API_URL } from './utils/constants';
import { Page } from './components/page';
import { AppData, ProductItem } from './components/appState';
import { IProduct, IOrder, IOrderForm } from './types';
import { Card } from './components/card';
import { Modal } from './components/common/modal';
import { Basket } from './components/common/basket';
import { Order } from './components/order';


const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

const page = new Page(document.body, events);
const appData = new AppData(events);

const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);




events.on<IProduct>('items:show', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            description: item.description,
            price: item.price,
            category: item.category,
            id: item.id
        });
    });
});

events.on('card:select', (item: ProductItem) => {
    appData.setPreview(item);
});

events.on('product:order', (item: ProductItem) => {          
    appData.addToBasket(item);
    page.counter = appData.basket.length;
});

events.on('preview:show', (item: ProductItem) => {
    const showItem = (item: ProductItem) => {
        const card = new Card(cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                events.emit('product:order', item);
                modal.close();
            }
        });
        modal.render({
            content: card.render({
                title: item.title,
                image: item.image,
                description: item.description,
                price: item.price,
                category: item.category,
                id: item.id
            })
        });
    };

    if (item) {
        api.getProductInfo(item.id)
            .then((result) => {
                item.description = result.description;
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});

events.on('basket:open', () => {

    basket.items = appData.basket.map(item => {
        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('card:delete', item)
        });
        return card.render({
            title: item.title,
            price: item.price,
            id: item.id,
            
        });
    });
    basket.total = appData.getTotal();
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            // tabs.render({
            //     selected: 'closed'
            // }),
            basket.render()
        ])
    });
});

events.on('card:delete', (item: ProductItem) => {
    appData.deleteFromBasket(item);
    page.counter = appData.basket.length;
    events.emit('basket:open');
})

events.on('formErrors:change', (errors: Partial<IOrder>) => {
    const { address, email, phone } = errors;
    order.valid = !email && !phone && !address;
    order.errors = Object.values({address, phone, email}).filter(i => !!i).join('; ');
});

events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

events.on('order:open', () => {
    modal.render({
        content: order.render({
            address: '',
            valid: false,
            errors: [],
        })
    })
})


events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});


api.getProductList()
.then((data) => {
    appData.setCatalog(data);
})
// .then(appData.setCatalog.bind(appData))
.catch(err => {
    console.error(err);
});
