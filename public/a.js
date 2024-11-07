var Shopify = Shopify || {};
Shopify.money_format = '$';
Shopify.formatMoney = function (cents, format = shopCurrency) {
    if (typeof cents == 'string') {
        cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*}}/;
    var formatString = format || this.money_format;

    function defaultOption(opt, def) {
        return typeof opt == 'undefined' ? def : opt;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = defaultOption(precision, 2);
        thousands = defaultOption(thousands, ',');
        decimal = defaultOption(decimal, '.');

        if (isNaN(number) || number == null) {
            return 0;
        }

        number = (number / 100.0).toFixed(precision);

        var parts = number.split('.'), dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
            cents = parts[1] ? decimal + parts[1] : '';

        return dollars + cents;
    }

    switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
            value = formatWithDelimiters(cents, 2);
            break;
        case 'amount_no_decimals':
            value = formatWithDelimiters(cents, 0);
            break;
        case 'amount_with_comma_separator':
            value = formatWithDelimiters(cents, 2, '.', ',');
            break;
        case 'amount_no_decimals_with_comma_separator':
            value = formatWithDelimiters(cents, 0, '.', ',');
            break;
    }

    return formatString.replace(placeholderRegex, value);
};

// TODO: get all values from metafields
let shop = Shopify.shop;
let loadData = async (callback) => {// TODO: check tm_config in localStorage
    console.log('loadData');
    await fetch(`https://insurance.parcelpanel.com/api/v1/getCartSettingByShopUrl?shop_url=${shop}`).then((res) => res.json()).then((res) => {
        let initialData = res.data
        console.log(initialData);
        let shopConfig = {
            tm_success: initialData.tm_success,
            show_widget: initialData.tm_is_enable,
            tm_name: initialData.tm_name,
            tm_product_exclusion: [initialData.tm_product_exclusion],
            tm_title: initialData.tm_title,
            tm_description: initialData.tm_description,
            tm_variants: initialData.tm_variants,
            tm_min_protection_val: initialData.tm_min_protection_val,
            tm_max_protection_val: initialData.tm_max_protection_val,
            tm_compute: initialData.tm_compute,
            tm_proportion: initialData.tm_proportion,
            tm_min_variant_id: initialData.tm_min_variant_id,
            tm_max_variant_id: initialData.tm_max_variant_id,
            tm_insurance_icon: initialData.tm_insurance_icon,
            tm_currency_name: initialData.tm_currency_name,
            tm_symbol: initialData.tm_symbol,
            tm_fixed_val: initialData.tm_fixed_val,
            tm_fixed_variant_id: initialData.tm_fixed_variant_id
        };

        // store into localStorage
        localStorage.setItem('tmconfig', JSON.stringify(shopConfig));

        return shopConfig;
    });
    if (callback) return callback();
};

const calculateProtection = async (cartTotal, tmConfig) => {

    let protectionType = tmConfig.tm_compute;
    let protectionPercentage = tmConfig.tm_proportion;
    let protectionId;
    let protectionPrice;
    let minPrice = Number(tmConfig.tm_min_protection_val);
    let maxPrice = Number(tmConfig.tm_max_protection_val);
    let minId = tmConfig.tm_min_variant_id;
    let maxId = tmConfig.tm_max_variant_id;
    let protectionVariants = tmConfig.tm_variants;

    // TODO: check protection type
    if (protectionType == '1') {// protection is dynamic
        let ourProtectionPrice = (cartTotal * protectionPercentage) / 100;
        ourProtectionPrice = ourProtectionPrice.toFixed(2);

        // calculate the protection
        if (ourProtectionPrice < minPrice) {
            protectionPrice = minPrice;
            protectionId = minId;
            return {
                price: protectionPrice, variant_id: protectionId
            }
        } else if (ourProtectionPrice > maxPrice) {
            protectionPrice = maxPrice;
            protectionId = maxId;
            return {
                price: protectionPrice, variant_id: protectionId
            }
        } else {
            protectionPrice = ourProtectionPrice;
            let priceArray = Object.keys(protectionVariants);
            let returnedPrice;
            for (price of priceArray) {
                let priceCalculation = price - ourProtectionPrice;
                if (priceCalculation >= 0) {
                    protectionPrice = price;
                    protectionId = protectionVariants[price];
                    break;//满足条件，跳出循环
                }
            }
            console.log(ourProtectionPrice);
            console.log(protectionId);
            console.log(protectionPrice);
            return {
                price: protectionPrice, variant_id: protectionId
            }
        }
    } else {
        console.log('問題點');
        return {
            price: tmConfig.tm_fixed_val, variant_id: tmConfig.tm_fixed_variant_id
        }
    }
}

