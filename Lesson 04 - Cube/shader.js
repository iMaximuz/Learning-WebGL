class Shader{

    constructor(vertexShaderSource, fragmentShaderSource){
        this.vsSource = vertexShaderSource;
        this.fsSource = fragmentShaderSource;
        
        let vs = this._createShader(gl.VERTEX_SHADER, this.vsSource);
        let fs = this._createShader(gl.FRAGMENT_SHADER, this.fsSource);
        this.program = this._createProgram(vs, fs);
        this.attributes = this._getAttributeLocations(['a_position', 'a_color']);
        this.uniforms = this._getUniformLocations(['u_model', 'u_view', 'u_perspective']);
        this.binded = false;
    }

    setMatrixUniforms(mModel, mView, mPerspective){
        gl.uniformMatrix4fv(this.uniforms["u_model"], false, mModel);
        gl.uniformMatrix4fv(this.uniforms["u_view"], false, mView);
        gl.uniformMatrix4fv(this.uniforms["u_perspective"], false, mPerspective);
    }

    bind(){
        gl.useProgram(this.program);
        this.binded = true;
    }
    unbind(){
        gl.useProgram(null);
        this.binded = false;
    }

    _createShader(type, source){
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
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
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.bindAttribLocation(program, 0, "a_position" );
        gl.bindAttribLocation(program, 1, "a_color" );

        gl.linkProgram(program);
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(!success){
            console.error(gl.getPrograInfoLog(program))
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    _getLocations(type, values){
        let result = {};
        for(let name of values){
            let location;
            if(type == 'attribute')
                location = gl.getAttribLocation(this.program, name);
            else if(type == 'uniform')
                location = gl.getUniformLocation(this.program, name);
            result[name] = location;
        }
        return result;
    }

    _getAttributeLocations(attributes){
        return this._getLocations('attribute', attributes);
    }

    _getUniformLocations(uniforms){
        return this._getLocations('uniform', uniforms);
    }
}