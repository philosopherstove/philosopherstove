/********
Component
*********/
PS.component.link = {};


/******
Setting
*******/
PS.component.link.setting = {};
PS.component.link.setting.position = {};
PS.component.link.setting.position.defaultLeft = 0;
PS.component.link.setting.position.selectedTop = -21;
PS.component.link.setting.position.extraLeftForEndPosition = 30;
PS.component.link.setting.position.extraTopForStartPosition = 29;
PS.component.link.setting.marginTop = 15;
PS.component.link.setting.height = 44;
PS.component.link.setting.scrollTop = null;
PS.component.link.setting.timing = {};


/****
State
*****/
PS.component.link.state = {};
PS.component.link.state.selected = [false, null];
PS.component.link.state.animating = [false, null];


/******
Objects
*******/
PS.component.link.objs = [];


/********
Functions
*********/
PS.component.link.func = {};

/******
ANIMATE
*******/
PS.component.link.func.animate_linksFadeIn = (unselectedLinkObjs)=>{
    return new Promise((resolve, reject)=>{
        for(i in unselectedLinkObjs){
            let obj = unselectedLinkObjs[i];
            obj.element.classList.remove("displayNone");
            obj.element.classList.add("fadeIn_link");
            obj.element.classList.remove("fadeOut_link");
            if(Number(i) === unselectedLinkObjs.length - 1){
                resolve();
            };
        };
    });
};


PS.component.link.func.animate_linksFadeOut = (unselectedLinkObjs)=>{
    return new Promise((resolve, reject)=>{
        for(i in unselectedLinkObjs){
            let obj = unselectedLinkObjs[i];
            obj.element.classList.add("fadeOut_link");
            obj.element.classList.remove("fadeIn_link");
            setTimeout(()=>{ // until after fadeOut
                obj.element.classList.add("displayNone"); // displayNone
            },160);
            if(Number(i) === unselectedLinkObjs.length - 1){
                resolve();
            };
        };
    });
};


PS.component.link.func.animate_swoop = async(obj, direction)=>{
    return new Promise((resolve, reject)=>{

        let elem = obj.element;

    	let path;
    	let sPos;
    	let fPos;
    	if(direction === "forward"){
    		path = obj.setting.position.swoopPath_forward;
    		sPos = obj.setting.position.default;
    		fPos = obj.setting.position.selected;
    	}
    	else
    	if(direction === "reverse"){
    		path = obj.setting.position.swoopPath_reverse;
    		sPos = obj.setting.position.selected;
    		fPos = obj.setting.position.default;
    	};

    	let tTotal = 320; /* 320ms/0.32s */
    	let tStart = Date.now();
    	let tFinal = tStart + tTotal;

    	let tRatio;
    	let topCurr;
    	let leftCurr;
    	let animId;
    	animate();

    	function animate(){

    		let tCurr = Date.now();

    		if(tCurr > tFinal){

                leftCurr        = fPos[0];
                topCurr         = fPos[1];
                elem.style.left = `${ leftCurr }px`;
    			elem.style.top  = `${ topCurr }px`;

                cancelAnimationFrame(animId);
                resolve();
    		}
    		else{

    			tRatio = (tCurr - tStart) / tTotal;

    			for(let i = 0; i < PS.component.link.setting.timing.ratios.length; i++){

                    if(PS.component.link.setting.timing.ratios[i][1] > tRatio){ /* passed current tRatio in pvtRatios array */

                        /* since passing current tRatio value in pvtRatios is condition to select, take an average of value before and after selected pvtRatio for better accuracy */
    					leftCurr        = ( (path[i - 1][0] + path[i + 1][0]) / 2 ) + sPos[0];
                        topCurr         = ( (path[i - 1][1] + path[i + 1][1]) / 2 ) + sPos[1];
                        elem.style.left = `${ leftCurr }px`;
    					elem.style.top  = `${ topCurr }px`;

                        break;
    				};
    			};

    			animId = requestAnimationFrame(animate);
    		};
    	};
    });
};


