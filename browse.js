const params = new URLSearchParams(window.location.search);

const type = params.get("type");

const value = params.get("value");

const id = params.get("id");

const keyword = params.get("q");

async function initBrowse(){

    showLoading();

    const response =
        await fetch(
            BASE_API +
            "?action=products"
        );

    let products =
        await response.json();

    products =
        filterProducts(products);

    products =
        sortProducts(products);

    renderProducts(products);

}

initBrowse();
