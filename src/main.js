const $body = $('body');
const $document = $(document);

$document.on('contextmenu', (e) => {
    e.preventDefault();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const $menu = $('#custom-menu');

    $menu.css({
        left: `${mouseX}px`,
        top: `${mouseY}px`,
    }).addClass('visible');
});

let procedureActive = false;
let clickedElement = false;
const toggleProcedure = () => {
    if (procedureActive) {
        $body.off('mouseover', displayOutline);
    } else {
        $body.on('mouseover', displayOutline);
    }
    procedureActive = !procedureActive;
};

const displayOutline = (e) => {
    const $element = $(e.target);
    if ($element.is($('#custom-menu')) || $('#custom-menu').has($element).length) {
        return;
    }
    if ($element.is($('#category-modal-select')) || $('#category-modal-select').has($element).length) {
        return;
    }

    const classList = 'outline outline-offset-2 outline-2 outline-pink-500 hover:cursor-copy rounded-sm transition'
    $element.on('mouseout', () => {
        $element.removeClass(classList);
    });
    $element.on('click', (event) => {
        event.preventDefault();

        if (clickedElement) {
            return;
        }

        clickedElement = true;

        console.log(event.target);
        toggleProcedure();
        displayModal(event.target);
    });
    $element.addClass(classList);
};

const displayModal = (node) => {

    let modal = $("<div/>", {
        "class": "modal fixed inset-0 z-50 overflow-y-auto flex justify-center items-center bg-gray-400/50 bg-opacity-50 transition-opacity duration-300",
        "id": "category-modal-select"
    });

    let modalContent = $("<div/>", {
        "class": "modal-content bg-white rounded-lg shadow-xl w-11/12 max-w-md p-4 transition-all transform duration-300 ease-in-out translate-y-4 opacity-0 scale-95 pointer-events-none sm:p-6 sm:my-8 sm:max-w-3xl sm:transform sm:translate-y-0 sm:scale-100 sm:opacity-100 sm:pointer-events-auto"
    });

    let modalHeader = $("<div/>", {
        "class": "modal-header flex justify-between items-center pb-3"
    });

    let modalTitle = $("<p/>", {
        "class": "text-lg font-bold text-gray-900",
        "text": "Select a category"
    });

    let modalClose = $("<button/>", {
        "class": "modal-close text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150",
        "html": "<svg class=\"h-6 w-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path></svg>"
    }).on("click", () => {
        modal.remove();
        clickedElement = false;
        toggleProcedure();
    });

    let modalBody = $("<div/>", {
        "class": "modal-body"
    });

    let modalFooter = $("<div/>", {
        "class": "modal-footer flex justify-end pt-2"
    });

    let modalSubmit = $("<button/>", {
        "class": "modal-submit px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150",
        "text": "Submit"
    }).on("click", () => {
        modal.remove();
        clickedElement = false;
        toggleProcedure();
    });

    modalHeader.append(modalTitle, modalClose);
    modalFooter.append(modalSubmit);
    modalContent.append(modalHeader, modalBody, modalFooter);
    modal.append(modalContent);
    $("body").append(modal);

    setTimeout(() => {
        modalContent.removeClass("opacity-0 scale-95 translate-y-4")
            .addClass("opacity-100 scale-100 translate-y-0");
    });
};

const setMenu = async (categories) => {
    categories = categories.categories
    const location = window.location.origin
    console.log("LOCATION", location)

    let menu = $("<nav>")
        .attr("id", "custom-menu")
        .addClass("space-y-1");

    let header = $("<div>").addClass("header");

    let button = $("<button>")
        .addClass("add-button")
        .text("+")
        .on("click", () => {
            toggleProcedure();
        });

    header.append(button);
    menu.append(header);

    let isMenuFilled = false;
    for (const category in categories) {
        console.log("CATEGORY", categories[category][location])
        if(categories[category][location] !== undefined){
            isMenuFilled = true;
            let menuItem = $("<button>")
                .addClass("bg-gray-100 text-gray-900 group flex items-center rounded-md px-3 py-2 text-sm font-medium w-full hover:bg-gray-200")
                .text(category);
            menu.append(menuItem);
        }
    }

    console.log("Menu", menu);

    if(!isMenuFilled){
        let menuItem = $("<div>")
            .addClass("menu-item")
            .text("No categories");
        menu.append(menuItem);
    }

    $('body').append(menu);
}

const saveCategory = async (category, website, node) => {
    let object = {};
    object[category] = {};
    object[category][website] = node;

    console.log("SAVE",object);
    chrome.storage.sync.set({"categories": object});
}

const getCategories = async () => {
    if(!chrome.storage.sync.get("categories")){
        chrome.storage.sync.set({categories: {}});
    }
    let categories = await chrome.storage.sync.get("categories");
    return categories;
}

const clearCategories = async () => {
    chrome.storage.sync.clear();
}

//clearCategories();

saveCategory("Next", "https://itnext.io", "Node")
    .then(async (r) => {
        let categ = await getCategories();
        console.log("CATEG", categ);
        setMenu(categ).then((r) => {
            console.log("MENU SET");
        });
    });