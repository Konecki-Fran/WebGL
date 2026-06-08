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

	var a_Position = gl.getAttribLocation(program, "a_Position");
	var u_FragColor = gl.getUniformLocation(program, "u_FragColor");
	gl.uniform4f(u_FragColor, 1, 1, 1, 1);

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



/*
	canvas.addEventListener("click", function(event) {
		gl.clear(gl.COLOR_BUFFER_BIT);	
		var rect = event.target.getBoundingClientRect();
		var w = rect.right - rect.left;
		var h = rect.right - rect.left;
		const x = (event.clientX - (w/2)) * 2 / w;
		const y = 2 * (-event.clientY + (h/2)) / h;

		points.push(new Point(x, y));
		colors.push(new Color());

		for (var i = 0; i < points.length; i++) {
			gl.vertexAttrib3f(a_Position, points[i].x, points[i].y, 0.0);
			gl.uniform4f(u_FragColor, colors[i].r, colors[i].g, colors[i].b, colors[i].a);
			gl.drawArrays(gl.POINTS, 0, 1);
		}
		
	});
*/		

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