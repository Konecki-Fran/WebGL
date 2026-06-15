/*****************************************/

const DEBUG = true;

var bw = 0;
var bh = 0;
var body = null;

/*****************************************/

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Color {
	constructor(r = Math.random(), g = Math.random(), b = Math.random(), a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

/*****************************************/

function main() {
	const canvas = getCanvasElement();
	const w = canvas.clientWidth;
	const h = canvas.clientHeight;

	updateSize();
	window.addEventListener("resize", updateSize);

	const gl = getWebGLContext(canvas);
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const vertexShader = document.getElementById('VertexShader').textContent;
	const fragmentShader = document.getElementById('FragmentShader').textContent;

	const program = gl.createProgram();
	addShader(gl, program, gl.VERTEX_SHADER, vertexShader);
	addShader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
	linkAndUseProgram(gl, program);

	const toRadMult = Math.PI/180.0;
	var angleDeg = 0;
	var angleRad = angleDeg * toRadMult;

	// Translation
	var Tx = 0;
	var Ty = 0;
	var Tz = 0;
	// Rotation
	var cosB = Math.cos(angleRad);
	var sinB = Math.sin(angleRad);
	// Scale 
	var Sx = 1;
	var Sy = 1;
	var Sz = 1;

	var xformMatrix = new Float32Array([
		cosB,  sinB, 0,  0,
		-sinB, cosB, 0,  0,
		0,     0,    1,  0,
		Tx,    Ty,   Tz, 1
	]);

	var a_Position = gl.getAttribLocation(program, "a_Position");
	var u_FragColor = gl.getUniformLocation(program, "u_FragColor");
	var u_xformMatrix = gl.getUniformLocation(program, "u_xformMatrix");

	gl.uniform4f(u_FragColor, 1, 1, 1, 1);
	gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

	var points = [];
	var colors = [];

	const vertexData = new Float32Array([
		 -0.5,  0.5,
		 -0.5, -0.5,
		  0.5,  0.5,
		  0.5, -0.5
	]);

	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		alert("Could not create buffer");
		return;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	gl.clear(gl.COLOR_BUFFER_BIT);	

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	
	var lastClick = [0, 0];
	canvas.addEventListener("click", function(event) {
		gl.clear(gl.COLOR_BUFFER_BIT);	

		// Translation
		Tx = Tx + 0.1;
		Ty = Ty + 0.1;
		Tz = 0;
		// Rotation
		angleDeg = angleDeg + 10;
		cosB = Math.cos(angleDeg * toRadMult);
		sinB = Math.sin(angleDeg * toRadMult);
		// Scale 
		Sx = Sx - 0.5;
		Sy = Sy - 0.5;
		Sz = 1;

		var xformMatrix = new Float32Array([
		cosB,  sinB, 0,  0,
		-sinB, cosB, 0,  0,
		0,     0,    1,  0,
		Tx,    Ty,   Tz, 1
	]);


		gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		
	});	
	

	console.log("Finished...")
}

/*****************************************/

function updateSize() {
	body = document.getElementsByTagName("body")[0];
	bw = body.clientWidth;
	bh = body.clientHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCanvasElement() {
	const canvas = document.getElementById("example");
	if (!canvas) {
		console.log("No canvas found")
		return;
	}
	return canvas;
}

function linkAndUseProgram(gl, program) {
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Could not link the program");
		return;
	}
	gl.useProgram(program);
}

function addShader(gl, program, type, src) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Could not compile shader:\n\n" + gl.getShaderInfoLog(shader))
		return;
	}
	gl.attachShader(program, shader);
	console.log("Compiled shader: " + type + " sucessfully");
}

function getWebGLContext(canvas) {
	const ctx = canvas.getContext('experimental-webgl');
	checkCtx(ctx);
	return ctx;
}

function blueRectangle2D(canvas) {
	const ctx = canvas.getContext('2d');
	checkCtx(ctx);
	ctx.fillStyle = 'rgba(0, 0, 255, 1.0)';
	ctx.fillRect(120, 10, 150, 150);
}

function checkCtx(ctx) {
	if (ctx === null & DEBUG) {
		alert("Unable to initialize webgl context");
	}
	return;
}