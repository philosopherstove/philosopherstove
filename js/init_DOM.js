init_DOM();
async function init_DOM(){

    // Init localStorage token if not present
    if(window.localStorage.getItem("PS") === null){
        let obj = {};
        window.localStorage.setItem("PS", JSON.stringify(obj));
    };

    // Get colorMode from localStorage & determine templateObj
    let templateObj = {};
	let localStorageObj = JSON.parse(window.localStorage.getItem("PS"));
    let colorMode       = localStorageObj.colorMode;
    if(colorMode === undefined
	|| colorMode === "light"){
        if(colorMode === undefined){ // undefined defaults to setting "light" into localStorage
            localStorageObj.colorMode = "light";
            window.localStorage.setItem("PS", JSON.stringify(localStorageObj));
        };
        templateObj = await PS.func.give_template_light(templateObj);
    }
	else
	if(colorMode === "dark"){
        templateObj = await PS.func.give_template_dark(templateObj);
	};

    // Create html. Uses templateObj.
    let html = `
        <div id="wrap_philosopherstove" onclick="PS.component.portrait.func.action_redrawPortrait()">
            <div id="navWrap_PS">
                <div id="homeAndBar_PS">
                    <img id="home_PS" src="${templateObj.homeSrc}">
                    <div class="divideLine ${templateObj.divideLineClass}"></div>
                    <div class="styleToggleContainer" onclick="PS.component.styleToggle.func.toggle_colorMode()">
                        <div class="toggleBody ${templateObj.toggleBodyClass}">
                            <div class="toggleBall ${templateObj.toggleBallClass}"></div>
                        </div>
                    </div>
                </div>
                <ul id="navCategories_PS">
                    <li class="cursorPointer"><a></a></li>
                    <li class="cursorPointer"><a></a></li>
                </ul>
                <ul id="navLinks_PS">
                    <!-- insert navLinks here -->
                </ul>
            </div>
            <div id="contentSpace_PS">
                <!-- insert content here -->
            </div>
            <div id="portraitSpace_PS">
                <div></div>
            </div>
        </div>
    `;

    // Body given template class and html appended
    let body = document.body;
        body.classList.add(templateObj.bodyClass);
        body.insertAdjacentHTML("afterbegin", html);
};
