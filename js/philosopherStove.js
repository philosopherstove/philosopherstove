/*********************
PS (Philosopher Stove)
**********************/
const PS = {};


/*********
Components
**********/
PS.component = {};


/******
Setting
*******/
PS.setting = {};
PS.setting.mobileBreakpoint = 425;
PS.setting.screenMode       = null;
if(window.innerWidth > PS.setting.mobileBreakpoint){
	PS.setting.screenMode = "desktop";
}
else{
	PS.setting.screenMode = "mobile";
};


/********
Functions
*********/
PS.func = {};

PS.func.calculate_bezierCurves = (points)=>{ /* Expect control points in array in xy repeating pattern. Like so: [0.50, 0.10, 0.10, 0.90] */
	var coords = []; /* array to transfer passed pvt ratio points into */
	var pS     = [0, 0]; /* start pvt ratio point not included in points array */
	var pF     = [1, 1]; /* final pvt ratio point not included in points array */

	/* loop transfers all pvt ratio points into coords array, EACH AS ARRAY PACKS OF XY COORDS */
	for(var i = 0; i < points.length; i += 2){
		coords.push( [ points[i], points[i + 1] ] );
	};

	/* start and final pvt ratio point added into start and end of coords array */
	coords.unshift(pS);
	coords.push(pF);

	var numCoords = coords.length; /* number of coordinate pairs */

	var cnt         = {};
	    cnt.equ1    = numCoords - 1; /* Counts down every level. Determines number of equations at each interpolating level */
	    cnt.numLvls = numCoords - 1; /* number of interpolating levels there will be */
	    cnt.lvl     = 0; /* Counts up at end of every while loop after equation variables determined for that interpolating level */

	var equVar    = []; /* stores equation variables */
	var pvtRatios = []; /* stores progress vs time ratios */

	while(cnt.lvl < cnt.numLvls){

		for(var i = 0; i < cnt.equ1; i++){

			eval(`var l${cnt.lvl}x${[i]} = null;`);
			eval(`var l${cnt.lvl}y${[i]} = null;`);

			equVar.push( [`l${cnt.lvl}x${[i]}`,`l${cnt.lvl}y${[i]}`] );
		};

		cnt.lvl ++;
		cnt.equ1 --;
	};

	function firstLevelCalc(i){

		/* A counter incremented inside a for-loop should not be used in it's initiation counting.
		 * If you're going to do so, then clone it before the for loop and use the clone number in the initiation of the loop. */
		var start = cnt.equVarIndex;

		for(var j = start; j < start + cnt.numEqu2; j++){

			equVar[j][0] = i * (coords[j + 1][0] - coords[j][0]) + coords[j][0];
			equVar[j][1] = i * (coords[j + 1][1] - coords[j][1]) + coords[j][1];

			cnt.equVarIndex ++;
		};

		cnt.numEqu2 --;
	};

	function restLevelCalc(i){

		while(cnt.equVarIndex < equVar.length){

			var start = cnt.equVarIndex;

			for(var j = start; j < (start + cnt.numEqu2); j++){

		    	equVar[j][0] = i * (equVar[cnt.equVarPrevIndex + 1][0] - equVar[cnt.equVarPrevIndex][0]) + equVar[cnt.equVarPrevIndex][0];
		    	equVar[j][1] = i * (equVar[cnt.equVarPrevIndex + 1][1] - equVar[cnt.equVarPrevIndex][1]) + equVar[cnt.equVarPrevIndex][1];

		    	cnt.equVarIndex ++;
		    	cnt.equVarPrevIndex ++;
		  	};

		  	cnt.numEqu2 --;
		  	cnt.equVarPrevIndex ++; /* Needs to step up after every level of interpolating equations */
		};
	};

    for(var i = 0; i <= 1; i += 0.0001){

		c = (i * 10000)/10000;

		cnt.equVarIndex     = 0;
		cnt.equVarPrevIndex = 0;
		cnt.numEqu2         = numCoords - 1;

		firstLevelCalc(c);
		restLevelCalc(c);

		pvtRatios.push( [ equVar[equVar.length - 1][0], equVar[equVar.length - 1][1] ] );
	};
	pvtRatios.push( [1, 1] ); /* ensure get all the way to [1, 1] */

	return pvtRatios;
};


