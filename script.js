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

const lahorePostalAreas = {
    "53100": "LAHORE KAHNA NAU",
    "53200": "BARKI",
    "53400": "LAHORE BATA PUR",
    "53480": "LAHORE BATA PUR",
    "53500": "JALLO",
    "53600": "WAGHA LAHORE",
    "53700": "THOKAR NIAZ BEG",
    "53710": "LAHORE E.M.E SOCIETY P.O",
    "53720": "LAHORE BAHRIA TOWN",
    "53800": "CHUHANG",
    "54000": "LAHORE GPO",
    "54010": "NAULAKHA",
    "54020": "LAHORE ALFLAH",
    "54030": "LAHORE AITCHESON COLLEGE",
    "54100": "SHAH ALAM MARKET",
    "54110": "SHAHI MOHALLAH",
    "54120": "TIMBER MARKET",
    "54500": "LAHORE MULTAN ROAD POST OFFICE",
    "54510": "REWAZ GARDEN",
    "54550": "LAHORE PT & T AUDIT",
    "54560": "LAHORE PMG PUNJAB POST OFFICE",
    "54570": "LAHORE ALLAMA IQBAL TOWN",
    "54572": "SABZAZAR",
    "54590": "LAHORE NEW UNIVERSITY CAMPUS",
    "54600": "LAHORE FEROZEPUR ROAD",
    "54610": "LAHORE SHADMAN WOMEN MODEL P.O",
    "54650": "LAHORE SECONDARY BOARD",
    "54660": "LAHORE GULBERG COLONY",
    "54700": "LAHORE MODEL TOWN",
    "54760": "LAHORE ISMAIL NAGAR",
    "54762": "LAHORE NISHTAR TOWN",
    "54770": "LAHORE TOWNSHIP SECTOR A-1",
    "54780": "LAHORE AWAN COLONEY",
    "54782": "LAHORE JOHAR TOWN",
    "54786": "LAHORE GREEN TOWN",
    "54790": "MANSOORA",
    "54792": "LAHORE DEFENCE HOUSING SOCIETY",
    "54800": "LAHORE C.M.A. CANTT.",
    "54810": "LAHORE CANTT. GPO",
    "54820": "LAHORE POSTMALL / JALLO MORE",
    "54840": "MUGHALPURA",
    "54850": "LAHORE HARBANS PURA",
    "54870": "LAHORE TAJPURA",
    "54880": "LAHORE PUNJAB GOVERNOR HOUSE",
    "54890": "LAHORE ENGINEERING UNIVERSITY",
    "54900": "CHAH MIRAN",
    "54920": "LAHORE BAGHBANPURA",
    "54950": "SHAHDARA BAGH",
    "55150": "RAIWIND",
    "55160": "LAHORE KOHINOOR ENERGY",
    "55210": "BALLOKI",
    "55270": "MANGA MANDI",
    "05301": "SAMANABAD PO",
    "05302": "DSPS SOUTH DIVN LAHORE PO",
    "05303": "FAISAL TOWN PO",
    "05304": "M BLOCK MODEL TOWN PO",
    "05305": "FEROZPUR ROAD PO",
    "05306": "CHOWK ICHHRA",
    "05307": "GULAB DEVI HOSPITAL PO",
    "05308": "ICHHRA PO",
    "05309": "NEW GARDEN TOWN N. PO",
    "05310": "RASOOL PARK PO",
    "05311": "REHMAN PURA PO",
    "05312": "ROTARY CENTRE",
    "05313": "WAHDAT COLONY PO",
    "05401": "LAHORE GPO NPO",
    "05402": "CHOWK QURTABA PO",
    "05403": "GOR ESTATE PO",
    "05404": "HIGH COURT PO",
    "05405": "ISLAMPURA PO",
    "05406": "MADINA CHOK POST OFFICE",
    "05407": "RACE COURSE ROAD PO",
    "05408": "SESSION COURT PO",
    "05409": "SHADMAN COLONY PO",
    "05410": "SHADMAN COLONY NPO",
    "05411": "MOZANG PO",
    "05412": "BADAMI BAGH PO",
    "05413": "DATA GUNJ BUKSH PO",
    "05414": "DATA NAGAR PO",
    "05415": "FLATTIES HOTEL PO",
    "05416": "KAMYAB NPO",
    "05417": "KAMYAB PO",
    "05418": "LAHORE KUTCHERY PO",
    "05419": "LAKSHMI CHOWK PO",
    "05420": "MOCHI GATE PO",
    "05421": "PAKISTAN TIMES PO",
    "05422": "PUNJAB UNIVERSITY OLD CAMPUS PO",
    "05423": "TAJ COMPANY NPO",
    "05424": "TAJ COMPANY PO",
    "05425": "A.I TOWN NPO",
    "05426": "WAPDA TOWN PO",
    "05427": "MANSOORA NPO",
    "05428": "N.U CAMPUS NPO",
    "05429": "SHAHDRA TOWN PO",
    "05430": "AZAM PO",
    "05431": "V R INSTITUTE PO",
    "05432": "EP CENTRE SADAR BAZAR NPO",
    "05433": "FORTRESS STADIUM PO",
    "05434": "ORDINANCE DEPOT PO",
    "05435": "SADDAR BAZAR PO",
    "05436": "LAHORE AIRPORT LSG",
    "05437": "LAHORE AIRPORT NPO BATCH-I",
    "05438": "LAHORE AIRPORT NPO BATCH-II",
    "05439": "MASJID KHALID PO",
    "05440": "NISHAT COLONY PO",
    "05441": "NISHTAR COLONY PO",
    "05442": "R.A BAZAR PO",
    "05443": "SERVICES PO",
    "05444": "WALTON PO",
    "05445": "RANG MAHAL NPO",
    "05446": "RANG MAHAL PO",
    "05447": "SHAH ALAM MARKET NPO",
    "05449": "AMER SIDHU PO",
    "05450": "KOT LAKHPAT PO",
    "05452": "JAHANGIR TOWN PO",
    "05453": "SANDA PO",
    "05454": "L.C.C.H SOCIETY PO",
    "05455": "L.C.C.H SOCIETY NPO",
    "05456": "CG OFFICE PO",
    "05457": "GULBERG COLONY NPO",
    "05458": "GULBERG N. PO",
    "05459": "GULBERG PO",
    "05460": "BAGHBANPURA NPO",
    "05461": "BILAL GUNJ PO",
    "05462": "KPAR PO",
    "05463": "ADDA CHABEEL PO",
    "05464": "MEHBOOB BOOTI",
    "05465": "PAKISTAN MINT PO",
    "05466": "SHALIMAR TOWN PO",
    "05467": "AGRICULTURE HOUSE PO",
    "05468": "ALLAMA IQBAL ROAD PO",
    "05469": "NAULAKHA NPO",
    "05470": "RAILWAY HEADQUARTER HSG",
    "05471": "CHAH MIRAN NPO",
    "05472": "DAROGHAWALA PO",
    "05473": "FAIZ BAGH PO",
    "05474": "MISRI SHAH PO",
    "05475": "SHAD BAGH PO",
    "05476": "SULTAN PURA PO",
    "05477": "WASSANPURA PO",
    "05478": "DHARAMPURA PO",
    "05479": "GUNJ MOGHAL PURA PO",
    "05480": "NABI PURA PO",
    "05481": "KASURPURA PO",
    "05482": "SHAHDRA TOWN PO",
    "05483": "RUSTOM SOHRAB CYCLE FACTORY PO",
    "05484": "SHAHDRA BAGH NPO",
    "05485": "DHOLANWAL PO",
    "05486": "SHAH NOOR PO",
    "05487": "MARGAZAR COLONY PO",
    "05488": "CHUBURGI GARDEN ESTATE PO",
    "05489": "MULTAN ROAD NPO",
    "05490": "MULTAN ROAD PO",
    "05491": "SODIWAL PO",
    "05492": "S&S EP CENTRE PO",
    "05493": "PAKKI THATTI PO",
    "05494": "QARSHI DAWA KHANA PO",
    "05495": "SAMANABAD NPO",
    "05497": "REHMAN PURA PO",
    "05498": "NEW FRUIT MARKET PO",
    "05499": "SHER SHAH COLONY PO"
};

