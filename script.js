/* =====================================================
   HIDDEN YOUTH — FRONTEND + BACKEND
===================================================== */

const API_URL =
    "https://hidden-youth-backend-production.up.railway.app";


/* =====================================================
   3D DRESS
===================================================== */

const dressWrapper =
    document.querySelector(".dress-wrapper");

const dressImage =
    document.querySelector(".dress-image");

const visualArea =
    document.querySelector(".visual-area");

const visualGlow =
    document.querySelector(".visual-glow");

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let dressHover = false;


if (
    visualArea &&
    dressWrapper &&
    dressImage
) {

    visualArea.addEventListener(
        "mousemove",
        function (event) {

            const rect =
                visualArea.getBoundingClientRect();

            mouseX =
                ((event.clientX - rect.left) /
                    rect.width) - 0.5;

            mouseY =
                ((event.clientY - rect.top) /
                    rect.height) - 0.5;
        }
    );


    visualArea.addEventListener(
        "mouseenter",
        function () {

            dressHover = true;

            dressImage.style.animationPlayState =
                "paused";
        }
    );


    visualArea.addEventListener(
        "mouseleave",
        function () {

            dressHover = false;

            mouseX = 0;
            mouseY = 0;

            dressImage.style.animationPlayState =
                "running";
        }
    );


    function animateDress() {

        currentX +=
            (mouseX - currentX) * 0.08;

        currentY +=
            (mouseY - currentY) * 0.08;

        const rotateY =
            currentX * 28;

        const rotateX =
            currentY * -20;

        const depth =
            dressHover ? 35 : 20;

        dressWrapper.style.transform =
            `perspective(1200px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateZ(${depth}px)`;

        requestAnimationFrame(
            animateDress
        );
    }

    animateDress();
}


/* =====================================================
   PURPLE GLOW
===================================================== */

if (
    visualArea &&
    visualGlow
) {

    visualArea.addEventListener(
        "mousemove",
        function (event) {

            const rect =
                visualArea.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            const moveX =
                (x - rect.width / 2) * 0.12;

            const moveY =
                (y - rect.height / 2) * 0.12;

            visualGlow.style.transform =
                `translate(${moveX}px, ${moveY}px) scale(1.08)`;
        }
    );


    visualArea.addEventListener(
        "mouseleave",
        function () {

            visualGlow.style.transform =
                "translate(0, 0) scale(1)";
        }
    );
}


/* =====================================================
   EXPLORE
===================================================== */

const exploreButton =
    document.querySelector(".explore-btn");

const collectionSection =
    document.querySelector("#collections");


if (
    exploreButton &&
    collectionSection
) {

    exploreButton.addEventListener(
        "click",
        function () {

            collectionSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    );
}


/* =====================================================
   CART
===================================================== */

let cart = [];


function loadCart() {

    const savedCart =
        localStorage.getItem(
            "hiddenYouthCart"
        );

    if (savedCart) {

        try {

            cart =
                JSON.parse(savedCart);

        } catch {

            cart = [];
        }
    }

    /*
       IMPORTANT:
       Restore cart first, then sync
       it with the backend.
    */

    syncCartWithBackend();
}


function saveCart() {

    localStorage.setItem(
        "hiddenYouthCart",
        JSON.stringify(cart)
    );

    /*
       Every cart change is also
       sent to the backend.
    */

    syncCartWithBackend();
}


/* =====================================================
   VISITOR ID
===================================================== */

function getVisitorId() {

    const KEY =
        "hiddenYouthVisitorId";

    let visitorId =
        localStorage.getItem(KEY);

    if (!visitorId) {

        visitorId =
            "visitor-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10);

        localStorage.setItem(
            KEY,
            visitorId
        );
    }

    return visitorId;
}


/* =====================================================
   SYNC CART WITH BACKEND
===================================================== */

async function syncCartWithBackend() {

    try {

        const visitorId =
            getVisitorId();

        const response =
            await fetch(
                `${API_URL}/api/visitor/cart`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            visitorId:
                                visitorId,

                            items:
                                cart.map(
                                    function (item) {

                                        return {

                                            id:
                                                Number(
                                                    item.id
                                                ),

                                            name:
                                                String(
                                                    item.name ||
                                                    ""
                                                ),

                                            price:
                                                Number(
                                                    item.price ||
                                                    0
                                                ),

                                            quantity:
                                                Number(
                                                    item.quantity ||
                                                    1
                                                ),

                                            image:
                                                String(
                                                    item.image ||
                                                    ""
                                                )
                                        };
                                    }
                                )
                        })
                }
            );


        if (!response.ok) {

            console.error(
                "CART SYNC FAILED:",
                response.status
            );

            return;
        }


        const data =
            await response.json();


        if (data.success) {

            console.log(
                "HIDDEN YOUTH: CART SYNCED"
            );
        }

    } catch (error) {

        console.error(
            "CART SYNC ERROR:",
            error
        );
    }
}