PS.func.get_urlStateObj = ()=>{
	return new Promise((resolve)=>{
		let searchURL = window.location.search;
		let params;
		if( searchURL.length > 0){
			let dropQuestionMark = searchURL.split("?")[1];
			let separatePieces   = dropQuestionMark.split("&");
			let decoded		     = separatePieces.map((x)=>{return decodeURIComponent(x)});
			params               = decoded;
		};
		if(params === undefined){
			resolve(false);
		};
		let stateObj = {};
		for(i in params){
			let paramString = params[i];
			let name  = paramString.split("=")[0];
			let value = paramString.split("=")[1];
			stateObj[name] = value;
			if(Number(i) === params.length - 1){
				resolve(stateObj);
			};
		};
	});
};


PS.func.give_template_dark = (templateObj)=>{
	return new Promise((resolve, reject)=>{
        templateObj.bodyClass       = "backgroundColor_blackBlue_1";
        templateObj.homeSrc         = "img/stoveIcon_white_1.svg";
        templateObj.toggleBodyClass = "toggle_on";
        templateObj.toggleBallClass = "toggle_on";
        templateObj.divideLineClass = "backgroundColor_white_1";
        resolve(templateObj);
	});
};


PS.func.give_template_light = (templateObj)=>{
	return new Promise((resolve, reject)=>{
        templateObj.bodyClass       = "backgroundColor_white_1";
        templateObj.homeSrc         = "img/stoveIcon_blackBlue_1.svg";
        templateObj.toggleBodyClass = "toggle_off";
        templateObj.toggleBallClass = "toggle_off";
        templateObj.divideLineClass = "backgroundColor_blackBlue_1";
        resolve(templateObj);
    });
};


PS.func.set_history = ()=>{
	let categoryState = PS.component.category.state.selected[0];
	let linkState     = PS.component.link.state.selected[0];

	// > create urlStateObj
	let obj = {};
	// >> category
	if(categoryState === true){
		let categoryName = PS.component.category.state.selected[1].setting.name;
		obj.category = [categoryState, categoryName];
	}
	else{
		obj.category = [categoryState, null];
	};
	// >> link
	if(linkState === true){
		let linkName = PS.component.link.state.selected[1].setting.name;
		obj.link = [linkState, PS.component.link.state.selected[1].setting.name];
	}
	else{
		obj.link = [linkState, null];
	};

	// > create url path
	let url = "";
	// >> Case 1 - link selected
	if(linkState === true){
		let categoryName = obj.category[1];
		let linkName     = obj.link[1];
		url = `/?category=${categoryName}&link=${linkName}`;
	}
	// >> Case 2 - category selected
	else
	if(categoryState === true){
		let categoryName = obj.category[1];
		url = `/?category=${categoryName}`;
	}
	// >> Case 3 - at home (category not selected)
	else if(categoryState === false){
		url = "/";
	};

	// > history pushState
	window.history.pushState(obj, "Philosopher Stove", url);
};


PS.func.test_isWithin = (coords, elem)=>{
	if(elem === null){return;};
	
	let x = coords[0];
	let y = coords[1];

	let elem_left   = elem.getBoundingClientRect().left;
	let elem_right  = elem.getBoundingClientRect().right;
	let elem_top    = elem.getBoundingClientRect().top;
	let elem_bottom = elem.getBoundingClientRect().bottom;

	if(x > elem_left
	&& x < elem_right
	&& y > elem_top
	&& y < elem_bottom){
		return true;
	}
	else{
		return false;
	};
};


PS.func.toggle_state = (componentName, stateName, componentObject)=>{
	if(componentObject.state[stateName] === false){
		// object state (must be first)
		componentObject.state[stateName] = true;
		// component state
		PS.component[componentName].state[stateName] = [true, componentObject];
	}
	else
	if(componentObject.state[stateName] === true){
		// object state (must be first)
		componentObject.state[stateName] = false;
		// component state
		PS.component[componentName].state[stateName] = [false, null];
	};
};


/*
=================
Table of Contents
=================

======================
PS (Philosopher Stove)
======================
const PS = {};

==========
Components
==========
PS.component = {};

=======
Setting
=======
PS.setting = {};
PS.setting.mobileBreakpoint = 425;

=========
Functions
=========
PS.func = {};

CALCULATE
	PS.func.calculate_bezierCurves = (points)=>{

GET
	PS.func.get_urlStateObj = ()=>{

GIVE
	PS.func.give_template_dark = (templateObj)=>{
	PS.func.give_template_light = (templateObj)=>{

SET
	PS.func.set_history = ()=>{

TOGGLE
	PS.func.toggle_state = (componentName, stateName, componentObject)=>{

*/