const tm_init = async () => {
    console.time('tm_init');
    localStorage.setItem('tm_running', true);
    // TODO: check tm_config in localStorage
    let shopConfig = localStorage.getItem('tmconfig') ? JSON.parse(localStorage.getItem('tmconfig')) : null;
    // check if shop config data is available in localStorage
    if (!shopConfig) {
        await loadData(tm_init);
        return;
    }
    let cartProtectionVariant = localStorage.getItem('cart_protection') ? localStorage.getItem('cart_protection') : null;

    let opted_out = localStorage.getItem('tm_opted_out') == 1 ? true : false;
    console.log(opted_out);
    console.log(typeof opted_out);

    let showWidget = false;

    if (shopConfig && shopConfig.show_widget == true) {
        showWidget = true;
    }

    console.log('showWidget', showWidget);

    let success = false;
    if (shopConfig && shopConfig.tm_success == 1) {
        success = true;
    }

    let checked = false;

    let tm_variant;

    // check if widget should be shown and limit did not exceeded
    if (showWidget == true && success == true) {

        let cart = await getCartCallback(checkCart);

        let cartTotal = await cart.total / 100;

        // now hit the api
        let getProtection = await calculateProtection(cartTotal, shopConfig);

        let variantFromApi = await getProtection.variant_id;
        let priceFromApi = await getProtection.price;

        // now we get the cart total price and time to hit the second api
        if (cartTotal == 0) {
            return;
        } else {// check for opt in status first

            if (opted_out == true) {
                checked = false;
            }
            if (opted_out == false) {
                checked = true;
            }

            console.log('widget check status: ', checked);
            // now check the variant in cart is equal to the variant in api return
            if (cartProtectionVariant) {
                if (cartProtectionVariant == variantFromApi) {
                    tm_variant = cartProtectionVariant;
                    if (document.querySelector('.ship-insurance')) document.querySelectorAll('.ship-insurance').forEach((item) => {
                        item.innerHTML = buildWidget(shopConfig, priceFromApi, tm_variant, checked ? 'checked' : '');
                    });
                } else {
                    tm_variant = variantFromApi;
                    if (cartProtectionVariant) {// now add the new protection to the cart
                        if (checked) {
                            await removeAndAddProtection(cartProtectionVariant, variantFromApi, false);
                        }
                    }

                    if (document.querySelector('.ship-insurance')) document.querySelectorAll('.ship-insurance').forEach((item) => {
                        item.innerHTML = buildWidget(shopConfig, priceFromApi, tm_variant, checked ? 'checked' : '');
                    });
                }
            } else {
                if (checked) {
                    tm_variant = variantFromApi;
                    await addProtection(Number(variantFromApi), 1, false);
                    if (document.querySelector('.ship-insurance')) document.querySelectorAll('.ship-insurance').forEach((item) => {
                        item.innerHTML = buildWidget(shopConfig, priceFromApi, tm_variant, checked ? 'checked' : '');
                    });
                } else {
                    tm_variant = variantFromApi;
                    if (document.querySelector('.ship-insurance')) document.querySelectorAll('.ship-insurance').forEach((item) => {
                        item.innerHTML = buildWidget(shopConfig, priceFromApi, tm_variant, checked ? 'checked' : '');
                    });
                }
            }

            // now
        }
    }
    localStorage.setItem('tm_running', false);
    updateWidgetPrice();
};
// function to get cart data and pass the data to another callback for processing.
const getCartCallback = async (callback) => {
    let cart = await fetch('/cart.js');
    let cartData = await cart.json();

    if (callback) return callback(cartData);

    return cartData;
};

