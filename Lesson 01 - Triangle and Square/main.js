
/*const gl = (function(){
    let canvas = $('canvas')[0];

})();*/

let gl;

function resize(canvas){
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    if (canvas.width != displayWidth || canvas.height != displayHeight){
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
}

function webGLStart(){
    let canvas = $('canvas')[0];
    initGL(canvas);
    
    let shaderProgram = initShaders();
    initBuffers(shaderProgram);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    resize(gl.canvas);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    drawScene(shaderProgram);
}

function initGL(canvas) {
    gl = canvas.getContext("webgl");
    if(!gl){
        gl = canvas.getContext("experimental-webgl");
    }

    if(!gl){
        console.error('Your browser does not support webgl.')
    }
    else{
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
}

function getShader(gl, id){
    let shaderScript = $('#'+id)[0];
    if(!shaderScript)
        return null;
    
    let str = "";
    let k = shaderScript.firstChild;
    while(k){
        if(k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling
    }

    let shader;
    if(shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if(shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {

    let fragmentShader = getShader(gl, "shader-fs");
    let vertexShader = getShader(gl, "shader-vs");

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        console.error("Could not initialize shaders");
    
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.perspMatUniform = gl.getUniformLocation(shaderProgram, "perspectiveMatrix");
    shaderProgram.modelViewMatUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
    return shaderProgram;
}

let triangleVertexPositionBuffer;
let squareVertexPositionBuffer;
function initBuffers(shaderProgram) {
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    let vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3; // Number of floats per vertex
    triangleVertexPositionBuffer.numItems = 3; // Number of vertex

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3; // Number of floats per vertex
    squareVertexPositionBuffer.numItems = 4; // Number of vertex
    
}

function setMatrixUniforms(shaderProgram, perspectiveMatrix, modelViewMatrix) {
    gl.uniformMatrix4fv(shaderProgram.perspMatUniform, false, perspectiveMatrix);
    gl.uniformMatrix4fv(shaderProgram.modelViewMatUniform, false, modelViewMatrix);
}

function drawScene(shaderProgram) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let perspectiveMat = mat4.create();
    let modelViewMat = mat4.create();

    mat4.perspective(perspectiveMat, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    mat4.identity(modelViewMat);

    mat4.translate(modelViewMat, modelViewMat, [-1.5, 0.0, -7.0]);
    
    setMatrixUniforms(shaderProgram, perspectiveMat, modelViewMat);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(
        shaderProgram.vertexPositionAttribute, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        triangleVertexPositionBuffer.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the begining of a  single vertex to this attribute
    );
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

    
    mat4.translate(modelViewMat, modelViewMat, [3.0, 0.0, 0.0]);
    setMatrixUniforms(shaderProgram, perspectiveMat, modelViewMat);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(
        shaderProgram.vertexPositionAttribute, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        squareVertexPositionBuffer.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the begining of a  single vertex to this attribute
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
    
}

$(document).ready(webGLStart);