/* =====================================================
   CART COUNT
===================================================== */

function getCartCount() {

    return cart.reduce(
        function (total, item) {

            return (
                total +
                Number(
                    item.quantity || 0
                )
            );

        },
        0
    );
}


/* =====================================================
   CART TOTAL
===================================================== */

function getCartTotal() {

    return cart.reduce(
        function (total, item) {

            return (
                total +
                (
                    Number(
                        item.price || 0
                    ) *
                    Number(
                        item.quantity || 0
                    )
                )
            );

        },
        0
    );
}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );

        const data =
            await response.json();

        if (data.success) {

            console.log(
                "HIDDEN YOUTH PRODUCTS:",
                data.products
            );

            console.log(
                `${data.count} products connected to backend.`
            );
        }

    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );
    }
}


/* =====================================================
   ADD TO BAG
===================================================== */

const addToBagButtons =
    document.querySelectorAll(
        ".add-bag"
    );


addToBagButtons.forEach(
    function (button, index) {

        button.addEventListener(
            "click",
            async function (event) {

                event.stopPropagation();

                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/products`
                        );

                    const data =
                        await response.json();

                    if (!data.success) {

                        throw new Error(
                            "Products unavailable"
                        );
                    }

                    const card = button.closest(".product-card");
                    const productId = card
                        ? card.getAttribute("data-product-id")
                        : null;

                    const product =
                        data.products.find(
                            item => String(item.id) === String(productId)
                        ) || data.products[index];

                    if (!product) {
                        return;
                    }

                    const existingProduct =
                        cart.find(
                            item =>
                                item.id ===
                                product.id
                        );

                    if (existingProduct) {

                        existingProduct.quantity +=
                            1;

                    } else {

                        cart.push({

                            ...product,

                            quantity: 1

                        });
                    }

                    saveCart();

                    updateCartUI();


                    /* OPEN CART */

                    const cartPanel =
                        document.getElementById(
                            "cartPanel"
                        );

                    const cartOverlay =
                        document.getElementById(
                            "cartOverlay"
                        );


                    if (cartPanel) {

                        cartPanel.classList.add(
                            "active"
                        );
                    }


                    if (cartOverlay) {

                        cartOverlay.classList.add(
                            "active"
                        );
                    }


                    /* BUTTON ANIMATION */

                    const originalText =
                        button.textContent;

                    button.textContent =
                        "ADDED ✓";

                    button.classList.add(
                        "added"
                    );


                    setTimeout(
                        function () {

                            button.textContent =
                                originalText;

                            button.classList.remove(
                                "added"
                            );

                        },
                        1200
                    );


                    console.log(
                        "Added:",
                        product.name
                    );

                    console.log(
                        "Cart:",
                        cart
                    );


                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        "Backend is not connected. Start npm first."
                    );
                }
            }
        );
    }
);


/* =====================================================
   CART UI
===================================================== */

function updateCartUI() {

    const cartCount =
        document.querySelector(
            ".cart-count"
        );


    if (cartCount) {

        cartCount.textContent =
            getCartCount();
    }


    const cartTotal =
        document.querySelector(
            ".cart-total"
        );


    if (cartTotal) {

        cartTotal.textContent =
            "Rs. " +
            getCartTotal()
                .toLocaleString();
    }


    const cartItems =
        document.getElementById(
            "cartItems"
        );

    const cartTotalBox =
        document.getElementById(
            "cartTotal"
        );


    if (!cartItems) {
        return;
    }


    /* EMPTY CART */

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <span>◇</span>

                <h3>
                    YOUR BAG IS EMPTY
                </h3>

                <p>
                    Discover something worth hiding.
                </p>

            </div>
        `;


        if (cartTotalBox) {

            cartTotalBox.textContent =
                "Rs. 0";
        }

        return;
    }


    /* PRODUCTS */

    cartItems.innerHTML =
        cart.map(
            function (item) {

                return `
                    <div class="cart-product">

                        <img
                            src="${item.image || ""}"
                            alt="${item.name}"
                        >

                        <div class="cart-product-info">

                            <h3>
                                ${item.name}
                            </h3>

                            <p>
                                Rs.
                                ${Number(
                                    item.price
                                ).toLocaleString()}
                            </p>

                            <div class="cart-quantity">

                                <button
                                    class="quantity-minus"
                                    data-id="${item.id}"
                                >
                                    −
                                </button>

                                <span>
                                    ${item.quantity}
                                </span>

                                <button
                                    class="quantity-plus"
                                    data-id="${item.id}"
                                >
                                    +
                                </button>

                            </div>

                            <button
                                class="remove-product"
                                data-id="${item.id}"
                            >
                                REMOVE
                            </button>

                        </div>

                    </div>
                `;

            }
        ).join("");


    /* TOTAL */

    if (cartTotalBox) {

        cartTotalBox.textContent =
            "Rs. " +
            getCartTotal()
                .toLocaleString();
    }


    /* PLUS */

    cartItems
        .querySelectorAll(
            ".quantity-plus"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.id
                            );

                        const product =
                            cart.find(
                                item =>
                                    item.id === id
                            );

                        if (product) {

                            product.quantity +=
                                1;

                            saveCart();

                            updateCartUI();
                        }
                    }
                );
            }
        );


    /* MINUS */

    cartItems
        .querySelectorAll(
            ".quantity-minus"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.id
                            );

                        const product =
                            cart.find(
                                item =>
                                    item.id === id
                            );

                        if (product) {

                            product.quantity -=
                                1;


                            if (
                                product.quantity <=
                                0
                            ) {

                                cart =
                                    cart.filter(
                                        item =>
                                            item.id !==
                                            id
                                    );
                            }


                            saveCart();

                            updateCartUI();
                        }
                    }
                );
            }
        );


    /* REMOVE */

    cartItems
        .querySelectorAll(
            ".remove-product"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.id
                            );

                        cart =
                            cart.filter(
                                item =>
                                    item.id !== id
                            );

                        saveCart();

                        updateCartUI();
                    }
                );
            }
        );
}