// function to check cart items
const checkCart = async (cartData, callback = null) => {
    let currency = await cartData.currency;
    console.log('cart in check cart', cartData);
    if (cartData.items.length != 0) {
        let items = cartData.items;

        let total = parseFloat(cartData.total_price);

        let initialTotal = cartData.total_price;

        let tm_counter_array = [];

        let recheck = false;

        let dupeVariant;

        let counter = items.length;

        let shopConfig = localStorage.getItem('tmconfig') ? JSON.parse(localStorage.getItem('tmconfig')) : null;

        let excludedSKUs = shopConfig.tm_product_exclusion;
        // if no shop config is found wait and call loadData
        if (!shopConfig) {
            await loadData();
        }

        let promises = await items.forEach((item) => {
            if (item.handle.includes('shipping-insurance')) {
                tm_counter_array.push(item.variant_id);

                localStorage.setItem('cart_protection', item.variant_id);

                total = total - item.final_line_price;

                if (item.quantity > 1) {
                    recheck = true;
                    dupeVariant = item.variant_id;
                }
            } else {
                counter = counter + item.quantity;
                // TODO: check for the excluded product first
                excludedSKUs.forEach((product_id) => {
                    if (item.product_id == product_id) {
                        // substract the item price from total
                        total = total - item.final_line_price;
                    }
                });
            }
        });
        if (recheck == true) {
            let mutateCart = adjustProtectionQuantity(dupeVariant, 0, false);
            getCartCallback(checkCart);
        }
        if (tm_counter_array.length > 1) {
            await tm_counter_array.forEach((item) => {
                adjustProtectionQuantity(item, 0);
                localStorage.removeItem('cart_protection');
                recheck = false;
            });
        }
        if (tm_counter_array.length == 0) {
            localStorage.removeItem('cart_protection');
        }
        if (tm_counter_array.length == items.length) {
            fetch('/cart/clear.js').then((res) => {
                console.log('cart cleared');
                location.reload();
                localStorage.removeItem('cart_protection');
            });
        }
        // if recheck is true and duplicate protection is available call checkCart the function recursively

        return {
            total: parseFloat(total), currency: currency,
        };
    } else {
        return {
            total: 0, currency: currency,
        };
    }
};

// function to add protection to cart
const addProtection = async (variantId, quantity = 1, reload = false) => {
    const id = parseInt(variantId);

    let cartData;

    var request = {
        method: 'POST', headers: {
            'Content-Type': 'application/json;', Accept: 'application/json',
        }, body: JSON.stringify({
            id: id, quantity: quantity,
        }),
    };

    cartData = await fetch('/cart/add.js', request);
    let cartJson = await cartData.json();
    if (cartJson.id) {
        console.log('%c Protection added successfully', 'color: white; background-color: green');
        updateLiveCart(null);
    }

    localStorage.setItem('tm_opted_out', 2);
    localStorage.setItem('cart_protection', variantId);
    if (reload == true) {
        location.reload();
    } else {
        return cartJson;
    }
};

