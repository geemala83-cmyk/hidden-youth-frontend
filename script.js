/* =====================================================
   HIDDEN YOUTH — FRONTEND + BACKEND
===================================================== */

const API_URL = "https://hidden-youth-backend-production.up.railway.app";

/* =====================================================
   3D DRESS
===================================================== */

const dressWrapper = document.querySelector(".dress-wrapper");
const dressImage = document.querySelector(".dress-image");
const visualArea = document.querySelector(".visual-area");
const visualGlow = document.querySelector(".visual-glow");

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let dressHover = false;

if (visualArea && dressWrapper && dressImage) {

    visualArea.addEventListener("mousemove", function (event) {

        const rect = visualArea.getBoundingClientRect();

        mouseX =
            ((event.clientX - rect.left) / rect.width) - 0.5;

        mouseY =
            ((event.clientY - rect.top) / rect.height) - 0.5;
    });

    visualArea.addEventListener("mouseenter", function () {

        dressHover = true;
        dressImage.style.animationPlayState = "paused";
    });

    visualArea.addEventListener("mouseleave", function () {

        dressHover = false;
        mouseX = 0;
        mouseY = 0;

        dressImage.style.animationPlayState = "running";
    });

    function animateDress() {

        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;

        const rotateY = currentX * 28;
        const rotateX = currentY * -20;
        const depth = dressHover ? 35 : 20;

        dressWrapper.style.transform =
            `perspective(1200px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateZ(${depth}px)`;

        requestAnimationFrame(animateDress);
    }

    animateDress();
}


/* =====================================================
   PURPLE GLOW
===================================================== */

if (visualArea && visualGlow) {

    visualArea.addEventListener("mousemove", function (event) {

        const rect = visualArea.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const moveX =
            (x - rect.width / 2) * 0.12;

        const moveY =
            (y - rect.height / 2) * 0.12;

        visualGlow.style.transform =
            `translate(${moveX}px, ${moveY}px) scale(1.08)`;
    });

    visualArea.addEventListener("mouseleave", function () {

        visualGlow.style.transform =
            "translate(0, 0) scale(1)";
    });
}


/* =====================================================
   EXPLORE
===================================================== */

const exploreButton =
    document.querySelector(".explore-btn");

const collectionSection =
    document.querySelector("#collections");

if (exploreButton && collectionSection) {

    exploreButton.addEventListener("click", function () {

        collectionSection.scrollIntoView({
            behavior: "smooth"
        });
    });
}


/* =====================================================
   CART
===================================================== */

let cart = [];


function loadCart() {

    const savedCart =
        localStorage.getItem("hiddenYouthCart");

    if (savedCart) {

        try {
            cart = JSON.parse(savedCart);
        } catch {
            cart = [];
        }
    }
}


function saveCart() {

    localStorage.setItem(
        "hiddenYouthCart",
        JSON.stringify(cart)
    );
}


function getCartCount() {

    return cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
}


function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total + (Number(item.price) * item.quantity),
        0
    );
}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const response =
            await fetch(`${API_URL}/api/products`);

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
    document.querySelectorAll(".add-bag");

addToBagButtons.forEach(function (button, index) {

    button.addEventListener("click", async function (event) {

        event.stopPropagation();

        try {

            const response =
                await fetch(`${API_URL}/api/products`);

            const data =
                await response.json();

            if (!data.success) {
                throw new Error("Products unavailable");
            }

            const product =
                data.products[index];

            if (!product) {
                return;
            }

            const existingProduct =
                cart.find(
                    item => item.id === product.id
                );

            if (existingProduct) {

                existingProduct.quantity += 1;

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
                document.getElementById("cartPanel");

            const cartOverlay =
                document.getElementById("cartOverlay");

            if (cartPanel) {
                cartPanel.classList.add("active");
            }

            if (cartOverlay) {
                cartOverlay.classList.add("active");
            }


            /* BUTTON ANIMATION */

            const originalText =
                button.textContent;

            button.textContent =
                "ADDED ✓";

            button.classList.add("added");

            setTimeout(function () {

                button.textContent =
                    originalText;

                button.classList.remove("added");

            }, 1200);


            console.log(
                "Added:",
                product.name
            );

            console.log(
                "Cart:",
                cart
            );

        } catch (error) {

            console.error(error);

            alert(
                "Backend is not connected. Start npm first."
            );
        }
    });
});


/* =====================================================
   CART UI
===================================================== */

function updateCartUI() {

    const cartCount =
        document.querySelector(".cart-count");

    if (cartCount) {

        cartCount.textContent =
            getCartCount();
    }


    const cartTotal =
        document.querySelector(".cart-total");

    if (cartTotal) {

        cartTotal.textContent =
            "Rs. " +
            getCartTotal().toLocaleString();
    }


    const cartItems =
        document.getElementById("cartItems");

    const cartTotalBox =
        document.getElementById("cartTotal");


    if (!cartItems) {
        return;
    }


    /* EMPTY CART */

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <span>◇</span>

                <h3>YOUR BAG IS EMPTY</h3>

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
        cart.map(function (item) {

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
                            ${Number(item.price).toLocaleString()}
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

        }).join("");


    /* TOTAL */

    if (cartTotalBox) {

        cartTotalBox.textContent =
            "Rs. " +
            getCartTotal().toLocaleString();
    }


    /* PLUS */

    cartItems
        .querySelectorAll(".quantity-plus")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const id =
                    Number(button.dataset.id);

                const product =
                    cart.find(
                        item => item.id === id
                    );

                if (product) {

                    product.quantity += 1;

                    saveCart();

                    updateCartUI();
                }
            });
        });


    /* MINUS */

    cartItems
        .querySelectorAll(".quantity-minus")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const id =
                    Number(button.dataset.id);

                const product =
                    cart.find(
                        item => item.id === id
                    );

                if (product) {

                    product.quantity -= 1;

                    if (product.quantity <= 0) {

                        cart =
                            cart.filter(
                                item => item.id !== id
                            );
                    }

                    saveCart();

                    updateCartUI();
                }
            });
        });


    /* REMOVE */

    cartItems
        .querySelectorAll(".remove-product")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const id =
                    Number(button.dataset.id);

                cart =
                    cart.filter(
                        item => item.id !== id
                    );

                saveCart();

                updateCartUI();
            });
        });
}


