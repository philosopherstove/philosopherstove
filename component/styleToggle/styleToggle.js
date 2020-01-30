/********
Component
*********/
PS.component.styleToggle = {};


/********
Functions
*********/
PS.component.styleToggle.func = {};

PS.component.styleToggle.func.toggle_colorMode = ()=>{
    let localStorageObj = JSON.parse(window.localStorage.getItem("PS"));
    let colorMode       = localStorageObj.colorMode;
    if(colorMode === "light"){
        localStorageObj.colorMode = "dark";
        PS.component.styleToggle.func.transition_toDark();
    }
    else
    if(colorMode === "dark"){
        localStorageObj.colorMode = "light";
        PS.component.styleToggle.func.transition_toLight();
    };
    window.localStorage.setItem("PS", JSON.stringify(localStorageObj));
};


PS.component.styleToggle.func.transition_toDark = ()=>{
    let body = document.body;
        body.classList.add("backgroundColor_blackBlue_1");
        body.classList.remove("backgroundColor_white_1");
    let homeButton = document.querySelector("#home_PS");
        homeButton.src = `img/stoveIcon_white_1.svg`;
    let toggleBody = document.querySelector(".styleToggleContainer .toggleBody");
        toggleBody.classList.add("toggle_on");
        toggleBody.classList.remove("toggle_off");
    let toggleBall = toggleBody.children[0];
        toggleBall.classList.add("toggle_on");
        toggleBall.classList.remove("toggle_off");
    let divideLine = document.querySelector("#homeAndBar_PS .divideLine");
        divideLine.classList.add("backgroundColor_white_1");
        divideLine.classList.remove("backgroundColor_blackBlue_1");
    // on home, portrait swap colors
    if(PS.component.category.state.selected[0] === false
    && PS.component.link.state.selected[0] === false){
        PS.component.portrait.func.transition_colorFade("white_1");
    };
};


PS.component.styleToggle.func.transition_toLight = ()=>{
    let body = document.body;
        body.classList.add("backgroundColor_white_1");
        body.classList.remove("backgroundColor_blackBlue_1");
    let homeButton = document.querySelector("#home_PS");
        homeButton.src = `img/stoveIcon_blackBlue_1.svg`;
    let toggleBody = document.querySelector(".styleToggleContainer .toggleBody");
        toggleBody.classList.add("toggle_off");
        toggleBody.classList.remove("toggle_on");
    let toggleBall = toggleBody.children[0];
        toggleBall.classList.add("toggle_off");
        toggleBall.classList.remove("toggle_on");
    let divideLine = document.querySelector("#homeAndBar_PS .divideLine");
        divideLine.classList.add("backgroundColor_blackBlue_1");
        divideLine.classList.remove("backgroundColor_white_1");
    // on home, portrait swap colors
    if(PS.component.category.state.selected[0] === false
    && PS.component.link.state.selected[0] === false){
        PS.component.portrait.func.transition_colorFade("blackBlue_1");
    };
};