/* =====================================================
   WISHLIST
===================================================== */

let wishlist = [];


function loadWishlist() {

    const savedWishlist =
        localStorage.getItem(
            "hiddenYouthWishlist"
        );

    if (savedWishlist) {

        try {

            wishlist =
                JSON.parse(
                    savedWishlist
                );

        } catch {

            wishlist = [];
        }
    }
}


const heartButtons =
    document.querySelectorAll(
        ".heart"
    );


heartButtons.forEach(
    function (button, index) {

        button.addEventListener(
            "click",
            async function (event) {

                event.stopPropagation();

                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/products`
                        );

                    const data =
                        await response.json();

                    if (!data.success) {
                        return;
                    }

                    const product =
                        data.products[index];

                    if (!product) {
                        return;
                    }


                    const alreadySaved =
                        wishlist.find(
                            item =>
                                item.id ===
                                product.id
                        );


                    if (alreadySaved) {

                        wishlist =
                            wishlist.filter(
                                item =>
                                    item.id !==
                                    product.id
                            );

                        button.textContent =
                            "♡";

                        button.classList.remove(
                            "liked"
                        );

                    } else {

                        wishlist.push(
                            product
                        );

                        button.textContent =
                            "♥";

                        button.classList.add(
                            "liked"
                        );
                    }


                    localStorage.setItem(
                        "hiddenYouthWishlist",
                        JSON.stringify(
                            wishlist
                        )
                    );

                } catch (error) {

                    console.error(
                        "Wishlist error:",
                        error
                    );
                }
            }
        );
    }
);


/* =====================================================
   COLLECTION BUTTONS
===================================================== */

const collectionButtons =
    document.querySelectorAll(
        ".collection-btn"
    );


collectionButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const collection =
                    button.dataset.collection;


                if (
                    collection ===
                    "gym"
                ) {

                    const gymContainer =
                        document.querySelector(
                            ".gym-fit-container"
                        );

                    if (gymContainer) {

                        gymContainer.classList.toggle(
                            "active"
                        );
                    }
                }


                if (
                    collection ===
                    "buttondown"
                ) {

                    console.log(
                        "BUTTON DOWN selected"
                    );
                }
            }
        );
    }
);


/* =====================================================
   3D COLLECTION TILT
===================================================== */

collectionButtons.forEach(
    function (button) {

        button.addEventListener(
            "mousemove",
            function (event) {

                const rect =
                    button.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;

                const rotateY =
                    (
                        (x / rect.width) -
                        0.5
                    ) * 6;

                const rotateX =
                    (
                        (y / rect.height) -
                        0.5
                    ) * -6;


                button.style.transform =
                    `perspective(1000px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translateY(-12px)
                     scale(1.015)`;
            }
        );


        button.addEventListener(
            "mouseleave",
            function () {

                button.style.transform =
                    "";
            }
        );
    }
);


/* =====================================================
   MENU
===================================================== */

const menuButton =
    document.querySelector(
        ".menu-btn"
    );


if (menuButton) {

    menuButton.addEventListener(
        "click",
        function () {

            menuButton.classList.toggle(
                "active"
            );


            const lines =
                menuButton.querySelectorAll(
                    "span"
                );


            if (
                menuButton.classList.contains(
                    "active"
                )
            ) {

                if (lines[0]) {

                    lines[0].style.transform =
                        "rotate(45deg) translateY(4px)";
                }


                if (lines[1]) {

                    lines[1].style.transform =
                        "rotate(-45deg) translateY(-4px)";
                }

            } else {

                if (lines[0]) {

                    lines[0].style.transform =
                        "none";
                }


                if (lines[1]) {

                    lines[1].style.transform =
                        "none";
                }
            }
        }
    );
}


/* =====================================================
   CART CLOSE
===================================================== */

function closeHiddenYouthCart() {

    const panel =
        document.getElementById(
            "cartPanel"
        );

    const overlay =
        document.getElementById(
            "cartOverlay"
        );


    if (panel) {

        panel.classList.remove(
            "active"
        );
    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );
    }
}


/* =====================================================
   CHECKOUT
===================================================== */

const checkoutBtn =
    document.getElementById(
        "checkoutBtn"
    );

const checkoutPanel =
    document.getElementById(
        "checkoutPanel"
    );

const checkoutOverlay =
    document.getElementById(
        "checkoutOverlay"
    );

const closeCheckout =
    document.getElementById(
        "closeCheckout"
    );

const checkoutSubtotal =
    document.getElementById(
        "checkoutSubtotal"
    );

const checkoutItems =
    document.getElementById(
        "checkoutItems"
    );

const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );
const deliveryChargeElement =
    document.getElementById(
        "deliveryCharge"
    );

function getDeliveryCharge() {

    const cityInput =
        document.getElementById("customerCity");

    const postalCodeInput =
        document.getElementById("customerPostalCode");

    const city =
        cityInput
            ? cityInput.value.trim().toLowerCase()
            : "";

    const postalCode =
        postalCodeInput
            ? postalCodeInput.value.trim()
            : "";

    if (!postalCode || postalCode.length !== 5) {
        return 0;
    }

    // Lahore se bahar
    if (city && city !== "lahore") {
        return 500;
    }

    // BATAPUR ke qareeb areas
    const nearPostalCodes = [
        "53400", // Batapur
        "53500", // Jallo / Jallo Pind
        "53600", // Wagha
        "54820", // Jallo More
        "54850", // Harbans Pura
        "54870", // Tajpura
        "54920"  // Baghbanpura
    ];

    // BATAPUR se thore door areas
    const mediumPostalCodes = [
        "54000",
        "54020",
        "54030",
        "54590",
        "54610",
        "54650",
        "54800",
        "54810",
        "54880",
        "54890",
        "53710"
    ];

    // BATAPUR se sab se door areas
    const farPostalCodes = [
        "53100",
        "53720",
        "54500",
        "54570",
        "54600",
        "54660",
        "54700",
        "54760",
        "54762",
        "54770",
        "54780",
        "54782",
        "54792",
        "55160"
    ];

    if (nearPostalCodes.includes(postalCode)) {
        return 250;
    }

    if (mediumPostalCodes.includes(postalCode)) {
        return 350;
    }

    if (farPostalCodes.includes(postalCode)) {
        return 500;
    }

    // Lahore ka koi naya/unknown code
    return 500;
}


function updateCheckoutTotal() {

    const subtotal = getCartTotal();

    const delivery = getDeliveryCharge();

    const total = subtotal + delivery;

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent =
            "Rs. " + subtotal.toLocaleString();
    }

    if (deliveryChargeElement) {
        deliveryChargeElement.textContent =
            "Rs. " + delivery.toLocaleString();
    }

    if (checkoutTotal) {
        checkoutTotal.textContent =
            "Rs. " + total.toLocaleString();
    }
} 

/* =====================================================
   OPEN CHECKOUT
===================================================== */

function openCheckout() {

    if (
        !cart ||
        cart.length === 0
    ) {

        alert(
            "YOUR BAG IS EMPTY."
        );

        return;
    }


    if (!checkoutPanel) {

        alert(
            "Checkout panel HTML is missing."
        );

        return;
    }


    if (checkoutItems) {

        checkoutItems.innerHTML =
            cart.map(
                function (item) {

                    return `
                        <div class="checkout-item">

                            <div>

                                <div class="checkout-item-name">
                                    ${item.name}
                                </div>

                                <div class="checkout-item-qty">
                                    QTY: ${item.quantity}
                                </div>

                            </div>

                            <strong>
                                Rs.
                                ${(
                                    Number(
                                        item.price
                                    ) *
                                    item.quantity
                                ).toLocaleString()}
                            </strong>

                        </div>
                    `;

                }
            ).join("");
    }


  updateCheckoutTotal();


    const cartPanel =
        document.getElementById(
            "cartPanel"
        );

    const cartOverlay =
        document.getElementById(
            "cartOverlay"
        );


    if (cartPanel) {

        cartPanel.classList.remove(
            "active"
        );
    }


    if (cartOverlay) {

        cartOverlay.classList.remove(
            "active"
        );
    }


    checkoutPanel.classList.add(
        "active"
    );


    if (checkoutOverlay) {

        checkoutOverlay.classList.add(
            "active"
        );
    }
}


/* =====================================================
   CLOSE CHECKOUT
===================================================== */

function closeCheckoutPanel() {

    if (checkoutPanel) {

        checkoutPanel.classList.remove(
            "active"
        );
    }


    if (checkoutOverlay) {

        checkoutOverlay.classList.remove(
            "active"
        );
    }
}


/* =====================================================
   CHECKOUT BUTTON
===================================================== */

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openCheckout();
        }
    );
}


/* =====================================================
   CLOSE CHECKOUT BUTTON
===================================================== */

if (closeCheckout) {

    closeCheckout.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            closeCheckoutPanel();
        }
    );
}


/* =====================================================
   CHECKOUT OVERLAY
===================================================== */

if (checkoutOverlay) {

    checkoutOverlay.addEventListener(
        "click",
        function () {

            closeCheckoutPanel();
        }
    );
}


/* =====================================================
   CHECKOUT FORM → BACKEND ORDER
===================================================== */

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );


if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (
                !cart ||
                cart.length === 0
            ) {

                alert(
                    "YOUR BAG IS EMPTY."
                );

                return;
            }


            const name =
                document
                    .getElementById(
                        "customerName"
                    )
                    ?.value
                    .trim();

            const phone =
                document
                    .getElementById(
                        "customerPhone"
                    )
                    ?.value
                    .trim();

            const address =
                document
                    .getElementById(
                        "customerAddress"
                    )
                    ?.value
                    .trim();

            const city =
                document
                    .getElementById(
                        "customerCity"
                    )
                    ?.value
                    .trim();
const postalCode =
    document
        .getElementById(
            "customerPostalCode"
        )
        ?.value
        .trim();

const postalAreaElement =
    document.getElementById(
        "postalArea"
    );

if (
    !postalCode ||
    postalCode.length !== 5 ||
    !postalAreaElement ||
    !postalAreaElement.innerHTML.includes("AREA:")
) {

    alert(
        "PLEASE ENTER A VALID POSTAL CODE FIRST.\n\n" +
        "YOUR DELIVERY CHARGE WILL BE CALCULATED AFTER THE POSTAL CODE IS VERIFIED."
    );

    return;
}

            if (
                !name ||
                !phone ||
                !address ||
                !city
            ) {

                alert(
                    "PLEASE FILL ALL DETAILS."
                );

                return;
            }

            const paymentTransactionId =
                document
                    .getElementById(
                        "paymentTransactionId"
                    )
                    ?.value
                    .trim();

            const paymentScreenshotInput =
                document.getElementById(
                    "paymentScreenshot"
                );

            if (!paymentTransactionId) {
                alert(
                    "PLEASE ENTER YOUR JAZZCASH TRANSACTION ID."
                );
                return;
            }

            if (
                !paymentScreenshotInput ||
                !paymentScreenshotInput.files ||
                !paymentScreenshotInput.files[0]
            ) {
                alert(
                    "PLEASE UPLOAD YOUR PAYMENT SCREENSHOT."
                );
                return;
            }

            const paymentScreenshotFile =
                paymentScreenshotInput.files[0];

            if (
                !paymentScreenshotFile.type.startsWith(
                    "image/"
                )
            ) {
                alert(
                    "PLEASE UPLOAD A VALID PAYMENT SCREENSHOT."
                );
                return;
            }

            if (
                paymentScreenshotFile.size >
                1200 * 1024
            ) {
                alert(
                    "PAYMENT SCREENSHOT MUST BE 1.2 MB OR SMALLER."
                );
                return;
            }

            const paymentScreenshot =
                await new Promise(
                    function(resolve, reject) {
                        const reader = new FileReader();

                        reader.onload = function() {
                            resolve(reader.result);
                        };

                        reader.onerror = function() {
                            reject(
                                new Error(
                                    "Could not read payment screenshot."
                                )
                            );
                        };

                        reader.readAsDataURL(
                            paymentScreenshotFile
                        );
                    }
                );

            const orderData = {

                customer: {

                    name:
                        name,

                    email:
                        (() => {
                            try {
                                const savedCustomer =
                                    JSON.parse(
                                        localStorage.getItem(
                                            "hiddenYouthCustomer"
                                        ) || "null"
                                    );
                                return savedCustomer?.email || "";
                            } catch {
                                return "";
                            }
                        })(),

                    phone:
                        phone,

                    address:
                        address,

                    city:
                        city, 
                   postalCode:
    postalCode,

deliveryCharge:
    getDeliveryCharge(),

                    payment: {
                        method:
                            "JAZZCASH",
                        accountName:
                            "Shazia Zahid",
                        accountNumber:
                            "03094567938",
                        transactionId:
                            paymentTransactionId,
                        screenshot:
                            paymentScreenshot
                    }

                },

                items:                    cart.map(
                        function (item) {

                            return {

                                id:
                                    item.id,

                                name:
                                    item.name,

                                price:
                                    Number(
                                        item.price
                                    ),

                                quantity:
                                    item.quantity,

                                image:
                                    item.image ||
                                    ""

                            };
                        }
                    )
            };


            const submitButton =
                checkoutForm.querySelector(
                    ".place-order-btn"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.innerHTML =
                    "PLACING ORDER...";
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/orders`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                ...(localStorage.getItem(
                                    "hiddenYouthCustomerToken"
                                )
                                    ? {
                                        "Authorization":
                                            "Bearer " +
                                            localStorage.getItem(
                                                "hiddenYouthCustomerToken"
                                            )
                                    }
                                    : {})
                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "ORDER FAILED"
                    );
                }


                const orderId =
                    data.order &&
                    data.order.id
                        ? data.order.id
                        : "PENDING";


                window.alert(
                    "THANK YOU, " +
                    name.toUpperCase() +
                    "!\n\n" +
                    "YOUR PAYMENT DETAILS HAVE BEEN SUBMITTED.\n\n" +
                    "ORDER ID: " +
                    orderId +
                    "\n\n" +
                    "PAYMENT VERIFICATION PENDING.\n" +
                    "YOUR ORDER WILL BE CONFIRMED AFTER PAYMENT IS VERIFIED."
                );


                checkoutForm.reset();

                closeCheckoutPanel();


                cart = [];

                saveCart();

                updateCartUI();


                console.log(
                    "ORDER CREATED:",
                    data.order
                );


            } catch (error) {

                console.error(
                    "ORDER ERROR:",
                    error
                );

                alert(
                    "ORDER COULD NOT BE PLACED.\n\n" +
                    "PLEASE TRY AGAIN."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        'PLACE ORDER <span>→</span>';
                }
            }

        }
    );
}