/* =====================================================
   WISHLIST
===================================================== */

let wishlist = [];


function loadWishlist() {

    const savedWishlist =
        localStorage.getItem("hiddenYouthWishlist");

    if (savedWishlist) {

        try {

            wishlist =
                JSON.parse(savedWishlist);

        } catch {

            wishlist = [];
        }
    }
}


const heartButtons =
    document.querySelectorAll(".heart");

heartButtons.forEach(function (button, index) {

    button.addEventListener("click", async function (event) {

        event.stopPropagation();

        try {

            const response =
                await fetch(`${API_URL}/api/products`);

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
                    item => item.id === product.id
                );


            if (alreadySaved) {

                wishlist =
                    wishlist.filter(
                        item => item.id !== product.id
                    );

                button.textContent =
                    "♡";

                button.classList.remove(
                    "liked"
                );

            } else {

                wishlist.push(product);

                button.textContent =
                    "♥";

                button.classList.add(
                    "liked"
                );
            }


            localStorage.setItem(
                "hiddenYouthWishlist",
                JSON.stringify(wishlist)
            );

        } catch (error) {

            console.error(
                "Wishlist error:",
                error
            );
        }
    });
});


/* =====================================================
   COLLECTION BUTTONS
===================================================== */

const collectionButtons =
    document.querySelectorAll(".collection-btn");


collectionButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const collection =
            button.dataset.collection;


        if (collection === "gym") {

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


        if (collection === "buttondown") {

            console.log(
                "BUTTON DOWN selected"
            );
        }
    });
});


/* =====================================================
   3D COLLECTION TILT
===================================================== */