/****
APPLY
*****/
PS.component.link.func.apply_selectedStyle = async(linkObj)=>{
    // link ELEMENT - selected position & positionAbsolute class
    linkObj.element.style.left = `${linkObj.setting.position.selected[0]}px`;
    linkObj.element.style.top  = `${linkObj.setting.position.selected[1]}px`;
    linkObj.element.classList.add("positionAbsolute");
    // next link ELEMENT- add vacancySpace (marginTop)
    if(linkObj.element.nextElementSibling !== null){
        linkObj.element.nextElementSibling.style.marginTop = `${ (2 * PS.component.link.setting.marginTop) + PS.component.link.setting.height}px`;
    };
    // unselected link ELEMENTS - displayNone
    let unselectedLinkObjs = await PS.component.link.func.get_unselectedLinkObjs(linkObj);
    for(unselectedLinkObj of unselectedLinkObjs){
        unselectedLinkObj.element.classList.add('displayNone');
    };
};


PS.component.link.func.apply_view = async()=>{
    // >> Case A - link selected
    if(PS.component.link.state.selected[0] === true){
        await PS.component.link.func.serve_links(PS.component.category.state.selected[1]);
        let linkObj = PS.component.link.state.selected[1];
        PS.component.link.func.set_positions(linkObj);
        PS.component.link.func.apply_selectedStyle(linkObj);
        PS.component.link.func.serve_content(linkObj);
    }
    else // >> Case B - category selected
    if(PS.component.category.state.selected[0] === true){
        let linkObj = PS.component.category.state.selected[1];
        PS.component.link.func.serve_links(linkObj);
    };
};


/********
CALCULATE
*********/
PS.component.link.func.calculate_swoopPath = (obj, direction = null)=>{
    return new Promise((resolve, reject)=>{

        let points; /* Want perfect quarter circle swoop. Different control points depending on direction of swoop. */
		let pathRatios;
		let xDistance; /* Distances are final position minus start position */
		let yDistance;
		let coords = [];

		if(direction === "forward"){

			points     = [1, 0];
            pathRatios = PS.func.calculate_bezierCurves(points);
            xDistance  = obj.setting.position.selected[0] - obj.setting.position.default[0];
			yDistance  = obj.setting.position.selected[1] - obj.setting.position.default[1];

            for(let a = 0; a < pathRatios.length; a++){

				let x = pathRatios[a][0] * xDistance;
				let y = pathRatios[a][1] * yDistance;

				coords.push( [x, y] );

				if(a === pathRatios.length - 1){
                    obj.setting.position.swoopPath_forward = coords;
                    resolve();
				};
			};
        }
        else
		if(direction === "reverse"){

			points     = [0, 1];
			pathRatios = PS.func.calculate_bezierCurves(points);
			xDistance  = obj.setting.position.default[0] - obj.setting.position.selected[0];
			yDistance  = obj.setting.position.default[1] - obj.setting.position.selected[1];

			for(let a = 0; a < pathRatios.length; a++){

				let x = pathRatios[a][0] * xDistance;
				let y = pathRatios[a][1] * yDistance;

				coords.push( [x, y] );

				if(a === pathRatios.length - 1){
                    obj.setting.position.swoopPath_reverse = coords;
					resolve();
				};
			};
		};
    });
};


/******
FACTORY
*******/
PS.component.link.func.factory = async(input)=>{
    return new Promise((resolve, reject)=>{
        for(let i = 0; i < input.length; i++){
            let doc = input[i];
            let links = doc.links;
            for(link of links){
                let obj = {};
                    obj.associated = {};
                    obj.associated.category = PS.component.category.input[i].setting.name;
                    obj.setting = {};
                    obj.setting.name       = link.name;
                    obj.setting.dimensions = link.dimensions;
                    obj.setting.url        = link.url;
                    obj.setting.github     = link.github;
                    obj.setting.position = {};
                    obj.state = {};
                    obj.state.animating = false;
                    obj.state.selected  = false;
                PS.component.link.objs.push(obj);
            };
            if(i === PS.component.link.input.length - 1){
                resolve();
            };
        };
    });
};


