/********
Component
*********/
PS.component.category = {};


/*******
Settings
********/
PS.component.category.setting = {};
PS.component.category.setting.position = {};
PS.component.category.setting.position.x_default  = 0;
PS.component.category.setting.position.x_selected = 63
PS.component.category.setting.position.y_selected_desktop = -48; if(navigator.platform.includes("Win")){PS.component.category.setting.position.y_selected_desktop = -52;}; // smooths over the category selected position being slightly off on windows machines
PS.component.category.setting.position.y_selected_mobile  = -40;
PS.component.category.setting.timingControlPoints = [0.20, 0.70, 0.70, 0.20];
PS.component.category.setting.timingRatios        = [];


/****
State
*****/
PS.component.category.state = {};
PS.component.category.state.selected  = [false, null];
PS.component.category.state.animating = [false, null];


/******
Objects
*******/
PS.component.category.objs = [];


/********
Functions
*********/
PS.component.category.func = {};

/******
ANIMATE
*******/
PS.component.category.func.animate_categoriesFadeIn = (otherCategoryObjs)=>{
	return new Promise((resolve, reject)=>{
		for(i in otherCategoryObjs){
			let obj = otherCategoryObjs[i];
			obj.element.classList.add("fadeIn_category");
			obj.element.classList.remove("fadeOut_category");
			obj.element.classList.remove("displayNone");
			if(Number(i) === otherCategoryObjs.length - 1){
				resolve();
			};
		};
	});
};


PS.component.category.func.animate_categoriesFadeOut = (otherCategoryObjs)=>{
	return new Promise((resolve, reject)=>{
		for(i in otherCategoryObjs){
			let obj = otherCategoryObjs[i];
			obj.element.classList.add("fadeOut_category");
			obj.element.classList.remove("fadeIn_category");
			let afterFadeOutFinishes = setTimeout(()=>{
				obj.element.classList.add("displayNone");
			},160);
			if(Number(i) === otherCategoryObjs.length - 1){
				resolve();
			};
		};
	});
};


PS.component.category.func.animate_swoop = (obj, direction)=>{
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

				for(let i = 0; i < PS.component.category.setting.timingRatios.length; i++){

					if(PS.component.category.setting.timingRatios[i][1] > tRatio){ /* passed current tRatio in pvtRatios array */
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
/* once positions set for obj/component, apply position to element. Conditional on whether category is selected or not */
PS.component.category.func.apply_position = (obj)=>{
	if(obj.state.selected === false){
		obj.element.style.left = `${obj.setting.position.default[0]}px`;
		obj.element.style.top  = `${obj.setting.position.default[1]}px`;
	}
	else{
		obj.element.style.left = `${obj.setting.position.selected[0]}px`;
		obj.element.style.top  = `${obj.setting.position.selected[1]}px`;
	};
};


PS.component.category.func.apply_style = ()=>{
	if(PS.component.category.state.selected[0] === false){ // put transition classes on them
		for(i in PS.component.category.objs){
			let obj = PS.component.category.objs[i];
				obj.element.classList.add(`upAndIn_navCat_${Number(i)+1}`);
		};
	}
	else{ // put displayNone class on the categories that are not the selected one
		for(obj of PS.component.category.objs){
			if(obj.setting.name !== PS.component.category.state.selected[1].setting.name){
				obj.element.classList.add('displayNone');
			};
		};
	};
};


PS.component.category.func.apply_view = ()=>{
	return new Promise((resolve)=>{
		for(i in PS.component.category.objs){
			let obj = PS.component.category.objs[i];
			PS.component.category.func.set_positions_differentByViewport(obj); // set position for each
			PS.component.category.func.apply_position(obj); // apply position to each
			if(Number(i) === PS.component.category.objs.length - 1){ // end of loop
				PS.component.category.func.apply_style(); // apply to all
				resolve();
			};
		};
	});
};


/********
CALCULATE
*********/
PS.component.category.func.calculate_swoopPath = (direction = null)=>{

	for(let i = 0; i < PS.component.category.objs.length; i++){

		let obj = PS.component.category.objs[i];

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
				};
			};
		};
	};
};


/******
FACTORY
*******/
PS.component.category.func.factory = async(input)=>{
	return new Promise((resolve, reject)=>{
		for(let i = 0; i < input.length; i++){
			let obj = PS.component.category.input[i];
				obj.associated = {};
				obj.element = document.querySelector(`#navCategories_PS > li:nth-of-type(${i+1})`);
				obj.element.children[0].innerHTML = obj.setting.name;
				obj.element.setAttribute("style",`color:var(--${obj.setting.color})`);
				obj.element.addEventListener('click', ()=>{PS.component.category.func.select_category(obj)});
				obj.state = {};
				obj.state.animating = false;
				obj.state.selected = false;
			PS.component.category.objs.push(obj);
			if(i === input.length -1){
				resolve();
			};
		};
	});
};


