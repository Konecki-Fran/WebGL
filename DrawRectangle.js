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

function copy(o) {
	return Object.assign({}, o);
}

/*****************************************/

function main() {
	const canvas = getCanvasElement();
	const gl = getWebGLContext(canvas);

	// Initial Viewport and resize attachment
	updateSize(gl, canvas);
	window.addEventListener("resize", () => updateSize(gl, canvas));

	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const vertexShader = document.getElementById('VertexShader').textContent;
	const fragmentShader = document.getElementById('FragmentShader').textContent;

	const program = gl.createProgram();
	addShader(gl, program, gl.VERTEX_SHADER, vertexShader);
	addShader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
	linkAndUseProgram(gl, program);

	var a_Position = gl.getAttribLocation(program, "a_Position");
	var u_FragColor = gl.getUniformLocation(program, "u_FragColor");
	var u_xformMatrix = gl.getUniformLocation(program, "u_xformMatrix");

	gl.uniform4f(u_FragColor, 1, 1, 1, 1);

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

	var i = 0;
	canvas.addEventListener("click", function(event) {
		i += .1;
		gl.clear(gl.COLOR_BUFFER_BIT);	

		const T = createTranslation(0.2*i, 0.2*i, 0);
		const R = createRotationXYZ(0, 0, 45*i); 
		const S = createScale(0.5*i, 0.5*i, 1); 

		var xformMatrix = createTransformation({T : T, R : R, S : S});
		xformMatrix = multiplyScalar(xformMatrix, i);

		gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	});	

	console.log("Finished...")
}

/*****************************************/

function updateSize(gl, canvas) {
	body = document.getElementsByTagName("body")[0];
	bw = body.clientWidth;
	bh = body.clientHeight;
	
	if (canvas && gl) {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
}

/*****************************************/

function updateSize(gl, canvas) {
	body = document.getElementsByTagName("body")[0];
	bw = body.clientWidth;
	bh = body.clientHeight;
	
	if (canvas && gl) {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
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