/**
GET
***/
PS.component.link.func.get_associatedLinkObjs_fromCategoryName = (categoryName)=>{
    return new Promise((resolve, reject)=>{
        let associatedLinkObjs = [];
        for(i in PS.component.link.objs){
            let obj = PS.component.link.objs[i];
            if(obj.associated.category === categoryName){
                associatedLinkObjs.push(obj);
            };
            if(i == PS.component.link.objs.length -1){
                resolve(associatedLinkObjs);
            };
        };
    });
};


PS.component.link.func.get_obj_fromLinkName = (linkName)=>{
    return new Promise((resolve, reject)=>{
        for(obj of PS.component.link.objs){
            if(obj.setting.name === linkName){
                resolve(obj);
            };
        };
    });
};


PS.component.link.func.get_unselectedLinkObjs = (activeLinkObj)=>{
    return new Promise((resolve, reject)=>{
        let category = activeLinkObj.associated.category;
        let unselectedLinkObjs = [];
        for(i in PS.component.link.objs){
            let obj = PS.component.link.objs[i];
            // exclude selectedLinkObj (match same category & not same name)
            if(obj.associated.category === category
            && obj.setting.name !== activeLinkObj.setting.name){
                unselectedLinkObjs.push(obj);
            };
            if(Number(i) === PS.component.link.objs.length - 1){
                resolve(unselectedLinkObjs);
            };
        };
    });
};


/***
GIVE
****/
PS.component.link.func.give_categoryObjs_associatedLinks = ()=>{
    return new Promise((resolve)=>{
        for(i in PS.component.link.objs){
            let link = PS.component.link.objs[i];
            for(category of PS.component.category.objs){
                if(link.associated.category === category.setting.name){
                    if(category.associated.links == undefined){
                        category.associated.links = [];
                    };
                    category.associated.links.push(link.setting.name);
                };
            };
            if(Number(i) === PS.component.link.objs.length - 1){ // end of loop
                resolve();
            };
        };
    });
};


PS.component.link.func.give_component_urlState = (urlStateObj)=>{
    return new Promise((resolve)=>{
        for(i in PS.component.link.objs){ // go through material that effects component state
            let obj = PS.component.link.objs[i];
            if(urlStateObj.link === obj.setting.name){ // if match with urlState
                PS.func.toggle_state("link", "selected", obj); // toggle obj & comp state
                resolve();
                break;
            };
            if(Number(i) === PS.component.link.objs.length - 1){
                resolve();
            };
        };
    });
};


/***
INIT
****/
PS.component.link.func.init_component = ()=>{
    PS.component.link.func.factory(PS.component.link.input)
	.then(async()=>{
		await PS.component.link.func.give_categoryObjs_associatedLinks();
        PS.component.link.func.init_stateAndView();
	});
    // timingRatios set for category component will be set for link component
    do{PS.component.link.setting.timing.ratios = PS.component.category.setting.timing.ratios;}
    while(PS.component.link.setting.timing.ratios.length === 0);
};


PS.component.link.func.init_stateAndView = async()=>{
    await PS.component.link.func.give_component_urlState(await PS.func.get_urlStateObj());
    PS.component.link.func.apply_view();
};


/*****
SELECT
******/
PS.component.link.func.select_link = async(clicked)=>{
    // Case 1 - link selected => transition to category
    if(PS.component.link.state.selected[0] === true){
        PS.component.link.func.transition_fromLinkToCategory();
    }
    // Case 2 - link NOT selected => transition to link
    else
    if(PS.component.link.state.selected[0] === false){
        let linkName = clicked.children[0].innerHTML;
        let linkObj  = await PS.component.link.func.get_obj_fromLinkName(linkName);
        PS.component.link.func.transition_fromCategoryToLink(linkObj);
    }
};


/****
SERVE
*****/
PS.component.link.func.serve_content = (linkObj)=>{
    // mobile & STEVEN category => serve redirectLink
    if(linkObj.associated.category == "STEVEN"
    || window.innerWidth <= PS.setting.mobileBreakpoint){
        PS.component.link.func.serve_redirectLink(linkObj);
    }
    else{ // otherwise => serve frameAndButton
        PS.component.link.func.serve_frameAndButtons(linkObj);
    };
};