/**
GET
***/
PS.component.category.func.get_unselectedCategoryObjs = (selectedCategoryObj)=>{
	return new Promise((resolve, reject)=>{
		let unselectedCategoryObjs = [];
		for(i in PS.component.category.objs){
			let obj = PS.component.category.objs[i];
			if(obj.setting.name !== selectedCategoryObj.setting.name){ // exclude selectedCategoryObj
				unselectedCategoryObjs.push(obj);
			};
			if(Number(i) === PS.component.category.objs.length - 1){
				resolve(unselectedCategoryObjs);
			};
		};
	});
};


/***
GIVE
****/
PS.component.category.func.give_component_urlState = (urlStateObj)=>{
	return new Promise((resolve)=>{
        for(i in PS.component.category.objs){ // go through objs that effects component state
            let obj = PS.component.category.objs[i];
            if(urlStateObj.category === obj.setting.name){ // if match with urlState
                PS.func.toggle_state("category", "selected", obj); // toggle obj & comp state
                resolve();
                break;
            };
            if(Number(i) === PS.component.category.objs.length - 1){
                resolve();
            };
        };
    });
};


/***
INIT
****/
PS.component.category.func.init_component = ()=>{
	PS.component.category.func.factory(PS.component.category.input)
	.then(async()=>{
		await PS.component.category.func.init_stateAndView();
		PS.component.category.func.calculate_swoopPath("forward");
		PS.component.category.func.calculate_swoopPath("reverse");
	});
	// process timingControlPoints into timingRatios
	PS.component.category.setting.timingRatios = PS.func.calculate_bezierCurves(PS.component.category.setting.timingControlPoints);
};

PS.component.category.func.init_stateAndView = ()=>{
	return new Promise(async(resolve)=>{ // Pattern: (1) get_urlState (2) give_component_urlState (3) set view
		await PS.component.category.func.give_component_urlState(await PS.func.get_urlStateObj());
		await PS.component.category.func.apply_view();
		resolve();
	});
};


/*****
SELECT
******/
PS.component.category.func.select_category = async(categoryObj)=>{
	// Case 1 - link selected => transition to category
	if(PS.component.link.state.selected[0] === true){
		PS.component.link.func.transition_fromLinkToCategory();
	}
	// Case 2 - category selected => transition to home
	else
	if(categoryObj.state.selected === true){
		PS.component.category.func.transition_fromCategoryToHome();
	}
	// Case 3 - at home => transition to category
	else
	if(categoryObj.state.selected === false){
		PS.component.category.func.transition_fromHomeToCategory(categoryObj);
	};
};


/**
SET
***/
/* Different viewport(widthBreakpoint) sets different positions for obj/component/element */
PS.component.category.func.set_positions_differentByViewport = (obj)=>{
	return new Promise(async(resolve)=>{
		let widthBreakpoint = 425;
		if(window.innerWidth <= widthBreakpoint){
			obj.setting.position.default  = [PS.component.category.setting.position.x_default, obj.setting.position.y_default_mobile];
			obj.setting.position.selected = [PS.component.category.setting.position.x_selected, PS.component.category.setting.position.y_selected_mobile];
		}
		else{
			obj.setting.position.default  = [PS.component.category.setting.position.x_default, obj.setting.position.y_default_desktop];
			obj.setting.position.selected = [PS.component.category.setting.position.x_selected, PS.component.category.setting.position.y_selected_desktop];
		};
		resolve();
	});
};


/*********
TRANSITION
**********/
PS.component.category.func.transition_categorySelected = (clickedCategoryObj, otherCategoryObjs)=>{
	return new Promise(async(resolve, reject)=>{
		// animate - CLICKED CATEGORY (swoop 0.32s)
		PS.component.category.func.animate_swoop(clickedCategoryObj, "forward")
		.then(()=>{
			resolve();
		});
		// animate - OTHER CATEGORIES (fadeOut)
		PS.component.category.func.animate_categoriesFadeOut(otherCategoryObjs);
	});
};


