// ==========================================
// 1. ЧИСТЫЙ И НЕЗАВИСИМЫЙ СЛОЙ ДАННЫХ (CRUD)
// ==========================================

const crudAgregarProducto = (lista, objetoProducto) => {
    // То, что ввёл покупатель в форму
    const productoDelComprador = objetoProducto.producto.trim().toLowerCase();
    
    // Проверяем, есть ли уже этот продукт у покупателя в списке
    const existe = lista.some(item => item.producto.toLowerCase() === productoDelComprador);
    if (existe) return { 
        exito: false, 
        mensaje: `El producto "${objetoProducto.producto}" ya está en la lista.` 
    };

    // Если дубликатов нет, добавляем этот продукт в массив
    lista.push({ 
        producto: productoDelComprador, 
        cantidad: Number(objetoProducto.cantidad), 
        precio: Number(objetoProducto.precio) 
    });
    return { exito: true };
};

// Подсчет суммы в памяти
const crudCalcularTotal = (lista) => 
    lista.reduce((suma, item) => suma + (item.cantidad * item.precio), 0); //reduce - сжимать, уменьшать или превращать во что-то одно. Его главная задача — взять весь массив (где лежит много товаров) и сжать его в одно единственное число (в нашем случае — в итоговую сумму денег за все покупки). Метод reduce берёт на себя всю рутину по перебору массива и подсчёту общей суммы, избавляя вас от необходимости писать громоздкие циклы for или while

// удаление товара: вырезаем конкретный элемент в количестве 1 штуки с помощью splice
const crudEliminarPorPosicion = (lista, posicion) => {
    const idx = Number(posicion) - 1;
    // Проверка на правильность введенного номера
    if (isNaN(idx) || idx < 0 || idx >= lista.length) //пользователь ввёл неправильный номер, значит ничего не делаем
        return { exito: false };
    
    // Удаляем ровно 1 элемент на позиции idx прямо из массива
    lista.splice(idx, 1); 
    return { exito: true };
};

// ==========================================
// 2. ВЫНЕСЕНИЕ ЭЛЕМЕНТОВ DOM НАВЕРХ
// ==========================================
const inputProducto = document.getElementById("producto-input");
const inputCantidad = document.getElementById("cantidad-input");
const inputPrecio = document.getElementById("precio-input");
const inputPos = document.getElementById("pos-input");
const MENSAJE = document.getElementById("mensaje");
const LIST = document.getElementById("list");

const dialogModal = document.getElementById("modal-ticket");
const modalLista = document.getElementById("modal-lista-productos");
const modalTotal = document.getElementById("modal-total");

const btnAgregar = document.getElementById("btn-agregar");
const btnEliminar = document.getElementById("btn-eliminar");
const btnCalcular = document.getElementById("btn-calcular");
const btnVaciar = document.getElementById("btn-vaciar");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");


// ==========================================
// 3. СЛОЙ ИНТЕРФЕЙСА (UI) И СЛУШАТЕЛИ
// ==========================================
let carrito = JSON.parse(localStorage.getItem("carrito_compras")) || [];

const guardarEnStorage = () => {
    localStorage.setItem("carrito_compras", JSON.stringify(carrito)); //setItem — берет этот получившийся текст и записывает его в ячейку под именем "carrito_compras", затирая старые данны
};

const compras = () => {
    MENSAJE.innerHTML = ""; // Очищаем старые ошибки и чеки с экрана перед новой отрисовкой

    if (carrito.length === 0) { //Если в массиве carrito нет ни одного товара, мы пишем в наш div#list красивый серый текст "La lista de compras está vacía" и сразу останавливаем функцию с помощью return, чтобы не запускать пустой цикл ниже.
        LIST.innerHTML = "<p class='text-indigo-950/60 font-medium py-4 text-center'>La lista de compras está vacía</p>";
        return;
    }

    let html = "<ul class='text-left divide-y divide-indigo-100'>"; //Сборка списка в столбик

    carrito.forEach((item, index) => { //перебираем массив товаров по очереди
        html += `
            <li class='py-2 flex justify-between items-center text-sm text-indigo-800 font-medium'>
                <span>${index + 1}. <span class='uppercase'>${item.producto}</span></span>
                <span class='text-xs bg-indigo-50 px-2 py-1 rounded text-indigo-800 border border-indigo-100 font-medium'>
                    Cant: ${item.cantidad} | Precio est: $${item.precio}
                </span>
            </li>`;
    });

    html += "</ul>";
    LIST.innerHTML = html;
};