PS.component.link.func.serve_frameAndButtons = (linkObj)=>{
    let unit       = linkObj.setting.dimensions[0];
    let width      = linkObj.setting.dimensions[1];
    let height     = linkObj.setting.dimensions[2];
    let marginLeft = `calc(50% - (0.5 * ${width}${unit}))`;
    let url_deploy = linkObj.setting.url;
    let url_github = linkObj.setting.github;
    let html = `
        <div>
            <iframe
                class="frame contentAnimateIn"
                src=${url_deploy}
                style="width:${width}${unit};
                       height:${height}${unit};
                       margin-left:${marginLeft}"
            ></iframe>
            <div class="contentLinks_outerWrap">
                <div class="contentLinks">
                    <a class="deployButton buttonsAnimateIn" href="${url_deploy}" target="_blank"></a>
                    <a class="githubButton buttonsAnimateIn" href="${url_github}" target="_blank"></a>
                </div>
            </div>
        </div>
    `;
    // contentSpace gets height class and receives html
    let contentSpace = document.getElementById("contentSpace_PS");
        contentSpace.classList.add("contentSpace_height");
        contentSpace.insertAdjacentHTML("afterbegin", html);
};


PS.component.link.func.serve_links = async(categoryObj, breakpoint = "desktop")=>{
    return new Promise(async(resolve)=>{
        // use categoryObj to determine color for links
        let color = categoryObj.setting.color;
        let html = "";
        for(let i = 0; i < categoryObj.associated.links.length; i++){
            let linkName = categoryObj.associated.links[i];
    		html += `
                <li class="upAndIn_link" style="color: var(--${color});" onclick=PS.component.link.func.select_link(this)>
    				<a>${linkName}</a>
    			</li>
    		`;
            // end of loop
            if(i === categoryObj.associated.links.length - 1){
                // append to DOM
                let navLinks = document.querySelector("#navLinks_PS");
                navLinks.insertAdjacentHTML("beforeend", html);
                // give link objs reference to their associated element
                let category = categoryObj.setting.name;
                let associatedLinkObjs = await PS.component.link.func.get_associatedLinkObjs_fromCategoryName(category);
                for(let i = 0; i < associatedLinkObjs.length; i++){
                    let obj = associatedLinkObjs[i];
                        obj.element = document.querySelector(`#navLinks_PS li:nth-of-type(${i+1})`);
                    if(i === associatedLinkObjs.length - 1){ // end of loop
                        resolve();
                    };
                };
            };
    	};
    });
};


PS.component.link.func.serve_redirectLink = (linkObj)=>{
    let name = linkObj.setting.name;
    let url  = linkObj.setting.url;
    let html = `<a href="${url}" class="redirectAnchor" target="_blank">Go to ${name}</a>`;
    let contentSpace = document.getElementById("contentSpace_PS");
        contentSpace.insertAdjacentHTML("afterbegin", html);
};


/**
SET
***/
PS.component.link.func.set_positions = (obj)=>{
    let navLinks = document.querySelectorAll("#navLinks_PS li");
    for(let i = 0; i < navLinks.length; i++){
        let linkName = navLinks[i].children[0].innerHTML;
        if(linkName === obj.setting.name){
            let marginTops = PS.component.link.setting.marginTop * (i+1);
            let heights    = PS.component.link.setting.height * i;
            let scrollTop  = obj.element.parentNode.scrollTop;
            let startTop   = PS.component.link.setting.position.extraTopForStartPosition + marginTops + heights - scrollTop;
            // DEFAULT POSITION
            obj.setting.position.default = [PS.component.link.setting.position.defaultLeft, startTop];
            break;
        };
    };
    for(categoryObj of PS.component.category.objs){
        if(categoryObj.state.selected === true){
            let categoryObjElement = categoryObj.element;
            let left               = Number(categoryObjElement.style.left.split('px')[0]);
            let width              = categoryObjElement.getBoundingClientRect().width;
            let endLeft            = left + width + PS.component.link.setting.position.extraLeftForEndPosition;
            // SELECTED POSITION
            obj.setting.position.selected = [endLeft, PS.component.link.setting.position.selectedTop];
            break;
        };
    };
};


