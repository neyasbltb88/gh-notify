class GHNotifyItem {
    constructor(params) {
        this.templateWrapClasses = `flash flash-full ${params.type}`;
        this.templateButtonClose = `
<button class="flash-close js-flash-close tooltipped tooltipped-w" type="button">
    <svg class="octicon octicon-x" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true">
        <path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"/>
    </svg>
</button>`;
        this.templateButtonAllow = `
<button class="flash-close js-flash-close tooltipped tooltipped-w" type="button" data-ghnotify-confirm="true" aria-label="${params.labelAllow}">
    <svg class="octicon octicon-check" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true">
        <path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path>
    </svg>
</button>`;

        this.message = params.message;
        this.id = params.id;
        this.container = params.container;
        this.confirm = params.confirm;
        this.wrap = null;
        this.timeout = null;
        this.timerID = null;
        this.timerStart = null;
        this.delRun = false;


        this.init(params);
    }

    init(params) {
        // Создание обертки
        this.wrap = document.createElement('div');
        this.wrap.className = this.templateWrapClasses;
        this.wrap.setAttribute('data-ghnotify-id', this.id);
        this.wrap.classList.add('h0');

        // Если нужно, доавляем кнопки
        if (params.confirm) {
            // Для режима подтверждения нужны 2 кнопки:
            this.wrap.innerHTML = this.templateButtonAllow;
            this.wrap.innerHTML += this.templateButtonClose;
            // Кнопка Подтверждения
            let allow_btn = this.wrap.querySelector('[data-ghnotify-confirm="true"]');
            allow_btn.addEventListener('click', this.del.bind(this));

            // Кнопка Отклонения
            let deny_btn = this.wrap.querySelector('.flash-close:not([data-ghnotify-confirm])');
            deny_btn.setAttribute('aria-label', params.labelDeny);
            deny_btn.setAttribute('data-ghnotify-confirm', false);
            deny_btn.addEventListener('click', this.del.bind(this));
        } else if (params.button) {
            // Кнопка закрытия уведомления
            this.wrap.innerHTML = this.templateButtonClose;
            let close_btn = this.wrap.querySelector('.flash-close');
            close_btn.setAttribute('aria-label', params.label);
            close_btn.addEventListener('click', this.del.bind(this));
        }



        // Создаем сообщение
        let message = document.createElement('div');
        message.className = 'message';
        message.innerHTML = params.message;

        // и добавляем его в контейнер
        this.wrap.appendChild(message);


        // Добавляем всю обертку в родительский контейнер
        this.container.appendChild(this.wrap);
        setTimeout(() => {
            this.wrap.classList.remove('h0');
        }, 10);

        // Если передано значение тамера, то запускаем его
        if (params.timeout) {
            this.timeout = params.timeout;
            this.startTimer();
        }
    }

    del(e) {
        // Если процесс удаления еще не запущен
        if (!this.delRun) {
            this.delRun = true;
            // Если был заведен таймер, обнуляем его
            if (this.timerID) {
                clearTimeout(this.timerID);
            }
            // Добавляем класс с анимацией скрытия
            this.wrap.classList.add('h0');
            // Создаем событие, сообщающее об окончании скрытия
            let detail = { id: this.id };
            // Если удаление вызвано кликом по кнопке
            if (e instanceof Event) {
                let confirm = e.currentTarget.getAttribute('data-ghnotify-confirm');
                // Если на кнопке есть атрибут confirm
                if (confirm !== undefined && confirm !== null) {
                    // Добавляем его в детали события
                    detail.confirm = confirm;
                }
            }
            let event = new CustomEvent('close', { detail });
            this.wrap.addEventListener('transitionend', e => {
                // Удаляем уведомление из контейнера
                this.container.removeChild(this.wrap);
                // Испускаем событие удаления
                this.container.dispatchEvent(event);
            });
        }
    }

    startTimer() {
        // Если есть значение таймаута, запускаем
        if (this.timeout !== null) {
            // Получаем время старта
            this.timerStart = Date.now();
            this.timerID = setTimeout(() => {
                // По истечению таймаута запустим удаление
                this.del();
            }, this.timeout);
        }
    }

    pauseTimer() {
        // Если таймер был заведен
        if (this.timerID) {
            // Очищаем таймаут
            clearTimeout(this.timerID);
            this.timerID = null;
            // Получаем текущее время
            let now = Date.now();
            // Вычисляем сколько осталось до срабатывания заведенного таймера
            this.restTimeout = this.timeout - (now - this.timerStart);
            // Предотвращаем попадание отрицательных значений
            // (при вызове функции в момент анимации удаления)
            // если значение отрицательное, для верности вызываем удаление
            this.timeout = (this.restTimeout > 0) ? this.restTimeout : this.del();
        }
    }
}

