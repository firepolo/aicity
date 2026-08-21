#version 100

precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main()
{
	vTexCoord = aTexCoord;
	gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}