collectionButtons.forEach(function (button) {

    button.addEventListener(
        "mousemove",
        function (event) {

            const rect =
                button.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            const rotateY =
                ((x / rect.width) - 0.5) * 6;

            const rotateX =
                ((y / rect.height) - 0.5) * -6;


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
});


/* =====================================================
   MENU
===================================================== */

const menuButton =
    document.querySelector(".menu-btn");


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
        document.getElementById("cartPanel");

    const overlay =
        document.getElementById("cartOverlay");


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
    document.getElementById("checkoutBtn");

const checkoutPanel =
    document.getElementById("checkoutPanel");

const checkoutOverlay =
    document.getElementById("checkoutOverlay");

const closeCheckout =
    document.getElementById("closeCheckout");

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutTotal =
    document.getElementById("checkoutTotal");


/* =====================================================
   OPEN CHECKOUT
===================================================== */

function openCheckout() {

    /* CHECK EMPTY CART */

    if (!cart || cart.length === 0) {

        alert(
            "YOUR BAG IS EMPTY."
        );

        return;
    }


    /* CHECK ELEMENTS */

    if (!checkoutPanel) {

        alert(
            "Checkout panel HTML is missing."
        );

        return;
    }


    /* CHECKOUT PRODUCTS */

    if (checkoutItems) {

        checkoutItems.innerHTML =
            cart.map(function (item) {

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
                            ${(Number(item.price) * item.quantity)
                                .toLocaleString()}
                        </strong>

                    </div>
                `;

            }).join("");
    }


    /* TOTAL */

    if (checkoutTotal) {

        checkoutTotal.textContent =
            "Rs. " +
            getCartTotal().toLocaleString();
    }


    /* CLOSE CART FIRST */

    const cartPanel =
        document.getElementById("cartPanel");

    const cartOverlay =
        document.getElementById("cartOverlay");


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


    /* OPEN CHECKOUT */

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
    document.getElementById("checkoutForm");

if (checkoutForm) {

    checkoutForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /* ==============================
           CHECK CART
        ============================== */

        if (!cart || cart.length === 0) {

            alert("YOUR BAG IS EMPTY.");
            return;

        }


        /* ==============================
           GET CUSTOMER DATA
        ============================== */

        const name =
            document.getElementById("customerName")
                ?.value
                .trim();

        const phone =
            document.getElementById("customerPhone")
                ?.value
                .trim();

        const address =
            document.getElementById("customerAddress")
                ?.value
                .trim();

        const city =
            document.getElementById("customerCity")
                ?.value
                .trim();


        /* ==============================
           VALIDATION
        ============================== */

        if (!name || !phone || !address || !city) {

            alert("PLEASE FILL ALL DETAILS.");
            return;

        }


        /* ==============================
           PREPARE ORDER
        ============================== */

        const orderData = {

            customer: {

                name: name,
                phone: phone,
                address: address,
                city: city

            },

            items: cart.map(function (item) {

                return {

                    id: item.id,
                    name: item.name,
                    price: Number(item.price),
                    quantity: item.quantity,
                    image: item.image || ""

                };

            })

        };


        /* ==============================
           DISABLE BUTTON
        ============================== */

        const submitButton =
            checkoutForm.querySelector(
                ".place-order-btn"
            );

        if (submitButton) {

            submitButton.disabled = true;
            submitButton.innerHTML =
                "PLACING ORDER...";

        }


        /* ==============================
           SEND TO BACKEND
        ============================== */

        try {

            const response = await fetch(
                `${API_URL}/api/orders`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify(orderData)

                }
            );


            const data =
                await response.json();


            /* ==============================
               BACKEND ERROR
            ============================== */

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "ORDER FAILED"
                );

            }


            /* ==============================
               SUCCESS
            ============================== */

           const orderId =
    data.order && data.order.id
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


            /* ==============================
               RESET CHECKOUT
            ============================== */

            checkoutForm.reset();

            closeCheckoutPanel();


            /* ==============================
               CLEAR CART
            ============================== */

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

            /* ==============================
               ENABLE BUTTON
            ============================== */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    'PLACE ORDER <span>→</span>';

            }

        }

    });

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
   PROCEED TO CHECKOUT — FIX
===================================================== */

window.addEventListener("load", function () {

    const finalCheckoutBtn =
        document.getElementById("checkoutBtn");

    if (!finalCheckoutBtn) {
        console.log("Checkout button not found.");
        return;
    }

    finalCheckoutBtn.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        /* CHECK EMPTY CART */

        if (!cart || cart.length === 0) {

            alert("YOUR BAG IS EMPTY.");

            return;
        }

        /* CHECKOUT ELEMENTS */

        const finalCheckoutPanel =
            document.getElementById("checkoutPanel");

        const finalCheckoutOverlay =
            document.getElementById("checkoutOverlay");

        const finalCheckoutItems =
            document.getElementById("checkoutItems");

        const finalCheckoutTotal =
            document.getElementById("checkoutTotal");

        /* CHECKOUT PANEL */

        if (!finalCheckoutPanel) {

            alert("Checkout panel HTML is missing.");

            return;
        }

        /* SHOW CART PRODUCTS */

        if (finalCheckoutItems) {

            finalCheckoutItems.innerHTML =
                cart.map(function (item) {

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
                                ${(Number(item.price) * item.quantity)
                                    .toLocaleString()}
                            </strong>

                        </div>
                    `;

                }).join("");
        }

        /* SHOW TOTAL */

        if (finalCheckoutTotal) {

            finalCheckoutTotal.textContent =
                "Rs. " +
                getCartTotal().toLocaleString();

        }

        /* CLOSE CART */

        const finalCartPanel =
            document.getElementById("cartPanel");

        const finalCartOverlay =
            document.getElementById("cartOverlay");

        if (finalCartPanel) {

            finalCartPanel.classList.remove("active");

        }

        if (finalCartOverlay) {

            finalCartOverlay.classList.remove("active");

        }

        /* OPEN CHECKOUT */

        finalCheckoutPanel.classList.add("active");

        if (finalCheckoutOverlay) {

            finalCheckoutOverlay.classList.add("active");

        }

        console.log("CHECKOUT OPENED");

    });

});

/* =====================================================
   LIVE VISITOR TRACKING
   HIDDEN YOUTH
===================================================== */

(function () {

    const VISITOR_STORAGE_KEY = "hiddenYouthVisitorId";

    let visitorId =
        localStorage.getItem(VISITOR_STORAGE_KEY);

    if (!visitorId) {

        visitorId =
            "visitor-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10);

        localStorage.setItem(
            VISITOR_STORAGE_KEY,
            visitorId
        );
    }


    async function sendVisitorHeartbeat() {

        try {

            const response = await fetch(
                `${API_URL}/api/visitors/heartbeat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        visitorId: visitorId
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
                    "LIVE VISITOR: ACTIVE"
                );

            }

        } catch (error) {

            console.error(
                "LIVE VISITOR ERROR:",
                error
            );
        }
    }


    /* FIRST HEARTBEAT */

    sendVisitorHeartbeat();


    /* KEEP VISITOR ONLINE */

    setInterval(
        sendVisitorHeartbeat,
        20 * 1000
    );


})();
