# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура проекта

**Базовые классы**

Класс **Api** - служит для связи с сервером, отправления и получения запросов
Имеет методы: 
- handleResponse - первоначальная обработка получаемых данных через метод json
- get - получение запроса
- post - отправка запроса

Класс **EventEmitter** - служит для обработки событий
Имеет методы:
- on - подписка на событие
- off - отписка от события
- emit - уведомление подписчиков о наступлении события 

Абстрактный класс-дженерик **View** служит для отрисовки DOM элементов.
Конструктор принимает HTML элемент - контейнер
Имеет методы:
- setText - устанавливает значение поля TextContent
- setImage - устанавливает значения для отображения изображения
- render - принимает данные, которые будут отображаться в элементе и возвращает этот элемент


**Компоненты представления**

Класс **Page** наследует класс View с реализацией интерфейса **IPage**
Служит для отрисовки и установки значений некоторых элементов на странице
Имеет поля типа HTMLElement:
- _catalog - элемент, в котором содержатся основные элементы-товары
- _wrapper - элемент-оборачивающий страницу
- _basket - элемент-кнопка для открытия корзины
- _counter - элемент на кнопке корзины, отображающий количество товаров в корзине
Имеет методы:
- set catаlog - устанавливает элементы-товары в соответствующий HTML элемент
- set locked - с помощью добавления класса блокирует страниц
- set counter - устанавливает число элементов в корзине как значение в соответствующий HTML элемент

Класс **Modal** наследует класс View с реализацией интерфейса **IModalView**
Служит для отрисовки модального окна с контентом 
Имеет два поля с типом HTMLElement:
- closeButton - кнопка закрытия окна
- content - элемент окна с содержимым
Имеет методы: 
- открытия и закрытия окна (open, close)
- сеттер по установки контента окна
- render - устанавливает данные и возвращает элемент окна

Класс **Card** наследует класс View с реализацией интерфейсов **ICardView**
Cлужит для отрисовки элемента карточки продукта на странице
Имеет поля типа HTMLElement: _title, _price, _category, _image, _description, _button
Конструктор принимает элемент-контейнер и событие, которое навешивает по клику на кнопку карточки или саму карточку
Имеет методы:
- cетторы полей интерфейса: id, title, category, image, description, price

Класс **Basket** наследует класс View с реализацией интерфейса **IBasketView**
Служит для отрисовки элемента корзины
Имеет поля с типом HTMLElement: 
- _list - HTML элемент, которые содержит основные элементы, добавленные в корзину
- _total - HTML элемент, содержащий число, отображающее общую сумму элементов корзины
- _button - HTML елемент-кнопка для оформления корзины 
Имеет методы: 
- set items - размещает список элементов корзины в соотвествующем HTML элементе
- total - устанавливает общее число элементов корзины в соотвествующем HTML элементе

Класс-дженерик **Form** наследует класс View с реализацией интерфейса **IFormState**
Служит базовым классом для отрисовки форм
Имеет поля с типом HTMLElement:
- _submit
- _errors
Имеет методы onInputChange, render и сеттеры полей интерфейса valid, errors

Класс **Purchase** наследует класс Form с реализацией интерфейса IPaymentForm или интерфейса IPurchaseForm
Сетторы полей интерфейсов


**Компоненты модели данных**

Класс **ProductItem** - основная модель для хранения данных о продукте
Имеет поля, содержащие данные о самом продукте:
- id: string;
- title: string;
- description: string;
- image: string;
- price: number;
- category: ProductCategory;
- и поле events для хранения возможных для продукта событий

Класс **AppData** содержит состояние данных, полученных с сервера, а также в результате событий на странице
Имеет поля:
- catalog - массив всех объектов класса ProductItem
- preview - строка, содержащая id продукта, открытого в отдельной карточки
- basket: массив объектов класса ProductItem, добавленных в корзину
Имеет методы:
- setCatalog - устанавливает в поле catalog получаемый как аргумент массив объектов, поддерживающих интерфейс **Iproduct**
- setPreview - определяет в поле preview id выбранного для просмотра продукта и сообщает об открытии 
- addToBasket - добавляет в поле basket объект класса ProductItem


Класс **GetProductApi** наследуется от класса Аpi и служит для получения информации о продуктах с сервера.
Реализует интерфейс IGetProductApi
Имеет методы:
- getProductList - возвращает промис с массивом объектов, реализующих интерфейс IProduct
- getProductInfo - получает как аргумент id продукта и возвращает промис с объектом, реализующем интерфейс IProduct