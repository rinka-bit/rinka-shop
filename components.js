function createProductCard(product){

return `

<div
class="card"
onclick="
window.location.href=
'product.html?id=${product.product_id}'
">

<div class="image-box">

<img
src="${product.image}"
alt="${product.name}"
loading="lazy">

${

product.new_arrival

?

`<div class="badge-new">

NEW

</div>`

:

""

}

${

product.on_sale

?

`<div class="badge-sale">

SALE

</div>`

:

""

}

${

product.product_type==="preorder"

?

`<div class="badge-preorder">

PREORDER

</div>`

:

`<div class="badge-stock">

พร้อมส่ง

</div>`

}

</div>

<div class="card-body">

<h3>

${product.name}

</h3>

<p class="fandom">

${product.fandom||""}

</p>

<div class="price-box">

${

product.on_sale

?

`

<div class="sale-price">

฿${product.price}

</div>

<div class="old-price">

฿${product.old_price}

</div>

`

:

`

<div class="normal-price">

฿${product.price}

</div>

`

}

</div>

${

getDeadlineText(
product.preorder_deadline
)

?

`

<div class="deadline">

${getDeadlineText(
product.preorder_deadline
)}

</div>

`

:

""

}

</div>

</div>

`;

}