/* =====================================================
   POSTAL CODE → AREA / CITY
===================================================== */

const postalCodeInput =
    document.getElementById("customerPostalCode");

const postalArea =
    document.getElementById("postalArea");

const cityInput =
    document.getElementById("customerCity");

if (postalCodeInput) {

    postalCodeInput.addEventListener(
        "input",
        async function () {

            const postalCode =
                postalCodeInput.value
                    .replace(/\D/g, "")
                    .slice(0, 5);

            postalCodeInput.value =
                postalCode;

            if (postalCode.length !== 5) {
                if (postalArea) {
                    postalArea.innerHTML = "";
                }
                return;
            }

            if (postalArea) {
                postalArea.innerHTML =
                    "CHECKING AREA...";
            }

            try {

                const response = await fetch(
                    `${API_URL}/api/postal-codes/${postalCode}`
                );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.results ||
                    data.results.length === 0
                ) {
                    throw new Error(
                        "POSTAL CODE NOT FOUND"
                    );
                }

                const location =
                    data.results[0];

                if (cityInput) {
                    cityInput.value =
                        location.city || "";
                }

                updateCheckoutTotal();

                if (postalArea) {
                    postalArea.innerHTML =
                        `<strong>AREA:</strong> ${
                            location.area_name || ""
                        }`;
                }

            } catch (error) {

                console.error(
                    "POSTAL CODE ERROR:",
                    error
                );

                if (postalArea) {
                    postalArea.innerHTML =
                        "AREA NOT FOUND — PLEASE CHECK POSTAL CODE.";
                }
            }
        }
    );
}

