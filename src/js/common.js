function Log(container) {
    container = document.querySelector(container);
    var log_counter = 0,
        log_el_hight = 17;

    this.add = function(params) {
        var counter = (params.counter === undefined || params.counter === true) ? true : false,
            way = params.way,
            log = params.log,
            log_el = document.createElement('li');

        if (counter) {
            log_counter++;
            log_el.setAttribute('data-log-line', log_counter + ':');
        }

        if (way === true) {
            log_el.setAttribute('data-log-way', '>');
            log_el.className = 'way_to';
        } else if (way === false) {
            log_el.setAttribute('data-log-way', '<');
            log_el.className = 'way_from';
        } else {
            log_el.setAttribute('data-log-way', ' ');
        }

        log_el.innerHTML = log;
        container.appendChild(log_el);
        this.scroll(log_counter * (log_el_hight * 2));
    }

    this.scroll = function(val) {
        scroll_to_elem({
            elem: container,
            scrollBy: true,
            top: val,
            behavior: 'smooth'
        });
    }

    this.clear = function() {
        log_counter = 0;
        container.innerHTML = '';
    }
}
// var log = new Log('.log');
// ///////////////////////////////


class DemoPage {
    constructor() {
        this.containers = {};




        this.init();
    }



    init() {
        // Создание контейнера вверху слева
        this.containers.nw = new GHNotify({
            width: '300px',
            place: 'nw',
            container: '.nw_container',
            new: true
        });
        this.containers.nw.push();
        this.containers.nw.push();

        // Создание контейнера вверху по центру
        this.containers.n = new GHNotify({
            width: '300px',
            place: 'n',
            container: '.n_container',
            new: true
        });
        this.containers.n.push();
        this.containers.n.push();

        // Создание контейнера вверху справа
        this.containers.ne = new GHNotify({
            width: '300px',
            place: 'ne',
            container: '.ne_container',
            new: true
        });
        this.containers.ne.push();
        this.containers.ne.push();

        // Создание контейнера внизу слева
        this.containers.se = new GHNotify({
            width: '300px',
            place: 'se',
            container: '.se_container',
            new: true
        });
        this.containers.se.push();
        this.containers.se.push();

        // Создание контейнера внизу по центру
        this.containers.s = new GHNotify({
            width: '300px',
            place: 's',
            container: '.s_container',
            new: true
        });
        this.containers.s.push();
        this.containers.s.push();

        // Создание контейнера внизу слева
        this.containers.sw = new GHNotify({
            width: '300px',
            place: 'sw',
            container: '.sw_container',
            new: true
        });
        this.containers.sw.push();
        this.containers.sw.push();
    }



}

var demoPage = new DemoPage();