/********
Component
*********/
PS.component.home = {};


/******
Element
*******/
PS.component.home.element = document.querySelector("#home_PS");
PS.component.home.element.addEventListener('click', ()=>{PS.component.home.func.select_home()});


/********
Functions
*********/
PS.component.home.func = {};

PS.component.home.func.select_home = async()=>{
    if(PS.component.link.state.selected[0] === true){
        PS.component.home.func.transition_fromLinkToHome();
    }
    else
    if(PS.component.category.state.selected[0] === true){
        PS.component.category.func.transition_fromCategoryToHome();
    };
};


PS.component.home.func.transition_fromLinkToHome = async()=>{
    // RETURN - if link is animating
    if(PS.component.link.state.animating[0] === true){return;};
    let linkObj = PS.component.link.state.selected[1];
    // state - LINK (animating ON)
    PS.func.toggle_state("link", "animating", linkObj);
    // transition - CONTENT (animateOut)
    await PS.component.link.func.transition_remove_content();
    // transition - LINKS (downAndOut)
    await PS.component.link.func.transition_downAndOut();
    // transition - CATEGORY (toUnselected)
    let categoryObj = PS.component.category.state.selected[1];
    let unselectedCategoryObjs = await PS.component.category.func.get_unselectedCategoryObjs(categoryObj);
    await PS.component.category.func.transition_categoryUnselected(categoryObj, unselectedCategoryObjs);
    // transition - PORTRAIT (remove & redraw for Home)
    PS.component.portrait.func.remove_portraitSVG();
    PS.component.portrait.func.init_landHome();
    // state - CATEGORY & LINK (selected OFF), LINK (animating OFF)
    PS.func.toggle_state("category", "selected", categoryObj);
    PS.func.toggle_state("link", "selected", linkObj);
    PS.func.toggle_state("link", "animating", linkObj);
    // set - HISTORY
    PS.func.set_history();
};



/*

TABLE OF CONTENTS

Component
=========
    PS.component.home = {};

Element
=======
    PS.component.home.element =

Functions
=========
    PS.component.home.func = {};

SELECT
    PS.component.home.func.select_home = async()=>{

TRANSITION
    PS.component.home.func.transition_fromLinkToHome = async()=>{

*/