const nearPostalCodes = ["53400", "53480", "53500", "53600", "54820", "54840", "54850", "54870", "54900", "54920", "54950"];
const mediumPostalCodes = ["05401", "05402", "05403", "05404", "05405", "05406", "05407", "05408", "05409", "05410", "05411", "05412", "05413", "05414", "05415", "05416", "05417", "05418", "05419", "05420", "05421", "05422", "05423", "05424", "05425", "05426", "05427", "05428", "05429", "05430", "05431", "05432", "05433", "05434", "05435", "05436", "05437", "05438", "05439", "05440", "05441", "05442", "05443", "05444", "05445", "05446", "05447", "05449", "05452", "05453", "05454", "05455", "05456", "05457", "05458", "05459", "05460", "05461", "05462", "05463", "05464", "05465", "05466", "05467", "05468", "05469", "05470", "05471", "05472", "05473", "05474", "05476", "05477", "05478", "05479", "05480", "05481", "05482", "05483", "05484", "05485", "05486", "05487", "05488", "05489", "05490", "05491", "05492", "05493", "05494", "05495", "05497", "05498", "05499", "53700", "53710", "53800", "54000", "54010", "54020", "54030", "54100", "54110", "54120", "54500", "54510", "54550", "54560", "54570", "54590", "54610", "54650", "54800", "54810", "54880", "54890"];
const farPostalCodes = ["05475", "53100", "53200", "53720", "54500", "54572", "54600", "54660", "54700", "54760", "54762", "54770", "54780", "54782", "54786", "54790", "54792", "55150", "55160", "55210", "55270"];