// ////////////////////////////////////////////////////////////////////////
class GHNotify {
    constructor(options = {}) {
        // --- Опции ---
        this.offsetY = options.offsetY || '0px';
        this.offsetX = options.offsetX || '0px';
        this.width = options.width || '100%';
        this.place = options.place || 'nw';

        this.container_selector = options.container || '.notify_container';
        this.position = options.position || 'fixed';
        this.parent = options.parent || 'body';
        this.default_message = options.default || `TEST`;
        this.new = options.new;
        // === Опции===
        this.container = null;
        this.parent_elem = null;
        this.lastID = 0;
        this.buffer = {};


        this.init();
    }

    parseParamsItem() {
        let params = {};
        // Если первый аргумент строка или число, и второй аргумент число,
        // то это текст сообщения и таймер
        if ((typeof arguments[0] === 'string' || typeof arguments[0] === 'number') &&
            typeof arguments[1] === 'number') {
            params.message = arguments[0];
            params.timeout = arguments[1];

            // Если первый аргумент строка, а второго аргумента нет,
            // то это сообщение без таймера
        } else if (typeof arguments[0] === 'string' && typeof arguments[1] === 'undefined') {
            params.message = arguments[0];

            // Если первый аргумент число, а второго аргумента нет,
            // то это таймер с дефолтным сообщением
        } else if (typeof arguments[0] === 'number' && typeof arguments[1] === 'undefined') {
            params.timeout = arguments[0];

            // Если аргумент - это объект
        } else if (typeof arguments[0] === 'object') {

            return this.normalizeParamsItem(arguments[0]);

            // Если ничего не передано, то все параметры будут дефолтными
        } else if (typeof arguments[0] === 'undefined') {

        } else {
            params.message = 'Не правильные аргументы .push()';
        }

        return this.normalizeParamsItem(params);
    }

    normalizeParamsItem(params = {}) {
        params.id = ++this.lastID;
        params.container = this.container;
        params.message = (params.message !== undefined) ? params.message : this.default_message + `: ${this.lastID}`;
        params.button = (params.button !== false) ? true : false;
        params.timeout = (params.timeout !== undefined) ? params.timeout : false;
        params.label = (params.label !== undefined) ? params.label : 'Закрыть это уведомление';
        params.confirm = (params.confirm === true) ? true : false;
        params.labelDeny = (params.labelDeny !== undefined) ? params.labelDeny : 'Отклонить';
        params.labelAllow = (params.labelAllow !== undefined) ? params.labelAllow : 'Принять';
        params.type = (params.type !== undefined) ? 'flash-' + params.type : '';

        return params;
    }

    push() {
        let params = this.parseParamsItem(...arguments);
        this.buffer[this.lastID] = new GHNotifyItem(params);
        return this.lastID;
    }

    // Метод для внешнего удаления уведомления
    remove(id) {
        // Вызов метода удаления у соответствующего уведмления
        this.buffer[id].del();
        // После удаления уведомления из контейнера выполнится removeFromBuffer
    }

    // Метод для внешнего удаления всех уведомлений
    removeAll() {
        for (let notify in this.buffer) {
            this.buffer[notify].del();
        }
    }

    removeFromBuffer(e) {
        // Вторая фаза удаления - удаление экземпляра уведомления из буфера
        delete this.buffer[e.detail.id];
    }

    pauseTimers(e) {
        for (let item in this.buffer) {
            this.buffer[item].pauseTimer();
        }
    }

    startTimers(e) {
        for (let item in this.buffer) {
            this.buffer[item].startTimer();
        }
    }