// function to remove protection
const removeProtection = async (variantId, reload = false) => {
    localStorage.setItem('tm_opted_out', 1);
    localStorage.removeItem('cart_protection');
    var request = {
        method: 'POST', headers: {
            'Content-Type': 'application/json;', Accept: 'application/json',
        }, body: JSON.stringify({
            id: String(variantId), quantity: 0,
        }),
    };
    cartData = await fetch('/cart/change.js', request);
    let cartJson = await cartData.json();

    if (cartJson.token) {
        console.log('%c Protection removed successfully', 'color: white; background-color: red');
        updateLiveCart(cartJson);
    }

    if (reload == true) {
        location.reload();
    } else {
        return cartJson;
    }
};
// function to update protection variant from cart
const adjustProtectionQuantity = async (variantId, quantity, reload = false) => {
    let cartData;

    var request = {
        method: 'POST', headers: {
            'Content-Type': 'application/json;', Accept: 'application/json',
        }, body: JSON.stringify({
            id: String(variantId), quantity: String(quantity),
        }),
    };
    cartData = await fetch('/cart/change.js', request);

    let cartJson = await cartData.json();

    console.log('%cnew cart instance after duplicate protection quantity decrease', 'color:yellow', cartJson);
    console.dir(cartJson);
    updateLiveCart(cartJson);
    if (reload == true) {
        location.reload();
    } else {
        return cartJson;
    }
};
let updateWidgetPrice = async () => {
    let cartData = await fetch('/cart.js').then(res => res.json());
    let widget = document.querySelector('#tm_cart');

    if (widget == null) return;
    let shopConfig = localStorage.getItem('tmconfig') ? JSON.parse(localStorage.getItem('tmconfig')) : null;
    let shopCurrency = shopConfig.tm_symbol + '{{amount}}';
    let items = await cartData.items;
    items.forEach((item) => {
        console.log(item);
        if (item.handle.includes('shipping-insurance')) {
            let price = Shopify.formatMoney(item.price, shopCurrency);
            let priceElem = document.querySelector('.tm_price');
            if (priceElem) priceElem.innerHTML = price;
        }
    });
};
// function remove and add protection to cart
const removeAndAddProtection = async (remove, add, reload = false) => {
    const removeRequest = {
        method: 'POST', headers: {
            'Content-Type': 'application/json;', Accept: 'application/json',
        }, body: JSON.stringify({
            id: String(remove), quantity: 0,
        }),
    };

    const addRequest = {
        method: 'POST', headers: {
            'Content-Type': 'application/json;', Accept: 'application/json',
        }, body: JSON.stringify({
            id: String(add), quantity: 1,
        }),
    };

    await fetch('/cart/change.js', removeRequest).then((res) => res.json()).then((data) => {
        console.log('removed and now adding');

        fetch('/cart/add.js', addRequest).then((res) => res.json()).then((data) => {
            if (data.id) {
                console.log('%c Protection swapped successfully', 'color: white; background-color: green');
                updateLiveCart(null);
            }

            localStorage.setItem('tm_opted_out', 2);
            localStorage.setItem('cart_protection', add);

            if (reload) {
                location.reload();
            }
        });
    });
};
// widget switch on/off listener function
const getShippingProtection = async (variantId, price, element) => {
    if (!element.checked) {
        console.log('unchecking and removing protection');
        document.getElementsByClassName('logo_img')[0].classList.add("in_disable");
        await removeProtection(variantId,);
    } else {
        console.log('checked and adding protection');
        document.getElementsByClassName('logo_img')[0].className = 'logo_img';
        await addProtection(parseInt(variantId), 1);
    }
};

// function to update subtotal and dom cart item's line id
const updateLiveCart = async (cartData = null) => {
    let cart = cartData;
    if (cart == null) cart = await getCartCallback();
    let shopConfig = localStorage.getItem('tmconfig') ? JSON.parse(localStorage.getItem('tmconfig')) : null;
    console.log(shopConfig);
    let shopCurrency = shopConfig.tm_symbol + '{{amount}} ' + shopConfig.tm_currency_name;
    let totalPrice = Shopify.formatMoney(cart.total_price, shopCurrency);
    let cartItems = cart.items;
    let totalCount = cart.item_count;
    let opted_out = localStorage.getItem('tm_opted_out') == 1 ? true : false;

    // change the cart item class name here.
    let lineAttribute = 'data-index';
    let quantityPlus = '[name="plus"]';
    let quantityMinus = '[name="minus"]';
    let removeItem = '[id^=\'remove\']';
    let totalElem = document.querySelectorAll('.mini-cart__recap-price-line span:last-child, .wcp-original-cart-total,.totals__subtotal-value ');
    let cartCountElem = document.querySelectorAll('.header__cart-count,.cart-count-bubble span:first-child');
    let cartItemNodes = document.querySelectorAll('.line-item--stack,.cart-item');
    let cartItemsList = Array.from(cartItemNodes);
    console.log('丛书' + opted_out);
    console.log(cartItemsList);
    console.log(cartItemNodes);

    //  if not opted out show one less in count
    if (!opted_out) current_count = totalCount - 1;
    if (opted_out) current_count = totalCount;
    if (cart.item_count == 0) current_count = 0;
    console.log('current and cart count', current_count, totalCount);
    if (totalElem) totalElem.forEach((elem) => (elem.innerHTML = totalPrice));
    if (cartCountElem) cartCountElem.forEach((elem) => (elem.innerHTML = current_count));
    await updateCartLine(lineAttribute, cartItemsList, cartItems, quantityPlus, quantityMinus, removeItem, opted_out);
};