PS.component.category.func.transition_categoryUnselected = (clickedCategoryObj, otherCategoryObjs)=>{
	return new Promise(async(resolve, reject)=>{
		// animate - CLICKED CATEGORY (swoop 0.32s)
		PS.component.category.func.animate_swoop(clickedCategoryObj, "reverse")
		.then(()=>{
			resolve();
		});
		let delay_halfSwoop = setTimeout(()=>{ // 0.16s delay + 0.16s fadeIn time means swoop and fadeIn finish at same time
			// animate - OTHER CATEGORIES (fadeIn)
			PS.component.category.func.animate_categoriesFadeIn(otherCategoryObjs);
		},160);
	});
};


PS.component.category.func.transition_fromCategoryToHome = async()=>{
	// RETURN - if category is animating
	if(PS.component.category.state.animating[0] === true){return;};
	let categoryObj = PS.component.category.state.selected[1];
	// state - CATEGORY (animating ON)
	PS.func.toggle_state("category", "animating", categoryObj);
	// transition - PORTRAIT (color change for home)
	let localStorageObj = JSON.parse(window.localStorage.getItem("PS"));
	let colorMode       = localStorageObj.colorMode;
	if(colorMode === "light"){PS.component.portrait.func.transition_colorFade("blackBlue_1");}
	else if(colorMode === "dark"){PS.component.portrait.func.transition_colorFade("white_1");};
	// transition - ALL LINKS (downAndOut)
	await PS.component.link.func.transition_downAndOut();
	// transition - CATEGORY (toUnselected)
	let unselectedCategoryObjs = await PS.component.category.func.get_unselectedCategoryObjs(categoryObj); // GET - unselectedCategoryObjs
	await PS.component.category.func.transition_categoryUnselected(categoryObj, unselectedCategoryObjs);
	// state - CATEGORY (selected OFF, animating OFF)
	PS.func.toggle_state("category", "selected", categoryObj);
	PS.func.toggle_state("category", "animating", categoryObj);
	// set - HISTORY
	PS.func.set_history();
};


PS.component.category.func.transition_fromHomeToCategory = async(categoryObj)=>{
	// RETURN - if category is animating
	if(PS.component.category.state.animating[0] === true){return;}
	// state - CATEGORY (animating ON)
	PS.func.toggle_state("category", "animating", categoryObj);
	// transition - PORTRAIT (color change for category)
	let categoryColor = categoryObj.setting.color;
	PS.component.portrait.func.transition_colorFade(categoryColor);
	// transition - CATEGORY (toSelected)
	let unselectedCategoryObjs = await PS.component.category.func.get_unselectedCategoryObjs(categoryObj); // GET - unselectedCategoryObjs
	await PS.component.category.func.transition_categorySelected(categoryObj, unselectedCategoryObjs);
	// serve - LINKS
	PS.component.link.func.serve_links(categoryObj);
	// state - CATEGORY (selected ON, animating OFF)
	PS.func.toggle_state("category", "selected", categoryObj);
	PS.func.toggle_state("category", "animating", categoryObj);
	// set - HISTORY
	PS.func.set_history();
};



/*

TABLE OF CONTENTS

Component
=========
PS.component.category = {};

Setting
=======
PS.component.category.setting = {};
PS.component.category.setting.position = {};

State
=====
PS.component.category.state = {};

Objects
=======
PS.component.category.objs = [];


Functions
=========
PS.component.category.func = {};

ANIMATE
	PS.component.category.func.animate_categoriesFadeIn = (otherCategoryObjs)=>{
	PS.component.category.func.animate_categoriesFadeOut = (otherCategoryObjs)=>{
	PS.component.category.func.animate_swoop = (obj, direction)=>{

APPLY
	PS.component.category.func.apply_position = (obj)=>{
	PS.component.category.func.apply_style = ()=>{
	PS.component.category.func.apply_view = ()=>{

CALCULATE
	PS.component.category.func.calculate_swoopPath = (direction = null)=>{

FACTORY
	PS.component.category.func.factory = async(input)=>{

GET
	PS.component.category.func.get_unselectedCategoryObjs = (selectedCategoryObj)=>{

GIVE
	PS.component.category.func.give_component_urlState = (urlStateObj)=>{

INIT
	PS.component.category.func.init_component = ()=>{
	PS.component.category.func.init_stateAndView = ()=>{

SELECT
	PS.component.category.func.select_category = async(categoryObj)=>{

SET
	PS.component.category.func.set_positions_differentByViewport = (obj)=>{

TRANSITION
	PS.component.category.func.transition_categorySelected = (clickedCategoryObj, otherCategoryObjs)=>{
	PS.component.category.func.transition_categoryUnselected = (clickedCategoryObj, otherCategoryObjs)=>{
	PS.component.category.func.transition_fromCategoryToHome = async()=>{
	PS.component.category.func.transition_fromHomeToCategory = async(categoryObj)=>{

*/