function getDeliveryCharge() {

    const postalCodeInput =
        document.getElementById("customerPostalCode");

    const postalCode =
        postalCodeInput
            ? postalCodeInput.value.trim()
            : "";

    if (!postalCode || postalCode.length !== 5) {
        return 0;
    }

    if (nearPostalCodes.includes(postalCode)) {
        return 250;
    }

    if (mediumPostalCodes.includes(postalCode)) {
        return 350;
    }

    if (farPostalCodes.includes(postalCode)) {
        return 500;
    }

    /*
       Unknown code:
       NEVER falsely display "Lahore" as the area.
       Delivery remains Rs. 500 as the safest far-zone default.
    */
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
   POSTAL CODE → AREA / CITY
===================================================== */

const postalCodeInput =
    document.getElementById(
        "customerPostalCode"
    );

const postalArea =
    document.getElementById(
        "postalArea"
    );

const cityInput =
    document.getElementById(
        "customerCity"
    );

if (postalCodeInput) {

    postalCodeInput.addEventListener(
        "input",
        function () {

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

                if (cityInput) {
                    cityInput.value = "";
                }

                updateCheckoutTotal();
                return;
            }

            const area =
                lahorePostalAreas[postalCode];

            if (!area) {

                if (postalArea) {
                    postalArea.innerHTML =
                        "AREA NOT FOUND — PLEASE CHECK POSTAL CODE.";
                }

                if (cityInput) {
                    cityInput.value = "";
                }

                updateCheckoutTotal();
                return;
            }

            if (cityInput) {
                cityInput.value = "Lahore";
            }

            if (postalArea) {
                postalArea.innerHTML =
                    `<strong>AREA:</strong> ${area}`;
            }

            updateCheckoutTotal();
        }
    );
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


            const orderData = {

                customer: {

                    name:
                        name,

                    phone:
                        phone,

                    address:
                        address,

                    city:
                        city, 
                   postalCode:
    postalCode,

deliveryCharge:
    getDeliveryCharge()

                },

                items:
                    cart.map(
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
                                    "application/json"
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
                    "YOUR ORDER HAS BEEN RECEIVED.\n\n" +
                    "ORDER ID: " +
                    orderId
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
