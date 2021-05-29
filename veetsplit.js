/* Copyright (c) 2016 Reinoud Veenhof
Adapted after and inspired by split.js by Nathan Cahill Copyright (c) 2015
*/

'use strict';

//{ Define namespace and module globals

var veet = veet || {};
veet.split = veet.split || {};
veet.split.module = "veet split panels";
veet.split.version = veet.version+".1";

var splitter = null;

//}

//{ Publics

veet.split.setSplit = function(elmId, options) {
	// get the splitter by Id
	splitter = document.getElementById(elmId);
	if (!splitter) {
		console.log("Error: could not get splitter element id="+elmId+"... Ignoring rest of function...");
		return;
	}
	
	// init, process and apply user supplied options
	parseOptions(splitter, options);
	applyOptions(splitter);
	
	// check if it is a fixed splitter
	if (splitter.options.isFixed === false) {
		// only install the mousedown handler for a moveable splitter
		splitter.addEventListener('mousedown', veetsplitterMouseDown, false);
	}
	
}

veet.split.logOptions = function(elmId) {
	var splt = document.getElementById(elmId);
	console.log("Veet splitter settings and options:");
	console.log("splitter Id   = "+splt.id);
	console.log("parent Id?    = "+splt.parentElement.id);
	console.log("orientation   = "+splt.options.orientation);
	console.log("panel1 Id     = "+splt.options.panel1.id);
	console.log("panel2 Id     = "+splt.options.panel2.id);
	console.log("splitterSize  = "+splt.options.splitterSize+"px");
	console.log("startPosition = "+splt.options.startPosition+"%");
	console.log("isFixed       = "+splt.options.isFixed);
	console.log("minSize       = "+splt.options.minSize+"%");
	console.log("minSizePanel1 = "+splt.options.minSizePanel1+"%");
	console.log("minSizePanel2 = "+splt.options.minSizePanel2+"%");
	console.log("fixedPanel2   = "+splt.options.fixedPanel2);
	console.log("split container dimensions:");
	console.log("	left="+splt.options.parentRect.left+
				"	top="+splt.options.parentRect.top+
				"	right="+splt.options.parentRect.right+
				"	bottom="+splt.options.parentRect.bottom+
				"\n	width="+splt.options.parentRect.width+
				"	height="+splt.options.parentRect.height);
}

//}

//{ Options

function parseOptions(splt, useropt) {
	if (!splt.options) splt.options = {};
	
	// get the parent of the splitter by Class
	var parent = splt.parentElement;
	
	// set some key props
	// get parent splitpanel container dims
	splt.options.parentRect = parent.getBoundingClientRect();
	if (splt.classList.contains("row")) {
		splt.options.orientation = 'horizontal';
		splt.options.panel1 = parent.getElementsByClassName("toppanel")[0];
		splt.options.panel2 = parent.getElementsByClassName("bottompanel")[0];
	}
	else {
		//default = vertical
		splt.options.orientation = 'vertical';
		splt.options.panel1 = parent.getElementsByClassName("leftpanel")[0];
		splt.options.panel2 = parent.getElementsByClassName("rightpanel")[0];
	}
	
	// set the defaults
	splt.options.splitterSize = 5;
	splt.options.startPosition = 25; // in %
	
	splt.options.minSize = 10; // in %
	splt.options.minSizePanel1 = splt.options.minSize; // in %
	splt.options.minSizePanel2 = splt.options.minSize; // in %
	
	splt.options.isFixed = false;
	splt.options.fixedPanel2 = false;
	
	// parse the user specs
	if (useropt) {
		if (useropt.splitterSize) { splt.options.splitterSize = Math.min(Math.max(useropt.splitterSize,3),100); }
		if (useropt.startPosition) { splt.options.startPosition = Math.min(Math.max(useropt.startPosition,0),100); }
		
		if (useropt.minSize) { splt.options.minSize = Math.min(Math.max(useropt.minSize,0),100); }
		if (useropt.minSizePanel1) { splt.options.minSizePanel1 = Math.min(Math.max(useropt.minSizePanel1,0),100); }
		if (useropt.minSizePanel2) { splt.options.minSizePanel2 = Math.min(Math.max(useropt.minSizePanel2,0),100); }
		
		if (useropt.isFixed === true) { splt.options.isFixed = true; }
		if (useropt.fixedPanel2 === true) { splt.options.fixedPanel2 = true; }
	}
}