// function to update the line index in dom cart line items
let updateCartLine = async (lineAttribute, cartItemsList, cartItems, qtyPlus, qtyMinus, rmvItem, opted_out) => {
    console.log(cartItemsList, lineAttribute);
    // for every line item in cart dom check with the cart items.
    await cartItemsList.forEach((item) => {
        if (item.innerHTML.toString().includes('/products/shipping-insurance') == true) {
            //item.style.setProperty('display', 'table-row', 'important')
            //item.classList.add("cart-item-table-row");
            item.style.display = 'none';
        }
        cartItems.forEach((cartItem, index) => {
            if (item.innerHTML.toString().includes(cartItem.url)) {
                console.log(item.querySelector(`[${lineAttribute}]`));
                let lineItem = item.querySelectorAll(`[${lineAttribute}]`);
                let removeItem = item.querySelectorAll(rmvItem);
                let quantityPlus = item.querySelectorAll(qtyPlus);
                let quantityMinus = item.querySelectorAll(qtyMinus);
                if (lineItem) lineItem.forEach((item) => item.setAttribute(lineAttribute, index + 1));
                if (quantityPlus) quantityPlus.forEach((item) => item.setAttribute('data-href', `/cart/change?quantity=${cartItem.quantity + 1}&line=${index + 1}`));
                if (quantityMinus) quantityMinus.forEach((item) => item.setAttribute('data-href', `/cart/change?quantity=${cartItem.quantity - 1}&line=${index + 1}`));
                if (removeItem) removeItem.forEach((item) => item.setAttribute('href', `/cart/change?line=${index + 1}&quantity=0`));
                console.log('line id updated');
            }
        });
    });
};

// function to build the widget
// 插入购物车插件内容
let buildWidget = (shopConfig, priceFromApi, tm_variant, checked) => {
    let shopCurrency = shopConfig.tm_symbol + '{{amount}}';
    let tm_title = shopConfig.tm_title
    let tm_description = shopConfig.tm_description
    let tm_insurance_icon = shopConfig.tm_insurance_icon;
    let protection_price = priceFromApi
    let protected_variant = tm_variant
    let protection_checkbox = checked ? 'checked' : ''
    let is_enable_class_str = checked ? '' : 'in_disable';
    console.log('build:' + protection_price);
    console.log(Shopify.formatMoney(protection_price * 100, shopCurrency))
    var snippet = `<div class="tm_cart" id="tm_cart">
        <div class="logo_img ${is_enable_class_str}">
            <img src="${tm_insurance_icon}" width="80" height="80">
        </div>
        <div class="tm_cart_content">
            <div class="tm_cart_f">
                 <span class="tm_title">
                     ${tm_title}
                 </span>
                 <span class="tm_price">
                       ${Shopify.formatMoney(protection_price * 100, shopCurrency)}
                 </span>
            </div>
            <p class="tm_description">
                ${tm_description}
            </p>
        </div>
        <div class="tm_switch">
            <input type="checkbox" id="tm_switch_btn" onclick="getShippingProtection('${protected_variant}','${protection_price}', this)" ${protection_checkbox} data-protected-variant="${protected_variant}">
            <label for="tm_switch_btn" class="tm_switch_label"></label>
        </div>
</div>`;
    return snippet;
};

window.onload = function () {
    loadData().then(function () {
        setTimeout(tm_init, 0);
        updateLiveCart(null);
    });

    window.addEventListener('click', (ev) => {
        const tmTriggers = Array.from(document.querySelectorAll('.product-form__add-button, .product-form__add-button *, .quantity-selector__button, .quantity-selector__button *, .mini-cart__quantity-remove, .mini-cart__quantity-remove *, .quantity__button'));
        const elm = ev.target;
        if (tmTriggers.includes(elm)) {
            console.log('tm triggered');
            setTimeout(() => {
                tm_init().then(() => updateLiveCart())
            }, 1500);
        }
    }, true);


    window.addEventListener('blur', (ev) => {
        const tmTriggers = Array.from(document.querySelectorAll('.quantity__input'));
        const elm = ev.target;
        if (tmTriggers.includes(elm)) {
            console.log('tm triggered');
            setTimeout(() => {
                tm_init().then(() => updateLiveCart())
            }, 1500);
        }
    }, true);

}