/*********
TRANSITION
**********/
PS.component.link.func.transition_downAndOut = async()=>{
    return new Promise((resolve, reject)=>{
        let links = document.querySelector("#navLinks_PS").children;
        for(let i = 0; i < links.length; i++){
            let link = links[i];
            link.classList.add("downAndOut_link");
            link.classList.remove("upAndIn_link");
            link.classList.remove("fadeIn_link");
            if(i === links.length - 1){
                setTimeout(()=>{ // until after fadeOut
    			// Remove links from DOM
                    let links = document.querySelectorAll("#navLinks_PS > li");
                    for(link of links){
                        link.remove();
                        resolve();
                    };
                },160);
            };
        };
    });
};


PS.component.link.func.transition_fromCategoryToLink = async(linkObj)=>{
    // RETURN - if link is animating
    if(PS.component.link.state.animating[0] === true){return;};
    // state  - LINK (animating ON)
    PS.func.toggle_state("link", "animating", linkObj);
    let url                = linkObj.setting.url;
    let associatedCategory = linkObj.associated.category;
    // My category or mobile view opens link in new window
    if( associatedCategory == "STEVEN"
    || window.innerWidth <= PS.setting.mobileBreakpoint){
        window.open(url, "_blank");
    }
    // Other categories get transition and local serve
    else{
        // transition - PORTRAIT (fade out)
        PS.component.portrait.func.transition_fadeOut();
        // serve - FRAME & BUTTONS
        PS.component.link.func.serve_frameAndButtons(linkObj);
        // transition - LINK (toSelected)
        let unselectedLinkObjs = await PS.component.link.func.get_unselectedLinkObjs(linkObj);
        await PS.component.link.func.transition_toSelected(linkObj, unselectedLinkObjs);
        // state - LINK (selected ON)
        PS.func.toggle_state("link", "selected", linkObj);
    };
    // state - LINK (animating OFF)
    PS.func.toggle_state("link", "animating", linkObj);
    // set - HISTORY
    PS.func.set_history();
};


PS.component.link.func.transition_fromLinkToCategory = async()=>{
    // RETURN - if link is animating
    if(PS.component.link.state.animating[0] === true){return;}
    // state  - LINK (animating ON)
    let linkObj = PS.component.link.state.selected[1];
    PS.func.toggle_state("link", "animating", linkObj);
    // transition - CONTENT (remove)
    await PS.component.link.func.transition_remove_content();
    // transition - LINK (toUnselected)
    let unselectedLinkObjs = await PS.component.link.func.get_unselectedLinkObjs(linkObj);
    await PS.component.link.func.transition_toUnselected(linkObj, unselectedLinkObjs);
    // transition - PORTRAIT (remove & redraw for Category)
    PS.component.portrait.func.remove_portraitSVG();
    PS.component.portrait.func.init_toCategory();
    // state - LINK (selected ON, animating OFF)
    PS.func.toggle_state("link", "selected", linkObj);
    PS.func.toggle_state("link", "animating", linkObj);
    // set - HISTORY
    PS.func.set_history();
};


PS.component.link.func.transition_remove_content = ()=>{
    return new Promise((resolve)=>{
        let content = document.querySelector("#contentSpace_PS").children[0];
            content.classList.add("contentAnimateOut");
        let delay_removeNode = setTimeout(()=>{
            content.remove();
            let contentSpace = document.getElementById("contentSpace_PS");
                contentSpace.classList.remove("contentSpace_height");
            resolve();
        },160);
    });
};


PS.component.link.func.transition_toSelected = async(activeLinkObj, otherLinkObjs)=>{
    return new Promise(async(resolve, reject)=>{
        // set - SCROLLTOP // because displayNone toggle seems to reset scrollTop, // and want scrolled container to be in same position when unselected link swoops back into position
        PS.component.link.setting.scrollTop = document.querySelector('#navLinks_PS').scrollTop;
        // link - Set (positions)
        PS.component.link.func.set_positions(activeLinkObj);
        // link element - position absolute + set initial top position
        activeLinkObj.element.style.top = `${activeLinkObj.setting.position.default[1]}px`;
        activeLinkObj.element.classList.add("positionAbsolute");
        // next link - add marginTop vacancySpace
        if(activeLinkObj.element.nextElementSibling !== null){
            activeLinkObj.element.nextElementSibling.style.marginTop = `${ (2 * PS.component.link.setting.marginTop) + PS.component.link.setting.height}px`;
        };
        // link - Calculate (swoop path)
        PS.component.link.func.calculate_swoopPath(activeLinkObj, "forward")
        .then(async()=>{
            // link - animate (swoop 0.32s)
            await PS.component.link.func.animate_swoop(activeLinkObj, "forward");
            resolve();
        });
        // other links - Animate (fadeOut)
        PS.component.link.func.animate_linksFadeOut(otherLinkObjs);
    });
};