/* =====================================================
   ADVANCE PAYMENT DISPLAY — ADDED ONLY
===================================================== */
function updateAdvancePaymentAmount() {
    const amountElement =
        document.getElementById("advancePaymentAmount");

    if (amountElement) {
        amountElement.textContent =
            "Rs. " +
            (
                getCartTotal() +
                getDeliveryCharge()
            ).toLocaleString();
    }
}

const originalUpdateCheckoutTotal =
    updateCheckoutTotal;

updateCheckoutTotal = function () {
    originalUpdateCheckoutTotal();
    updateAdvancePaymentAmount();
};

window.addEventListener(
    "load",
    function () {
        updateAdvancePaymentAmount();
    }
);

/* =====================================================
   PAGE LOAD
===================================================== */

window.addEventListener(
    "load",
    function () {

        loadCart();

        loadWishlist();

        loadProducts();

        updateCartUI();


        if (dressImage) {

            dressImage.style.animationPlayState =
                "running";
        }
    }
);

/* =====================================================
   PROCEED TO CHECKOUT — SAFETY FIX
===================================================== */

window.addEventListener(
    "load",
    function () {

        const finalCheckoutBtn =
            document.getElementById(
                "checkoutBtn"
            );

        if (!finalCheckoutBtn) {
            return;
        }

        /*
           Existing checkout listener is already
           installed above.

           We do NOT add another listener here,
           because duplicate listeners can cause
           checkout to open twice.
        */
    }
);


