window.addEventListener('DOMContentLoaded', ()=>{
	PS.component.category.func.init_component();
	PS.component.link.func.init_component();
	let delayDrawPortrait = setTimeout(()=>{
		PS.component.portrait.func.init_component();
	},500);
});


/* Back and forward button => refresh on new URL */
window.addEventListener("popstate", ()=>{
	window.location.href = window.location.href;
});


/* An initial screenMode is set in philosopherStove.js
   Resize tests for change, reloads on change */
window.addEventListener('resize', ()=>{
	let currScreenMode;
	if(window.innerWidth > PS.setting.mobileBreakpoint){
		currScreenMode = "desktop";
	}
	else{
		currScreenMode = "mobile";
	}
	if(currScreenMode !== PS.setting.screenMode){
		location.reload();
	};
});
