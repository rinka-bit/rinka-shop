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

function filterProducts(products){

    switch(type){

        case "new":

            return products.filter(
                p => p.new_arrival
            );

        case "sale":

            return products.filter(
                p =>
                Number(p.sale_price) > 0
            );

        case "featured":

            return products.filter(
                p => p.featured
            );

        case "fandom":

            return products.filter(
                p =>
                p.fandom === value
            );

        case "collection":

            return products.filter(
                p =>
                p.collection_id === id
            );

        case "main_category":

            return products.filter(
                p =>
                p.main_category === value
            );

        case "sub_category":

            return products.filter(
                p =>
                p.sub_category === value
            );

        case "search":

            return searchProducts(
                products
            );

        default:

            return products;

    }

}

function searchProducts(products){

    if(!keyword){

        return products;

    }

    const q =
        keyword
        .toLowerCase()
        .trim();

    return products.filter(product=>{

        return (

            (product.name || "")
            .toLowerCase()
            .includes(q)

            ||

            (product.fandom || "")
            .toLowerCase()
            .includes(q)

            ||

            (product.description || "")
            .toLowerCase()
            .includes(q)

            ||

            (product.main_category || "")
            .toLowerCase()
            .includes(q)

            ||

            (product.sub_category || "")
            .toLowerCase()
            .includes(q)

        );

    });

}

function sortProducts(products){

    const sort =

        document
        .getElementById(
            "sortSelect"
        )?.value

        ||

        "newest";

    switch(sort){

        case "price_low":

            return products.sort(

                (a,b)=>

                Number(a.price)

                -

                Number(b.price)

            );

        case "price_high":

            return products.sort(

                (a,b)=>

                Number(b.price)

                -

                Number(a.price)

            );

        case "name":

            return products.sort(

                (a,b)=>

                a.name.localeCompare(
                    b.name,
                    "th"
                )

            );

        default:

            return products;

    }

}

function renderProducts(products){

    hideLoading();

    const grid =
        document.getElementById(
            "productGrid"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );

    if(products.length===0){

        grid.innerHTML="";

        empty.classList.remove(
            "hidden"
        );

        return;

    }

    empty.classList.add(
        "hidden"
    );

    grid.innerHTML =
        products
        .map(createProductCard)
        .join("");

}