function applyOptions(splt) {
	var pos = Math.min(Math.max(splt.options.startPosition,0),100);
	var min1 = Math.min(Math.max(splt.options.minSizePanel1,0),100);
	var min2 = Math.min(Math.max(splt.options.minSizePanel2,0),100);
	
	if (pos < min1) {
		pos = min1
	}
	else if (pos > (100-min2)) {
		pos = (100-min2)
	}
	
	if (splt.options.orientation === 'horizontal') {
		splt.style.height = splt.options.splitterSize+"px";
		
		splt.options.panel1.style.minHeight = (splt.options.parentRect.height*min1/100)+"px";
		splt.options.panel2.style.minHeight = (splt.options.parentRect.height*min2/100)+"px";
		
		splt.options.panel1.style.height = (splt.options.parentRect.height*pos/100)+"px";
		splt.style.top = (splt.options.parentRect.height*pos/100)+"px";
	}
	else {
		//default = vertical
		splt.style.width = splt.options.splitterSize+"px";
		
		splt.options.panel1.style.minWidth = (splt.options.parentRect.width*min1/100)+"px";
		splt.options.panel2.style.minWidth = (splt.options.parentRect.width*min2/100)+"px";
		
		splt.options.panel1.style.width = (splt.options.parentRect.width*pos/100)+"px";
		splt.style.left = (splt.options.parentRect.width*pos/100)+"px";
	}
	
	// check if it is a fixed splitter
	if (splt.options.isFixed === true) {
		splt.style.cursor = "default";
		splt.style.backgroundImage = "none";
	}
	
	// check if panel2 is the fixed sized panel when resizing the window
	// Note: panel1 fixedsize when resizing is the default
	if (splitter.options.fixedPanel2 === true) {
		var ps = Math.min(Math.max(splitter.options.startPosition,0),100);
		var sz = splitter.options.splitterSize
		var pw = splitter.options.parentRect.width
		var ph = splitter.options.parentRect.height
		var psx = pw*ps/100;
		var psy = ph*ps/100;
	
		if (splitter.options.orientation === 'horizontal') {
			/*
			console.log("prect height="+ph+"px");
			console.log("pos of "+splitter.id+"="+ps+"%="+psy+"px");
			console.log("pos of "+splitter.id+"="+ps+"%="+(splitter.options.parentRect.height*ps/100)+"px size="+sz+"px panel2 should be "+(ph-psy-sz)+"px high");
			*/
			splitter.options.panel2.style.height = (ph-psy-sz)+"px";
			splitter.options.panel1.style.height = null;
		}
		else {
			/*
			console.log("prect width="+pw+"px");
			console.log("pos of "+splitter.id+"="+ps+"%="+psx+"px");
			console.log("pos of "+splitter.id+"="+ps+"%="+(splitter.options.parentRect.width*ps/100)+"px size="+sz+"px panel2 should be "+(pw-psx-sz)+"px wide");
			*/
			splitter.options.panel2.style.width = (pw-psx-sz)+"px";
			splitter.options.panel1.style.width = null;
		}
		
		// swap the flex style of the panels
		splitter.options.panel1.style["-webkit-box-flex"] = '1';
		splitter.options.panel1.style["-ms-flex"] = '1 1 auto';
		splitter.options.panel1.style.flex =  '1 1 auto';
		
		splitter.options.panel2.style["-webkit-box-flex"] = '0';
		splitter.options.panel2.style["-ms-flex"] = '0 0 auto';
		splitter.options.panel2.style.flex =  '0 0 auto';
	}
	
}

//}

//{ Mouse Handlers

function veetsplitterMouseDown(e) {
	e.preventDefault();
	
	// install the mousup event canceller to the window
	//console.log("installing mouseup window listener...")
	window.addEventListener('mouseup', veetsplitterMouseUp, false);
	
	
	// get the splitter and parent splitpanel container
	splitter = e.target;
	splitter.options.parentRect = splitter.parentElement.getBoundingClientRect();
	splitter.options.anchorX = e.clientX;
	splitter.options.anchorY = e.clientY;
	
/* 	
	console.log("splitter "+splitter.id+" properties:"+
		"\norientation="+splitter.options.orientation+" splitter size="+splitter.options.splitterSize+" min size="+splitter.options.minSize+
		"\nparent id="+splitter.parentElement.id+" dims:"+
		"\n	left="+splitter.options.parentRect.left+
		"\n	top="+splitter.options.parentRect.top+
		"\n	right="+splitter.options.parentRect.right+
		"\n	bottom="+splitter.options.parentRect.bottom+
		"\n	width="+splitter.options.parentRect.width+
		"\n	height="+splitter.options.parentRect.height+
		"\npanel1 id="+splitter.options.panel1.id+" panel2 id="+splitter.options.panel2.id);
 */	
	
	window.addEventListener('mousemove', veetsplitterMouseMove, true);
}

function veetsplitterMouseMove(e) {
	e.preventDefault();
	var spz = splitter.options.splitterSize;
	var pr = splitter.options.parentRect;
	
	if (splitter.options.orientation === 'horizontal') {
		var minpos1 = parseFloat(splitter.options.panel1.style.minHeight);
		var minpos2 = (pr.height-parseFloat(splitter.options.panel2.style.minHeight)-spz);
		var yoffs = (e.clientY-pr.top-(spz/2));
		
		yoffs = Math.min(Math.max(yoffs,minpos1),minpos2);
		splitter.style.top = yoffs+'px';
		if (splitter.options.fixedPanel2 === true) {
			splitter.options.panel2.style.height = (pr.height-yoffs-spz)+'px';
		}
		else {
			splitter.options.panel1.style.height = yoffs+'px';
		}
	}
	else {  // vertical is the default
		var minpos1 = parseFloat(splitter.options.panel1.style.minWidth);
		var minpos2 = (pr.width-parseFloat(splitter.options.panel2.style.minWidth)-spz);
		var xoffs = (e.clientX-pr.left-(spz/2));
		
		xoffs = Math.min(Math.max(xoffs,minpos1),minpos2);
		splitter.style.left = xoffs+'px';
		if (splitter.options.fixedPanel2 === true) {
			splitter.options.panel2.style.width = (pr.width-xoffs-spz)+'px';
		}
		else {
			splitter.options.panel1.style.width = xoffs+'px';
		}
	}
}

function veetsplitterMouseUp(e) {
	//console.log("removing both mMove and mUp listeners...")
	window.removeEventListener('mousemove', veetsplitterMouseMove, true);
	//and remove this handler self from the window
	window.removeEventListener('mouseup', veetsplitterMouseUp, true);
}

//}