/* =====================================================
   LIVE VISITOR TRACKING
   HIDDEN YOUTH
===================================================== */

(function () {

    const VISITOR_KEY =
        "hiddenYouthVisitorId";


    let visitorId =
        localStorage.getItem(
            VISITOR_KEY
        );


    if (!visitorId) {

        visitorId =
            "visitor-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10);


        localStorage.setItem(
            VISITOR_KEY,
            visitorId
        );
    }


    async function sendVisitorHeartbeat() {

        try {

            const response =
                await fetch(
                    `${API_URL}/api/visitors/heartbeat`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                visitorId:
                                    visitorId
                            })
                    }
                );


            if (!response.ok) {

                console.error(
                    "Visitor heartbeat failed:",
                    response.status
                );

                return;
            }


            const data =
                await response.json();


            if (data.success) {

                console.log(
                    "HIDDEN YOUTH: VISITOR ONLINE"
                );
            }


        } catch (error) {

            console.error(
                "Visitor tracking error:",
                error
            );
        }
    }


    /*
       Send immediately
    */

    sendVisitorHeartbeat();


    /*
       Keep visitor online
       every 20 seconds
    */

    setInterval(
        sendVisitorHeartbeat,
        20000
    );

})();


/* =====================================================
   ACTIVE CART HEARTBEAT
===================================================== */

