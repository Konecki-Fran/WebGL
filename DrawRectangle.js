/*****************************************/

function main() {
  canvas = getCanvasElement();
  const gl = getWebGLContext(canvas);

  updateSize(gl, canvas);
  window.addEventListener("resize", () => updateSize(gl, canvas));

  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vertexShader = document.getElementById("VertexShader").textContent;
  const fragmentShader = document.getElementById("FragmentShader").textContent;

  const program = gl.createProgram();
  addShader(gl, program, gl.VERTEX_SHADER, vertexShader);
  addShader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
  linkAndUseProgram(gl, program);

  var a_Position = gl.getAttribLocation(program, "a_Position");
  var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");

  var u_xformMatrix = gl.getUniformLocation(program, "u_xformMatrix");

  var vertexData = createCubeVertices();
  var indexData = createCubeIndices();

  const elementSize = vertexData.BYTES_PER_ELEMENT;
  const stride = (3 + 2) * elementSize;

  var vertexBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();

  if (!(vertexBuffer && indexBuffer)) {
    alert("Could not create buffers");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(
    a_TexCoord,
    2,
    gl.FLOAT,
    false,
    stride,
    3 * elementSize,
  );
  gl.enableVertexAttribArray(a_TexCoord);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  var i = 0;
  var tx = 0;
  var ty = 0;
  var s = 1;

  canvas.addEventListener("click", function (event) {
    g_isPaused = !g_isPaused;
  });

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowDown":
        ty -= 0.02;
        break;
      case "ArrowUp":
        ty += 0.02;
        break;
      case "ArrowLeft":
        tx -= 0.02;
        break;
      case "ArrowRight":
        tx += 0.02;
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

  /*
	document.getElementById("objFile").addEventListener("change", async (e) => {
	    const file = e.target.files[0];
	    const vertices = await readObj(file);
	    console.log(vertices);
	    vertexData = vertices;
	    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

	});
*/

  /************* U P D A T E ****************************/
  var tick = function () {
    if (g_isPaused) {
      requestAnimationFrame(tick);
      return;
    }

    i += 0.01;
    gl.clear(gl.COLOR_BUFFER_BIT);

    const T = createTranslation(tx, ty, 0);
    const R = createRotationXYZ(15 * i, 45 * i, 0);
    const S = createScale(s, s, 1);

    var xformMatrix = createTransformation({ T: T, R: R, S: S });
    xformMatrix = multiplyScalar(xformMatrix, i);

    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(tick);
  };

  var images = initializeTexture(gl, program);
  loadTexture(images[0]);
  loadTexture2(images[1]);
  tick();

  console.log("Finished...");
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCanvasElement() {
  const canvas = document.getElementById("example");
  if (!canvas) {
    console.log("No canvas found");
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
    alert("Could not compile shader:\n\n" + gl.getShaderInfoLog(shader));
    return;
  }
  gl.attachShader(program, shader);
  console.log("Compiled shader: " + type + " sucessfully");
}

function getWebGLContext(canvas) {
  const ctx = canvas.getContext("experimental-webgl");
  checkCtx(ctx);
  return ctx;
}

function checkCtx(ctx) {
  if ((ctx === null) & DEBUG) {
    alert("Unable to initialize webgl context");
  }
  return;
}

/*****************************************/

function initializeTexture(gl, program) {
  var texture = gl.createTexture();
  var texture2 = gl.createTexture();

  var u_Sampler = gl.getUniformLocation(program, "u_Sampler");
  var u_Sampler2 = gl.getUniformLocation(program, "u_Sampler2");

  var image = new Image();
  var image2 = new Image();

  image.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, 0);
  };

  image2.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.uniform1i(u_Sampler2, 1);
  };

  return [image, image2];
}

