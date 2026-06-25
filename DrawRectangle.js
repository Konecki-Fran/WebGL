/*****************************************/

function main() {
	canvas = getCanvasElement();
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
	var a_Color = gl.getAttribLocation(program, "a_Color");

	//var u_FragColor = gl.getUniformLocation(program, "u_FragColor");
	var u_xformMatrix = gl.getUniformLocation(program, "u_xformMatrix");

	//gl.uniform4f(u_FragColor, 1, 1, 1, 1);

	var vertexData = new Float32Array([
		 -0.5,  0.5, 0.5, 1.0, 0.2, 0.4, 0.6,
		 -0.5, -0.5, 0.5, 0.2, 1.0, 0.6, 0.8,
		  0.5,  0.5, 0.5, 0.4, 0.6, 1.0, 1.0,
		  0.5, -0.5, 0.5, 1.0, 1.0, 1.0, 0.2,

		  0.5,  0.5, -0.5, 1.0, 0.5, 0.4, 0.6,
		  0.5, -0.5, -0.5, 1.0, 0.5, 0.6, 0.8,
		 -0.5,  0.5, -0.5, 0.4, 0.5, 1.0, 1.0,
		 -0.5, -0.5, -0.5, 0.6, 0.5, 1.0, 0.2,
	]);

	var indexData = new Float32Array([
		0, 1, 2, 3,
		4, 5, 6, 7
	]);

	const elementSize = vertexData.BYTES_PER_ELEMENT;
	const stride = (3 + 4) * elementSize;

	var vertexBuffer = gl.createBuffer();
	var indexBuffer = gl.createBuffer();

	if (! (vertexBuffer && indexBuffer)) {
		alert("Could not create buffers");
		return;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(a_Position);

	gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, 3 * elementSize);
	gl.enableVertexAttribArray(a_Color);

	gl.clear(gl.COLOR_BUFFER_BIT);	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 8);

	var i = 0;
	var tx = 0;
	var ty = 0;
	var s = 1;

	canvas.addEventListener("click", function(event) {
		g_isPaused = !g_isPaused;
	});	

	document.addEventListener("keydown", (event) => {
	  switch (event.key) {
	    case "ArrowDown":
	      ty -= .02;
	      break;
	    case "ArrowUp":
	      ty += .02;
	      break;
	    case "ArrowLeft":
	      tx -= .02;
	      break;
	    case "ArrowRight":
	      tx += .02;
	      break;
	    case "1":
	    case "2":
	    case "3":
	    case "4":
	    case "5":
	      s = parseInt(event.key) * 0.33;
	      break;
	  }
	});

	document.getElementById("objFile").addEventListener("change", async (e) => {
	    const file = e.target.files[0];
	    const vertices = await readObj(file);
	    console.log(vertices);
	    vertexData = vertices;
	    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

	});

	var tick = function() {
		if (g_isPaused) {
			requestAnimationFrame(tick);
			return;
		}

		i += .01;
		gl.clear(gl.COLOR_BUFFER_BIT);	

		const T = createTranslation(tx, ty, 0);
		const R = createRotationXYZ(0, 45*i, 0); 
		const S = createScale(s, s, 1); 

		var xformMatrix = createTransformation({T : T, R : R, S : S});
		xformMatrix = multiplyScalar(xformMatrix, i);

		gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 8);

		requestAnimationFrame(tick);
	}
	tick();

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

/*****************************************/