setInterval(
    function () {

        /*
           Only sync when the customer
           actually has products in cart.
        */

        if (
            Array.isArray(cart) &&
            cart.length > 0
        ) {

            syncCartWithBackend();

        }

    },
    20000
);


/* =====================================================
   FINAL CART SYNC WHEN PAGE CLOSES
===================================================== */

window.addEventListener(
    "beforeunload",
    function () {

        /*
           Do not block page closing.
           The normal 20-second heartbeat
           keeps the backend updated.
        */

        if (
            Array.isArray(cart) &&
            cart.length > 0
        ) {

            try {

                const visitorId =
                    getVisitorId();

                const payload =
                    JSON.stringify({

                        visitorId:
                            visitorId,

                        items:
                            cart.map(
                                function (item) {

                                    return {

                                        id:
                                            Number(
                                                item.id
                                            ),

                                        name:
                                            String(
                                                item.name ||
                                                ""
                                            ),

                                        price:
                                            Number(
                                                item.price ||
                                                0
                                            ),

                                        quantity:
                                            Number(
                                                item.quantity ||
                                                1
                                            ),

                                        image:
                                            String(
                                                item.image ||
                                                ""
                                            )
                                    };
                                }
                            )
                    });


                if (
                    navigator.sendBeacon
                ) {

                    const blob =
                        new Blob(
                            [payload],
                            {
                                type:
                                    "application/json"
                            }
                        );

                    navigator.sendBeacon(
                        `${API_URL}/api/visitor/cart`,
                        blob
                    );
                }

            } catch (error) {

                console.error(
                    "FINAL CART SYNC ERROR:",
                    error
                );
            }
        }
    }
);