function loadTexture(image) {
  image.src =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA8RERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERH/wQARCAFoAWgDACIAAREAAhEA/8QApwABAAEFAQAAAAAAAAAAAAAAAAYBAwQFBwIQAAEEAAICCwgPBQQJBQAAAAABAgMEBRESEwYUISIjMTIzQlJiQUNRU2Nyc4MVJERUYYGCkpOio7Kzw9M0cZHC8GR04uMWJTWElKSxtNLB0eHx8hEBAQABAgIGBgcFCQAAAAAAAAECAxESMQQTIVFhcQUiMkGBkRRScoKhscEzQlNiohUjkrLC0uHw8f/aAAwDAAABAQIBAD8A6IAAAAAAAAAAAAAAAAAAAAAAAAAAABjWrdalHrrUzII+33fMby5HdkDJBF/9K8I0uXY9JqH6Bv6l6pej1tSdk7f66HewMkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPMkkcLFkmkZFE3lPle2Niee5zkah6OTY/emxLE3043cBXm2vGzo62Pn53gdEbjeFO1mrvQP1Ub5H7/oxt036vxhym1ZtY1ddK5cs89WxVzjrwJ3E/m8ZKLdKCCvrGrK56PY3Nyt0V0tLPeaO4XcMamrnd3dYxnyWs0i3c5wXKeU3nveLl2Wzym68zD6zUycj5Xd16vVnzWs4kLDXz4NbhuVXqrM8la7pt6deb4H9A2xYssSStM3sK9vnR78s455TKb3eXaWVbmV35+bqVazFbghsQrwczEkZ5q9Fe0nJcXjkWG38WjqJFSusgihkdwT4Y385wvThkN9V2T2YJGQ4tAxGe+oPvvZ3z1JkbryfgoxzZGtexzXse1HMe3kuKnpUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOJVlX2Sk1nLV9v5+/zO2nHcVj2hjthzs9BbW2fVWOFejfM30ZSzeWd/YpZvLPNcvtzqSdh0cn1/8AGYeFv3Z4vgZJ8xXMd983LmNcjo1VHMe1W6TV3rmPTce1e6it0XNcReJ7qllqu709Y5PN5Dyxh62GeK1j242fGJQUXLRfn1JFX9yMcevjz4lRU4lRd1FT4FaY1p+rrTu8nofSbwtSb2Tyjx/4wsL5qb0kX4bjZSRNnjdC7ifnor3Wvy3r0MPD2aFVq+Me+RPNTRjb9wzZJEhjfK7ijarsvC7ia343HrK+vdue+0852PV9q7d/YkWw626alPUeq505W6HwRTo7efPY4mJCNhld0dW3ad7omZH/AMP0/tybmWvgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEtk+DvvRMt1maViu3QdG3lzQcreeUjJaAOI0biR5QzLwXQf4r4HeT+6e8ThyeydE3JMmP89E3rvWMJ3juxyO5rLdJuhc30kkXvn/ADyB1ZNdG/D5uNyO1Gl0JGd7d8ot2cN4596eF514s2vFPvTwZtCbWV0YvKgyj9XvtAsYi5XaiqzlSP0/y4zDw96x22xrua3Shfn1uj9cy6vtm7Pa73FvY/4OYz7LSkPFnDncvvPNm2Vvx+LaIjIo0TNGxwsRuk5eJrEbxmvhinxu2ypW3kDN8+TLkeXk/KiPLI7GM221KvNfV/vEp1XDsNrYZXSCunpJe+TSdd56ww29bJXHHbzZFStHTrRVYdyKFiMb4V7T+0/pmQAXVwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5jsrw/alyPEIE0GWl3+inItx9P1p040WyWttnB7X9n9s/Q8v7LSA5PcVNc2dm92xHHZb2X98+1Mp67WwyPr2eV8owpf2Sn51qL68T/zDdzMZt7CI381tuON/ma6swtfw8f+/wB2t/Vnjf6XRMDw1uGUo2aPtmZussfpepNyAXVwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALFq5Voxa63MyCPtcp3mMbv5AL5SWaGuzWTSxwxpxySvbGz5z96c4v7MJ35sw6LUN98T879DzRFVbfxF+tk19jysz10Pkukd9SMK445ZXbGXK92Mt/J0yzsrwmDm3zWv7vF+sRu5sukswy146EbGTRvics0zpM2yI5nExsZpI8HdxzTonhbExXfWfkZrMMpt6EknpJXHi6mM/wCGZj0HpGXOY4fay/THdGVkdq4o9zRhV7mbm7pSaPK+Y0zo8UtskSXOu+Rio6N0lWCTVvza5Hx6TN5IjkbouJAlOo33ND8zS++497Wq+9q/xQsPPHj2er32Xs3lvNdno3P36mG/hLWNHstxhnvWb0kH6MsZs4Nmk3umjH/u8v6jTAdRpu46zPkK+P7jjFkwms7PVvliXuIqpI1Pic1HFZqY+Lxl0DWnK4ZeEtl/HGYp3U2T4RZ45nVX/wBrZqvtOZJA1zXojmuRzXbrXN3Wq3wnE5sLsx5rHozt8DN7J8bHlupiF7DZF2vNJBu7+B2axOXtwPPcsvKsTPT1NO7amFx85+ruIIjheymta4G7oVJ/Ge5pPncyS4qtgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABz/AB7ZIrVfSw5/hZPbav2dd35oG1xjZJDQV1epo2Lab127wMHnr4zyRztUvYrMs80jpXcTppdyNnYj/ShMinhmkiS2UVrdxWw7qOd4Fk6TEJAiIiI1qI1rcka1qIjUROJERN6iFvLU27J8/dGx6P0LLPbPV3xx5zGe1fPujBhw+rCjc2a6RM9KSXdaruxHyGInyzPzz/8ARACzbbzrb4aeGnOHTxmM7pzvnb61AAUXAAAAAALM0EVhNGZiP7iOXce3zXcovAclLJlLMpLLzlm8qL28NkgRZI110PGu5wkaeF6d1O202+C7IpaCtr2ldNS3Gt41kreZ4YvJGxTcNLew9HZzV25O3Vkiam4/wujROl1mF7HU37MvhWo6T0LaXU0eXPLT52eODr8Usc8bJoX6yKTkPb0ipyXAMbdhsuoncu0ZnJpf2eTxzOz406yio5EVFRUVM9wutWqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABpMbxRuF01kbktiXOOsxet3ZV7MQGi2S44sGnh1R/De6pfFMd3n0khF8PoIxGzzN3+46KNU5HdSR/a6rTHw+s6xI63Yzfv1dm/NddNnpOe/pP3xIi1nl+7PjW16F0aXbW1J46eN/z3/SAAstuHiSRkTHSSLosambl4/gRETuqrt61p7NDjD14CLo7+V3wuRWsb/ArjN7Is6+p1Ollqbb2bSS8rlbtFuXFpVVdTGxjO4siK96/yIbilHi9iDbO0NbX68axxS+dHC9/C/mEUjglkYsqRTbXY5rZp2xPdFDpL03pvGb070xjIo2RRt0I42NjY3ssMjgx7mi+l9I4uLrL37dnD8nOGuR6I5q5ouabqKioqK5Fa5Fycjkcmi5rt81xjW7TKkaOVNJ780jZnlmqcbneBqG4xWNkGKvbH7pqttyM8rrdRrPWs/BITirlW2ufEyKJrfNXSf95S1MPX293PzjZZ9Kv0Wa2M2zyvB3zHKc6q21iFyZkML362V+jHFDlH/XnyOJc3A8bhi1m2K1t/SrOz+pYcxnCGjwHOjjNPbkMkGtSRsWvjfHz0fBvZp+M5k64XuGdzVTX1plxdbnv9q1zWORJGI9qOTjRzHoqPY9qua6N7eUjmOQuCd0fsri7IdHVNsQu3vj3Q+2ftowY2U2tiQaGpdXSw1LO3KXf7UuWNAAUXmhxOnx2ok9OxE+1/8yWbE8V10fsbNzsLNKt6DxXqzB3FzRUzRc0VFTNFRUyVFReNFaRdyyYViEc8HenpNDnnvo+J0T/wXl/Ty37L8Gl6d0eYXrcJ6uV2zk5TLv8Ai7cC3BPHYghnh3Y542Ss62/bpFwuNaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqIma8XdXiREQ47iduTG8TdquZbwUHYrx8uf5e+mOg7Jre1MKmRvOWvarfWc99lpHP8Ih0WST9fgWeY3l/XPOV2lvyX9DSutq44e7nle7Gc25YxsbGxsTJjGo1qeBEPQBjJJJJJJOybSScpIAAKhrsQrLYhRzEzlhzc1qcb2ry2fv6TTYgrLtZVvU08dTDLDLllNr4d1esI2R0KeFNqWIZNZDre98HY1hgUtldurWbBLBFY1bNXFLpuY7e+N6MmR5nw+tO5Xqjo3rmrnxKjdJV6zVarS3FhdWNUc7WTL3ElVND5rGpmXusx29/k016BrcW0uHD9bfbs8l6tNZuyzYhbXhJ+Di6scPk/JFm7C7W17scaSurPjdJCvfI45Gy/wD7Nn/8IiImSIicSIgLXFeLi/DwbP6Nh1E0Lez623bxb78TE2RY1RxStVirMesjHrK+SRmi6JFZksBqG45jCRbXbenVi5tRMmOn3erPorYNvJTqzO0pIW6W6quaro1XztByNU9xVq8C5xQta7rZ6b/nP3yF3rJtyrXz0dqcXbqYcPfN+LbyWaFZa0GT+dldrJPg6rfi5RnAFm3e2tvhhNPDHDHljJIAAo9hq8Uh1lbWdKByOTwqx+8ehtC3K3WRSx9eKRv8WORCsu1WtXCamnnhffjZ+rdbD7etoTVPek32VjhPxdaTA5hsMk/1hYj8ZS0/o5ov1Dp5lIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5xs0m9sUa/i4JbH0z9X+QY9RiR1a7U8Sxy+dImsd9Z562Zxu9kK0vRfS1bfVzSla7tKvXcndgi+JUY1FQtanKebZ+jtus1L7+CSeVq8ACy3IAAAAAGJdmfXrSSM5ebGtVURURXrlpGWW5Y2zRvik5L0yVU40VFaqOT4UcjSs23m/hu8akyuGcxu2VxsxvdlZ2MajYWzXRzlzlYqsl8OeebXqnbaeblxK2jHGjXzvc1Gxruo1qrxvRHI5FXommdh96F66lHO40SWGRGKrfAqaSOQzaWHSRyJPZy0mrpMj0tPf9eQuWYy27zbnMYwMdXpOWOOj1WeOfZjnrZS8MxnPKb48NreLuKvxoUALTZAAAAAAUcqoyRyJnoRSyKiZJuRxOeq/E1HOKmrxOZI6+qRd/Ouj8hFar1Kyb2Ra1c5p6eee/LG2fa5T+pkbDW54nL/cJfxq51IhWw+osVSe473VJoR+ir9P5cukTUykYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARLZZS19BlhicJSk1nqZU0ZiH4VNrIXQeI/Ce7+SU645rXtcxzUcxyK1zXJm1zV6LjkGLYbNglxJIdLa73K6rJ2fe8vwoecpxRf6PrXR1Jn7vZy8ca3QMatZjsx6bNxzecjVeb/y16LzIzTwmNZtdqkeOUzxmWN3xvbLFQe445JlyhjklXybFXL97uQhtIsHtvy1ixQJ3UVVlkT5LMmfalZLeUec9XT0/2meOPhb63+Ges1BRVRONcvhVckJVHgtZuWtkmmXuojkiYvxR5P8AtTYR0KcXIrQ59ZzEe75z83HuaeXgw8un6M9mZ5+MkmPzy9ZBW79cmI56+CNrpF+o1TISradxVbHwZwvb99qE+RERMkT+BU9dX4/KLF9I393Sk+1nb+WMQZMPvr7kl+NYU/6ylfY6/wC9X/FLAv5pOAOrnffweP7R1f4el8s/96CrQvJ7km+Tq3fdlLLq9lvKrWE/fBJufwap0ADq53qz0jqe/Tw+HFPzc4VyIuSror4HIrV/g7JxX+s0OiOa16ZOajk8DkzQwZMNoye5o2+j4L8LQKXTvuvzmy9j6R077Wnnj442Z/nwISCRy4H4ix8iZus+uaa7Vkw+J01qWs2NM9HRler5XdyOFixJnIeODLu+TKx6X0fKb9bJ3zLfGz5sGWWOGN0si71v1ndVvaNHUrWMdvtZyI0RqSv6Neun5hZa23jNtkELN1eQzNdXCzpSyu++861heGwYXWSCLfOXfTSq3J0sn/t1GF7DHhanpXSeuvDj+zxvZ/N/Mz4Yo4Io4Ym6EUTGxsZ2WHsA9sIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALFmpBdhfXsRpJE/lZ/eZ0mecXwBya/g+IYLNtuo6V9fx8fORdiwzxf2Bs8O2RYduNxKhBG/31BXY5nrIegdGI3iGxrDbvCNatOfxlfkfLgCsyyx9nK/Buq1mrZj06k8M0aZJwT2ro/A5qb5i9lxlHLLGxbF6cmtpvbY0VVWSV5dr2G9rJ7kLDMc2QYYrWWHTdmPEK7t/67RjmCjrQIBW2ae/KXrKsn5JKaWO4XdybFbY2VcuBm4GTzG6znPUgbYAAAAAALc00NeJ01iVkMTOnI7RaBcH/ANqpB72zCCP/AGfCs7vHz8FD8znZCLyWcex52i3bFiJXaOrgZqqjfScUX/EOAmmJbKKlPSiqaNyx/wAvH58nfPUkGjixTZFc0s1ld3yV2ba9ZnV/wEjw/Ye7eyYlKn91rr+LP+iT2GvBViZBXjZDEzoRoBgYZhVfC6+qh30juendzkzv5I+ow2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoqI5FRURUXjaqJl/AqANRZwHCLPLows9B7X/AIxb2GNy0qVtU8lcTS+2iJ8AOVxXcc2OyMitRyPreKmdrIHt/s9jvZ0PDMUq4rDrYF33fYO+RGwmgisRPhmjZLE/lsecuxKnPsbxCG5S/ZpOb/nqzdkDqQLVSzHcrQWoubnj1n+D5BdAwsQvQ4dVktTcTOQzpSSLyI2fvOaxV8V2T2Vllfq60bv93r+Tgj75MbbZYstm9hmGt79vm+lsTbXZ9GTutWip14q0LdCKFmixv8AM7yj+U8DSUtjeF005jbUvjbPCfY80SBERERETJE4k7n7kKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHdlUbH4LZf0oX15I/p4oiREA2XYjyMLh5emyWx+RAButibnew8fk57DI/N0ySmtwiptDDalV3LZHwvpZOFk+ubICD7LkWvPhGI6P7PY/z4SboqKiKnwKioQXZbMk+0cLg4SzJYbJodXS0oYE9Y6UnTG6DGt7jWtagFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANJjeKphVTWMyWxLnHXYvW7sq9mMDBx7HWYaxa9fJ11//Lt8ZL2uow0uxzBpJpWYte0uVrq7ZOcml5e2pPyjH2P4O7EZPZPEOFi1nBtk91y+Mk8iTHG8VTCq7NBmttWM460Xa67gNnau1KEWttzxwN7XK9WzvhCp9kl6/JtbAqkj3+PkZyfkc1D59g909jk1x+3cdmlnnf7n0/6+irk0gggrRpFXhjgiTiZGzQaBHMGwJaUi3bsm2MQk6elrNTpcrf8AfJfKkoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcs2XyOdiccWe8hqxaPnSPeqvOpnOtmVJ2sr3u96vasn4kYHRK8MdaGKvFzcMbImfIIbiCazZbhUcvN7U1n/ffmm4wLE24lRj0n+2YGsjs/reuMfH8Omsai9S/bsPfrYvKgSMGuwzE4cTrJPHvX8meHpwy/wDibEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFqxWhtwy152JJDK3Rez+vqF0Acmt07+xu62zXe50Gkurn0d49vve00n2E45WxWPxNlvOV/0vGRm6kijmjdFKxskb969j26TTmeMbHZsOct/DXSamPhPL1O2x/igJdfwqTX+yWFcDe77F3i92JjPw7EosQi6UM8PB2qknO1puo80uAY+3EWpVtb24zk9FtlvX9L12FzGW+x00OOQcqJ7Ib7G9/qS6Mf0kYEmBRFRURUXNF4l7mXHmmRUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADlGP0VwfEobVPgo5l2xX0e9TRc5Hl4smWL247Oxua30bFWu7zXyyRfhmBsy0dpVOvtr8l5oqL/ZSvguCR83FrbeIei2zNwX0QHSqLXMpVGP5e1a+n52pL4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANRjGKR4VV1nLnk/Z4uu/rO8nGBBtl9tJb0VX3nHv/S2N9+FokxwHCEwurwv7XY30/Z6sHqyA4FUkxXF2zTb9sUq3bT+vJp7xnrJjroAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4tjd11/E7EqSa2Nr9TW0M1bqmcnQ9IdD2UYhtLD9THz13gWei90PInsVw3bVtbsreApK3V9u10PoQJrgWGJhtFjXp7Zm4WyvbXvPqjegAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcn2WWdbiz4vekEMX0jdsfmHRMGpbQw2tBlwmr1s/ppeWc1xmPT2R2Ipe+W6rfVyMrnXgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5vsvoPisxYjE3eStZFLo9GeLm3/MJ5h12PEKcFpnfGb9nUl75H8hxfsV4bMMkE8aSQytVsjHcSp8WTkVOi5vJcY2H4fWwyBa9XT1ayOlc6R2m5ZHaLc/msAzgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//2Q==";
}

function loadTexture2(image) {
  image.src =
    "data:image/jpeg;base64,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";
}