PS.component.link.func.transition_toUnselected = async(activeLinkObj, otherLinkObjs)=>{
    return new Promise(async(resolve, reject)=>{
        // link - Calculate & Animate (swoop 0.32s)
        await PS.component.link.func.calculate_swoopPath(activeLinkObj, "reverse");
        await PS.component.link.func.animate_swoop(activeLinkObj, "reverse");
        // next link - restore marginTop (which was added for vacancySpace)
        if(activeLinkObj.element.nextElementSibling !== null){
            activeLinkObj.element.nextElementSibling.style.marginTop = `${PS.component.link.setting.marginTop}px`;
        };
        // link element - remove positionAbsolute
        activeLinkObj.element.classList.remove("positionAbsolute");
        // other links - animate (fadeIn)
        await PS.component.link.func.animate_linksFadeIn(otherLinkObjs);
        // navLinks container - set scrollTop (seems to be reset with displayNone class toggle)
        let navLinks = document.querySelector('#navLinks_PS');
        navLinks.scrollTop = PS.component.link.setting.scrollTop;
        resolve();
    });
};


/*

TABLE OF CONTENTS

Component
=========
PS.component.link = {};

Setting
=======
PS.component.link.setting = {};
PS.component.link.setting.position = {};

State
=====
PS.component.link.state = {};

Objects
=======
PS.component.link.objs = [];


Functions
=========
PS.component.link.func = {};

ANIMATE
    PS.component.link.func.animate_linksFadeIn = (unselectedLinkObjs)=>{
    PS.component.link.func.animate_linksFadeOut = (unselectedLinkObjs)=>{
    PS.component.link.func.animate_swoop = async(obj, direction)=>{

APPLY
    PS.component.link.func.apply_selectedStyle = async(linkObj)=>{
    PS.component.link.func.apply_view = async()=>{

CALCULATE
    PS.component.link.func.calculate_swoopPath = (obj, direction = null)=>{

FACTORY
    PS.component.link.func.factory = async(input)=>{

GET
    PS.component.link.func.get_associatedLinkObjs_fromCategoryName = (categoryName)=>{
    PS.component.link.func.get_obj_fromLinkName = (linkName)=>{
    PS.component.link.func.get_unselectedLinkObjs = (activeLinkObj)=>{

GIVE
    PS.component.link.func.give_categoryObjs_associatedLinks = ()=>{
    PS.component.link.func.give_component_urlState = (urlStateObj)=>{

INIT
    PS.component.link.func.init_component = ()=>{
    PS.component.link.func.init_stateAndView = async()=>{

SELECT
    PS.component.link.func.select_link = async(clicked)=>{

SERVE
    PS.component.link.func.serve_content = (linkObj)=>{
    PS.component.link.func.serve_frameAndButtons = (linkObj)=>{
    PS.component.link.func.serve_links = async(categoryObj, breakpoint = "desktop")=>{
    PS.component.link.func.serve_redirectLink = (linkObj)=>{

SET
    PS.component.link.func.set_positions = (obj)=>{

TRANSITION
    PS.component.link.func.transition_downAndOut = async()=>{
    PS.component.link.func.transition_fromCategoryToLink = async(linkObj)=>{
    PS.component.link.func.transition_fromLinkToCategory = async()=>{
    PS.component.link.func.transition_remove_content = ()=>{
    PS.component.link.func.transition_toSelected = async(activeLinkObj, otherLinkObjs)=>{
    PS.component.link.func.transition_toUnselected = async(activeLinkObj, otherLinkObjs)=>{

*/