/* =====================================================
   INITIAL CART BACKEND SYNC
===================================================== */

window.addEventListener(
    "load",
    function () {

        /*
           Give the page a moment to restore
           localStorage before syncing.
        */

        setTimeout(
            function () {

                if (
                    Array.isArray(cart)
                ) {

                    syncCartWithBackend();

                }

            },
            500
        );

    }
);


/* =====================================================
   ONLINE STATUS
===================================================== */

window.addEventListener(
    "online",
    function () {

        console.log(
            "HIDDEN YOUTH: INTERNET ONLINE"
        );


        if (
            Array.isArray(cart)
        ) {

            syncCartWithBackend();
        }
    }
);


/* =====================================================
   OFFLINE STATUS
===================================================== */

window.addEventListener(
    "offline",
    function () {

        console.log(
            "HIDDEN YOUTH: INTERNET OFFLINE"
        );

    }
);


/* =====================================================
   ERROR HANDLER
===================================================== */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "HIDDEN YOUTH JAVASCRIPT ERROR:",
            event.error ||
            event.message
        );

    }
);


/* =====================================================
   FINAL READY MESSAGE
===================================================== */

console.log(
    "HIDDEN YOUTH SCRIPT LOADED SUCCESSFULLY."
);

console.log(
    "Backend:",
    API_URL
);

console.log(
    "Active cart tracking: ENABLED"
);

console.log(
    "Live visitor tracking: ENABLED"
);
