var one = new window.GHNotify({
    // offsetY: '50px',
    // offsetX: '200px',
    width: '300px',
    place: 'ne',
    // container: '.notify_container_2',
    // position: 'relative',
    // parent: '.test',
    // default: 'TEST_2',
    // new: true
});

one.push({
    message: 'type: error, confirm: true',
    type: 'error',
    confirm: true
});
one.push({
    message: 'type: error, confirm: true',
    type: 'error',
    confirm: true
});


var two = new window.GHNotify({
    // offsetY: '50px',
    // offsetX: '300px',
    width: '300px',
    place: 'n',
    container: '.notify_container_2',
    position: 'relative',
    parent: '.test',
    // default: 'TEST_2',
    // new: true
});

two.push({
    type: 'warn',
    message: 'type: warn',
});
two.push({
    type: 'warn',
    message: 'type: warn',
});

var three = new window.GHNotify({
    // offsetY: '100px',
    // offsetX: '300px',
    width: '300px',
    place: 'sw',
    container: '.notify_container_3',
    position: 'absolute',
    parent: '.test',
    // default: 'TEST_2',
    // new: true
});

three.push({
    message: 'type: success',
    type: 'success'
});
three.push({
    message: 'type: success',
    type: 'success'
});


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
var log = new Log('.log');



// --- Кнопки ---
let add_button_1 = document.querySelector('.add_button_1');
let add_button_2 = document.querySelector('.add_button_2');
let add_button_3 = document.querySelector('.add_button_3');
let add_button_4 = document.querySelector('.add_button_4');

add_button_1.addEventListener('click', e => {
    var one_id = one.push({
        confirm: true,
        message: 'confirm: true',
    });

    log.add({
        log: "one.push({ confirm: true, message: 'confirm: true' })",
        way: true
    });
    log.add({
        log: one_id,
        way: false,
        counter: false
    });


});

add_button_2.addEventListener('click', e => {
    var two_id = two.push('timeout: 3000', 3000);

    log.add({
        log: "two.push( 'timeout: 3000', 3000 )",
        way: true
    });
    log.add({
        log: two_id,
        way: false,
        counter: false
    });
});

add_button_3.addEventListener('click', e => {
    var three_id = three.push();

    log.add({
        log: "three.push()",
        way: true
    });
    log.add({
        log: three_id,
        way: false,
        counter: false
    });
});

var notify_container = document.querySelector('.notify_container');
var notify_container_2 = document.querySelector('.notify_container_2');
var notify_container_3 = document.querySelector('.notify_container_3');



function closeHandler(e) {
    if (e.detail.confirm !== undefined) {
        if (e.detail.confirm === 'true') {
            console.log('Уведомление с id ', e.detail.id, 'принято');
            log.add({
                log: 'Уведомление с id ' + e.detail.id + ' принято'
            });
        } else {
            console.log('Уведомление с id ', e.detail.id, 'отклонено');
            log.add({
                log: 'Уведомление с id ' + e.detail.id + ' отклонено'
            });
        }
    } else {
        console.log('Закрыто уведомление с id ', e.detail.id);
        log.add({
            log: 'Закрыто уведомление с id ' + e.detail.id
        });
    }
}

notify_container.addEventListener('close', closeHandler);
notify_container_2.addEventListener('close', closeHandler);
notify_container_3.addEventListener('close', closeHandler);

add_button_4.addEventListener('click', function(e) {
    one.removeAll();
    two.removeAll();
    three.removeAll();
    log.clear();
});