const BASE_API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";

function getBrowseParams(){

    const params =
        new URLSearchParams(window.location.search);

    return{

        type:
            params.get("type"),

        value:
            params.get("value"),

        id:
            params.get("id"),

        keyword:
            params.get("q")

    };

}

document.addEventListener(
"DOMContentLoaded",
()=>{

    updateCartCount();

    document
    .getElementById("sortSelect")
    .addEventListener(
        "change",
        initBrowse
    );

    document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        handleSearch
    );

    initBrowse();

});

async function initBrowse(){

    try{

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

        updateTitle();

        renderProducts(products);

    }catch(error){

        console.error(error);

        document
        .getElementById("loading")
        .textContent =
        "โหลดสินค้าไม่สำเร็จ";

    }

}

function handleSearch(){

    initBrowse();

}

function updateTitle(){

    const{

        type,
        value,
        keyword

    }=getBrowseParams();

    const title =
    document.getElementById(
        "browseTitle"
    );

    const description =
    document.getElementById(
        "browseDescription"
    );

    switch(type){

        case "new":

            title.textContent =
            "⭐ สินค้าใหม่";

            description.textContent =
            "สินค้าใหม่ล่าสุด";

            break;

        case "sale":

            title.textContent =
            "🔥 ลดราคา";

            description.textContent =
            "สินค้าลดราคา";

            break;

        case "featured":

            title.textContent =
            "✨ สินค้าแนะนำ";

            description.textContent =
            "สินค้าแนะนำ";

            break;

        case "fandom":

            title.textContent =
            value;

            description.textContent =
            `สินค้าทั้งหมดจาก ${value}`;

            break;

        case "collection":

            title.textContent =
            "Collection";

            description.textContent =
            "สินค้าใน Collection";

            break;

        case "search":

            title.textContent =
            `ค้นหา "${keyword}"`;

            description.textContent =
            "ผลการค้นหา";

            break;

        default:

            title.textContent =
            "สินค้าทั้งหมด";

            description.textContent =
            "สินค้าทั้งหมดของร้าน";

    }

}

function filterProducts(products){

    const {
        type,
        value,
        id
    } = getBrowseParams();

    const keyword =
document
.getElementById("searchInput")
.value
.trim();

if(keyword){

    return searchProducts(products);

}

    switch(type){

        case "new":

            return products.filter(
                p => p.new_arrival
            );

        case "sale":

            return products.filter(
                p => Number(p.sale_price) > 0
            );

        case "featured":

            return products.filter(
                p => p.featured
            );

        case "fandom":

            return products.filter(
                p => p.fandom === value
            );

        case "collection":

            return products.filter(
                p => p.collection_id === id
            );

        case "main_category":

            return products.filter(
                p => p.main_category === value
            );

        case "sub_category":

            return products.filter(
                p => p.sub_category === value
            );


        default:

            return products;

    }

}

function searchProducts(products){

    const q =
    document
    .getElementById("searchInput")
    .value
    .toLowerCase()
    .trim();

    if(!q){

        return products;

    }

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

(product.search_keywords || "")
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
    ).value;

    switch(sort){

        case "price_low":

            products.sort(
                (a,b)=>
                Number(a.price)
                -
                Number(b.price)
            );

            break;

        case "price_high":

            products.sort(
                (a,b)=>
                Number(b.price)
                -
                Number(a.price)
            );

            break;

        case "name":

            products.sort(
                (a,b)=>
                a.name.localeCompare(
                    b.name,
                    "th"
                )
            );

            break;

        default:

            products.sort(
                (a,b)=>

                Number(b.sort_order || 0)

                -

                Number(a.sort_order || 0)

            );

    }

    return products;

}

function renderProducts(products){

    document
    .getElementById("loading")
    .style.display="none";

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

function getDeadlineText(deadline){

    if(
        !deadline ||
        deadline==="N/A"
    ){
        return "";
    }

    const today =
    new Date();

    const end =
    new Date(deadline);

    const diffDays =
    Math.ceil(

        (end-today)

        /

        (1000*60*60*24)

    );

    if(diffDays<0){

        return "";

    }

    if(diffDays===0){

        return "🔥 ปิดรับวันนี้";

    }

    if(diffDays===1){

        return "⏰ เหลือ 1 วัน";

    }

    return `⏰ เหลือ ${diffDays} วัน`;

}

function updateCartCount(){

    const cart =
    JSON.parse(
        localStorage.getItem("cart") || "[]"
    );

    const total =
    cart.reduce(

        (sum,item)=>

        sum +

        Number(item.qty||0),

        0

    );

    const cartCount =
    document.getElementById(
        "cartCount"
    );

    if(cartCount){

        cartCount.textContent =
        total;

    }

}