const clickAgregar = () => {
    const nombre = inputProducto.value.trim();
    const cantidad = parseInt(inputCantidad.value);
    const precio = parseFloat(inputPrecio.value);

    if (!nombre || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
        MENSAJE.innerHTML = "Por favor, completa todos los campos con valores válidos.";
        return;
    }
  
    const datosProducto = { //коробка с данными, созданная внутри функции, это объект (пассивный листок бумаги с записями), который этот робот заполняет и передает дальше.
        producto: nombre, 
        cantidad, 
        precio 
    };

    const resultado = crudAgregarProducto(carrito, datosProducto); //после своей проверки функция-контролёр возвращает обратно письменный отчёт и этот отчёт мы записываем в константу resultado

    if (resultado.exito) {
        guardarEnStorage(); //Эта функция берет ваш увеличившийся массив carrito, превращает его в текст и перезаписывает ячейку "carrito_compras" в LocalStorage, чтобы изменения зафиксировались на жестком диске
        inputProducto.value = ""; //инпуты на экране в которые пользователи вводят данные
        inputCantidad.value = "";
        inputPrecio.value = "";
        compras(); //перерисовываем экран
    } 
    else {
        MENSAJE.innerHTML = resultado.mensaje;
    }
};

const clickEliminar = () => {
    const resultado = crudEliminarPorPosicion(carrito, inputPos.value); //то что ввел пользователь

    if (resultado.exito) {
        guardarEnStorage(); //Эта функция берет ваш похудевший массив carrito, превращает его в текст и перезаписывает ячейку "carrito_compras" в LocalStorage, чтобы изменения зафиксировались на жестком диске
        inputPos.value = "";
        compras();
    } 
    else {
        MENSAJE.innerHTML = "Posición no válida."; // если пользователь ввел не правильное число для удаления
    }
};

const clickCalcular = () => {
    if (carrito.length === 0) {
        MENSAJE.innerHTML = "El carrito está vacío. No hay nada para calcular.";
        return;
    }

    const total = crudCalcularTotal(carrito);
    
    let filasHtml = ""; //создается столбик товаров в чеке
    carrito.forEach(item => {
        const subtotal = item.cantidad * item.precio;
        filasHtml += `
            <li class='flex justify-between text-xs font-semibold text-indigo-950 py-1.5'>
                <span>• ${item.producto.toUpperCase()} <span class='text-[10px] text-indigo-950 font-bold'>(x${item.cantidad})</span></span>
                <span>$${subtotal.toFixed(2)}</span>
            </li>`;
    });

    modalLista.innerHTML = filasHtml; //  вклеивает туда созданный столбик товаров в диалоговое окно, наш чек
    modalTotal.innerText = `$${total.toFixed(2)}`;
    dialogModal.showModal(); //показывает на экране
};

const clickVaciar = () => {
    carrito = [];
    localStorage.removeItem("carrito_compras");
    compras(); //Она вызывает функцию compras(). Тот самый маляр запускается, видит, что carrito.length === 0 (массив пустой), стирает старые карточки товаров и пишет в белое окно текст: «La lista de compras está vacía»
};

// ==========================================
// 4. НАЗНАЧЕНИЕ СЛУШАТЕЛЕЙ (addEventListener)
// ==========================================
btnAgregar.addEventListener("click", clickAgregar);
btnEliminar.addEventListener("click", clickEliminar);
btnCalcular.addEventListener("click", clickCalcular);
btnVaciar.addEventListener("click", clickVaciar);
btnCerrarModal.addEventListener("click", () => dialogModal.close()); // когда пользователь нажимает на кнопку «Cerrar Ticket» внутри чека, браузер мгновенно запускает встроенную микро-функцию () => dialogModal.close()

// Первый запуск отрисовки экрана при загрузке
compras();

