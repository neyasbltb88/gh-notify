//  // Создание контейнера вверху слева
//  this.containers.nw = new GHNotify({
//   width: '300px',
//   place: 'nw',
//   container: '.nw_container',
//   new: true
// });
// this.containers.nw.push();
// this.containers.nw.push();
// /////////////////////////////////////

class DemoPage {
    constructor() {
        this.containers = {};
        this.containers_settings = {};
        this.active_containerName = '';
        this.checkboxes = document.querySelectorAll('[name="place"]');
        this.container_names = ['nw', 'n', 'ne', 'se', 's', 'sw'];
        this.templateLi = `<div class="params">
    <span class="disable tooltipped tooltipped-se" aria-label="Use this option?">
        <input type="checkbox" checked>
    </span>
    <span class="prop_name tooltipped tooltipped-s" aria-label="Property name"></span>
    <span class="prop_val tooltipped tooltipped-s" contenteditable="true" aria-label="Property value"></span>
</div>
<div class="description"></div>`;
        this.container_settings_elem = document.querySelector('.container_settings_wrap .settings');
        this.push_settings_elem = document.querySelector('.push_settings_wrap .settings');



        // Точка входа
        this.init();
    }

    getDefaultContainerSettings(place) {
        return {
            place: {
                disable: true,
                active: true,
                name: 'place',
                value: place,
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            width: {
                disable: false,
                active: true,
                name: 'width',
                value: '300px',
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            offsetY: {
                disable: false,
                active: true,
                name: 'offsetY',
                value: 0,
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            offsetX: {
                disable: false,
                active: true,
                name: 'offsetX',
                value: 0,
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            container: {
                disable: true,
                active: true,
                name: 'container',
                value: `.${place}_container`,
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            position: {
                disable: false,
                active: true,
                name: 'position',
                value: 'fixed',
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            parent: {
                disable: true,
                active: false,
                name: 'parent',
                value: '.parent_selector',
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            default: {
                disable: false,
                active: true,
                name: 'default',
                value: 'TEST_2',
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            },
            new: {
                disable: true,
                active: true,
                name: 'new',
                value: true,
                descr: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum quaerat a sapiente modi itaque. Provident vel similique, nesciunt non sed facilis. Minima quos architecto facilis deserunt, exercitationem ducimus sequi qui.'
            }
        }
    }

    getContainerSettings(place) {
        let settings;
        // Если есть уже инициализированные настройки для контейнера
        if (this.containers_settings[place]) {
            settings = this.containers_settings[place];
        } else {
            // Если для этого контейнера еще не проводилась настройка,
            //  достанем настройки из дефолтных
            settings = this.getDefaultContainerSettings(place);
            this.containers_settings[place] = settings;
        }
        // и вернем их
        return settings;
    }

    // Получить подготовленный объект настроек для инициализации контейнера
    getCleanContainerSettings(settings) {
        let clean_settings = {};
        for (let setting in settings) {
            if (settings[setting].active) {
                clean_settings[setting] = settings[setting].value;
            }
        }
        return clean_settings;
    }

    initContainer() {
        // Получим настройки для активного контейнера
        let settings = this.containers_settings[this.active_containerName];
        // Подготовим их для инициализации
        settings = this.getCleanContainerSettings(settings);
        console.log(settings);

        if (this.containers[this.active_containerName]) {
            this.containers[this.active_containerName].destroy();
            delete this.containers[this.active_containerName];
        }

        this.containers[this.active_containerName] = new GHNotify(settings);
    }

    updatePropList(settings) {
        for (let prop in settings) {
            let setting = settings[prop];

            // Получим элемент списка, соответствующий текущей опции
            let currentLiElem = this.container_settings_elem.querySelector(`.${setting.name}`);
            // И заполним данными его составляющие
            let checkbox = currentLiElem.querySelector('[type="checkbox"]');
            checkbox.checked = setting.active;
            let prop_name = currentLiElem.querySelector('.prop_name');
            prop_name.textContent = `${setting.name}:`;
            let prop_val = currentLiElem.querySelector('.prop_val');
            prop_val.textContent = setting.value;
            let description = currentLiElem.querySelector('.description');
            description.innerHTML = setting.descr;

            // Заблокируем элемент, если нужного
            if (setting.disable) {
                currentLiElem.classList.add('disabled');
                checkbox.disabled = true;
                prop_val.removeAttribute('contenteditable');
                // Или разблокируем, но это скорее всего не понадобится
            } else {
                currentLiElem.classList.remove('disabled');
                checkbox.disabled = false;
                prop_val.setAttribute('contenteditable', true);
            }
            // console.log(currentLiElem);
        }
        this.initContainer();
    }

    createPropList(settings) {
        // Пройдемся циклом по настройкам контейнера
        for (let prop in settings) {
            // Для каждой опции будем создавать элемент списка
            let setting = settings[prop];
            let createdLi = document.createElement('li');
            let liClass = setting.name;
            createdLi.className = liClass;
            createdLi.innerHTML = this.templateLi;
            // Добавляем созданные элементы в блок настроек
            this.container_settings_elem.appendChild(createdLi);
        }
        // После создания пустых элементов списка опций, заполним их
        this.updatePropList(settings);
    }

    // Переключает настраиваемый контейнер
    changeContainer(e) {
        let place = e.target.value;
        this.activateContainer(place);
    }

    // Проверка на то, содержит ли блок настроек элементы опций
    checkContainerRedy() {
        let settingsList = this.container_settings_elem.querySelectorAll('li');
        if (settingsList.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Активирует настройки для выбранного контейнера
    activateContainer(place) {
        this.active_containerName = place;
        console.log(this.active_containerName);
        // Получаем настройки контейнера
        let settings = this.getContainerSettings(place);
        // Проверка на предмет инициализации блока с настройками контейнера
        let contentReady = this.checkContainerRedy();
        if (contentReady) {
            // Если блок с настройками заполнен, обновим его
            this.updatePropList(settings);
        } else {
            // Если не заполнен, создадим его внутреннюю структуру
            this.createPropList(settings);
        }
    }



    // Метод запуска
    init() {
        // Вешаем на чекбоксы обработчики
        this.checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.changeContainer.bind(this));
            // Ищем активный чекбокс
            if (checkbox.checked) {
                // Запускаем активацию блока с настройками нужного контейнера 
                this.activateContainer(checkbox.value);
            }
        });


    }
}

var demoPage = new DemoPage();