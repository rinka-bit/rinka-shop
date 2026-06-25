const BASE_API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";

const params = new URLSearchParams(window.location.search);

const type = params.get("type");

const value = params.get("value");

const id = params.get("id");

const keyword = params.get("q");

async function initBrowse(){

    try{

        const response = await fetch(
            BASE_API + "?action=products"
        );

        let products = await response.json();

        products = filterProducts(products);

        products = sortProducts(products);

        renderProducts(products);

    }catch(error){

        console.error(error);

        document.getElementById("loading").innerHTML =
        "โหลดสินค้าไม่สำเร็จ";

    }

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

    document
    .getElementById("loading")
    .style.display="none";

    const grid =
        document.getElementById("productGrid");

    const empty =
        document.getElementById("emptyState");

    if(products.length===0){

        grid.innerHTML="";

        empty.classList.remove("hidden");

        return;

    }

    empty.classList.add("hidden");

    grid.innerHTML =
        products
        .map(createProductCard)
        .join("");

}

function createProductCard(product){

return `
<div
class="card"
onclick="
window.location.href=
'product.html?id=${product.product_id}'
">

<img
src="${product.image}"
alt="${product.name}"
loading="lazy">

${

product.new_arrival

?

`
<div class="badge-new">
NEW
</div>
`

:

""

}

${

product.product_type==="preorder"

?

`
<div class="badge-preorder">
PREORDER
</div>
`

:

""

}

${
getDeadlineText(
product.preorder_deadline
)

?

`
<div class="deadline-badge">

${getDeadlineText(
product.preorder_deadline
)}

</div>
`

:

""
}

<h3>
${product.name}
</h3>

<p>
${product.fandom || ""}
</p>

<p>

฿${product.sale_price || product.price}

</p>

</div>
`;

}

function getDeadlineText(deadline){

if(
!deadline ||
deadline==="N/A"
){

return "";

}

const today=new Date();

const end=new Date(deadline);

const diffDays=Math.ceil(

(end-today)

/(1000*60*60*24)

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

    const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
    );

    const total = cart.reduce(
        (sum,item)=>sum+Number(item.qty||0),
        0
    );

    const cartCount =
        document.getElementById("cartCount");

    if(cartCount){

        cartCount.textContent = total;

    }

}