    // Анализ положения
    detectContainerPlace(place_name) {
        let place,
            position = this.position,
            offsetX = this.offsetX,
            offsetY = this.offsetY;

        function placeLeft() {
            let place;
            // Если ширина 100%, вычитаем из нее отступ слева
            if (this.width === '100%') {
                place = `width: calc(${this.width} - ${this.offsetX});`;
            } else {
                place = `width: ${this.width};`;
            }
            place += `left: ${this.offsetX};`;

            return place;
        }

        function placeCenter() {
            let place;
            // Если ширина 100%, вычитаем из нее отступ слева
            if (this.width === '100%') {
                place = `width: calc( ${this.width} - ${this.offsetX} );
                left: ${this.offsetX};`;
                // Если ширина задана вручную, то даем translateX для того, чтобы было по центру
            } else {
                place = `width: ${this.width};
                left: calc(${this.offsetX} + 50%);
                transform: translateX(-50%);`;
            }

            return place;
        }

        function placeRight() {
            let place;
            // Если ширина 100%, вычитаем из нее отступ справа
            if (this.width === '100%') {
                place = `width: calc( ${this.width} - ${this.offsetX} );`;
            } else {
                place = `width: ${this.width};
                left: calc(100% - (${this.width} + ${this.offsetX}));`;
            }

            return place;
        }

        function placeTop(place) {
            place += `top: ${offsetY};`;
            return place;
        }

        function placeBottom(place) {
            // Если relative, то применяться будут только верхние положения
            if (position == 'relative') {
                place += `top: ${offsetY};`;
            } else {
                place += `bottom: ${offsetY};`;
            }

            return place;
        }

        switch (place_name) {
            // Расположение - левый верхний угол
            case 'nw':
                place = placeTop(placeLeft.call(this));
                break;
                // Расположение - сверху по центру
            case 'n':
                place = placeTop(placeCenter.call(this));
                break;
                // Расположение справа вверху
            case 'ne':
                place = placeTop(placeRight.call(this));
                break;
                // Расположение справа внизу
            case 'se':
                place = placeBottom(placeRight.call(this));
                break;
                // Расположение внизу по центру
            case 's':
                place = placeBottom(placeCenter.call(this));
                break;
                // Расположение слева внизу
            case 'sw':
                place = placeBottom(placeLeft.call(this));
                break;

            default:
                place = placeTop(placeLeft.call(this));
                console.log('place_name: ', place_name);

                break;
        }

        return place;
    }

    createContainer(selector) {
        // Создаем элемент контейнера
        selector = selector.slice(1);
        this.container = document.createElement('div');
        this.container.className = selector;
        this.parent_elem = document.querySelector(this.parent);
        this.parent_elem.appendChild(this.container);

        // И стили для него
        let notify_style = document.createElement('style');
        notify_style.className = `${selector}_style`;

        let place = this.detectContainerPlace(this.place);

        let notify_style_txt = `
        .${selector} {
            position: ${this.position};
            z-index: 99;
            border: 1px solid rgba(27, 31, 35, .15);
            border-width: 0 1px;
            box-sizing: border-box;
            ${place};
        }`;
        notify_style.textContent = notify_style_txt;
        document.body.appendChild(notify_style);
    }

    checkContainer(selector) {
        // Получаем элемент с селектором контейнера
        let check_container = document.querySelector(selector);
        // Если такой элемент уже существует
        if (check_container && (check_container.toString() === '[object HTMLDivElement]')) {
            // То сохраняем его в свойство
            this.container = check_container;
        } else {
            // Если нет, то создаем контейнер
            this.createContainer(selector);
        }
    }


    init() {
        // Принудительно создавать новый контейнер или проверить существование готового
        if (this.new) {
            this.createContainer(this.container_selector);
        } else {
            this.checkContainer(this.container_selector);
        }

        // Обработчик кастомного события удаления уведомления
        this.container.addEventListener('close', this.removeFromBuffer.bind(this));

        // Обработчик наведения мыши на контейнер уведомлений
        // используется для того, чтобы ставить на паузу таймеры удаления
        this.container.addEventListener('mouseenter', this.pauseTimers.bind(this));

        // Обработчик ухода мыши с контейнера уведомлений
        // используется для того, чтобы снова запускать оставшиеся таймеры уведомлений
        this.container.addEventListener('mouseleave', this.startTimers.bind(this));

    }
}
window.GHNotify = GHNotify;