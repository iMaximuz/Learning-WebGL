class Shader{

    constructor(vertexShaderSource, fragmentShaderSource){
        this.vsSource = vertexShaderSource;
        this.fsSource = fragmentShaderSource;
        
        let vs = this._createShader(gl.VERTEX_SHADER, this.vsSource);
        let fs = this._createShader(gl.FRAGMENT_SHADER, this.fsSource);
        this.program = this._createProgram(vs, fs);
    }

    _createShader(type, source){
        let shader = gl.createShader(type);
        gl.shaderSource(source);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(!success){
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    _createProgram(vertexShader, fragmentShader){
        let program = gl.createProgram();
        gl.attachShader(vertexShader);
        gl.attachShader(fragmentShader);

        gl.bindAttribLocation(shaderProgram, 0, "a_position" );
        gl.bindAttribLocation(shaderProgram, 1, "a_color" );

        gl.linkProgram(program);
        let success = gl.getProgramParameter(shader, gl.LINK_STATUS);
        if(!success){
            console.error(gl.getPrograInfoLog(program))
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    getAttributeLocation(attribName){
        return gl.getAttribLocation(this.program, attribName);
    }

    getUniformLocation(uniformName){
        return gl.getUniformLocation(this.program, uniformName);
    }

    setMatrixUniforms(mModel, mView, mPerspective){
        gl.uniformMatrix4fv(this.getUniformLocation("u_model"), false, mModel);
        gl.uniformMatrix4fv(this.getUniformLocation("u_view"), false, mView);
        gl.uniformMatrix4fv(this.getUniformLocation("u_perspective"), false, mPerspective);
    }
}

function setMatrixUniforms(shaderProgram, perspectiveMatrix, modelViewMatrix) {
    gl.uniformMatrix4fv(shaderProgram.perspMatUniform, false, perspectiveMatrix);
    gl.uniformMatrix4fv(shaderProgram.modelViewMatUniform, false, modelViewMatrix);
}

function getShader(gl, id){

    let shaderScript = $('#'+id);
    if(!shaderScript)
        return null;
    
    let shaderText = shaderScript.text();
    let shaderType = shaderScript.attr('type');

    let shader;
    if(shaderType == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if(shaderType == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderText);
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
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "a_color");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.perspMatUniform = gl.getUniformLocation(shaderProgram, "u_perspective");
    shaderProgram.modelViewMatUniform = gl.getUniformLocation(shaderProgram, "u_modelView");
    return shaderProgram;
}